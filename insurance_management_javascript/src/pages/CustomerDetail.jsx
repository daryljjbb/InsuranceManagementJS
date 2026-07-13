/**
 * CustomerDetail.jsx (Upgraded)
 * ----------------------------
 * This version adds:
 *  - Create Policy Modal
 *  - Create Invoice Modal
 *  - Create Payment Modal
 *  - Clean Bootstrap UI
 *  - Heavy comments + debugging
 *  - No DOM selectors
 *  - Pure React state
 */

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { DB, formatMoney } from "../services/db";

const CustomerDetail = () => {
  /* ------------------------------------------------------
     STEP 1: Get customer ID from URL
     ------------------------------------------------------ */
  const { id } = useParams();
  const customerId = parseInt(id || "0");

  console.log("[DEBUG] CustomerDetail loaded for:", customerId);

  /* ------------------------------------------------------
     STEP 2: Load customer
     ------------------------------------------------------ */
  const [customer] = useState(() => {
    try {
      const found = DB.findOne("customers", customerId);
      console.log("[DEBUG] Found customer:", found);
      return found;
    } catch (err) {
      console.error("[ERROR] Failed to load customer:", err);
      return undefined;
    }
  });

  /* ------------------------------------------------------
     STEP 3: State for policies, invoices, payments
     ------------------------------------------------------ */
  const [policies, setPolicies] = useState([]);
  const [invoices, setInvoices] = useState([]);

  /* ------------------------------------------------------
     STEP 4: Modal visibility
     ------------------------------------------------------ */
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  /* ------------------------------------------------------
     STEP 5: Modal forms
     ------------------------------------------------------ */
  const [policyForm, setPolicyForm] = useState({
    type: "",
    premium: "",
    fee: "",
  });

  const [invoiceForm, setInvoiceForm] = useState({
    policyId: "",
    invoiceType: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    invoiceId: "",
    amount: "",
  });

  /* ------------------------------------------------------
     STEP 6: Load policies + invoices
     ------------------------------------------------------ */
  useEffect(() => {
    try {
      console.log("[INFO] Loading policies + invoices for:", customerId);

      const allPolicies = DB.get("policies").filter(
        (p) => p.customerId === customerId
      );

      const allInvoices = DB.get("invoices").filter((inv) =>
        allPolicies.some((p) => p.policyId === inv.policyId)
      );

      setPolicies(allPolicies);
      setInvoices(allInvoices);

      console.log("[DEBUG] Policies:", allPolicies);
      console.log("[DEBUG] Invoices:", allInvoices);
    } catch (err) {
      console.error("[ERROR] Failed loading data:", err);
    }
  }, [customerId]);

  /* ------------------------------------------------------
     STEP 7: Add Policy
     ------------------------------------------------------ */
  const addPolicy = (e) => {
    e.preventDefault();
    console.log("[INFO] Adding policy...");

    try {
      const newPolicy = {
        policyId: Date.now(),
        customerId,
        type: policyForm.type,
        premium: parseFloat(policyForm.premium) || 0,
        agencyFee: parseFloat(policyForm.fee) || 0,
        dateAdded: new Date().toISOString(),
      };

      const updated = [...DB.get("policies"), newPolicy];
      DB.save("policies", updated);

      setPolicies(updated.filter((p) => p.customerId === customerId));
      setPolicyForm({ type: "", premium: "", fee: "" });
      setShowPolicyModal(false);

      console.log("[SUCCESS] Policy added:", newPolicy);
    } catch (err) {
      console.error("[ERROR] Failed to add policy:", err);
      alert("Error adding policy.");
    }
  };

  /* ------------------------------------------------------
     STEP 8: Generate Invoice
     ------------------------------------------------------ */
  const generateInvoice = (e) => {
    e.preventDefault();
    console.log("[INFO] Generating invoice...");

    try {
      const policy = policies.find(
        (p) => p.policyId === parseInt(invoiceForm.policyId)
      );
      if (!policy) throw new Error("Policy not found.");

      const invType = invoiceForm.invoiceType;

      const lineItems = [];
      if (invType.includes("PREMIUM") && policy.premium > 0)
        lineItems.push({ label: "Premium", amount: policy.premium });

      if (invType.includes("FEE") && policy.agencyFee > 0)
        lineItems.push({ label: "Agency Fee", amount: policy.agencyFee });

      if (lineItems.length === 0) {
        alert("Nothing to bill for this selection.");
        return;
      }

      const newInvoice = {
        invoiceId: Date.now(),
        policyId: policy.policyId,
        invoiceType: invType,
        lineItems,
        amountDue: lineItems.reduce((sum, item) => sum + item.amount, 0),
        amountPaid: 0,
        status: "OPEN",
        dateGenerated: new Date().toLocaleDateString(),
        payments: [],
      };

      const updated = [...DB.get("invoices"), newInvoice];
      DB.save("invoices", updated);

      setInvoices(updated.filter((i) => i.policyId === policy.policyId));
      setInvoiceForm({ policyId: "", invoiceType: "" });
      setShowInvoiceModal(false);

      console.log("[SUCCESS] Invoice generated:", newInvoice);
    } catch (err) {
      console.error("[ERROR] Failed to generate invoice:", err);
      alert("Error generating invoice.");
    }
  };

  /* ------------------------------------------------------
     STEP 9: Apply Payment
     ------------------------------------------------------ */
  const applyPayment = (e) => {
    e.preventDefault();
    console.log("[INFO] Applying payment...");

    try {
      const invoiceId = parseInt(paymentForm.invoiceId);
      const amount = parseFloat(paymentForm.amount);

      const allInvoices = DB.get("invoices");
      const inv = allInvoices.find((i) => i.invoiceId === invoiceId);

      if (!inv) throw new Error("Invoice not found.");

      const payment = {
        paymentId: Date.now(),
        invoiceId,
        amount,
        datePaid: new Date().toLocaleDateString(),
      };

      inv.payments.push(payment);
      inv.amountPaid += amount;
      inv.status =
        inv.amountPaid >= inv.amountDue ? "PAID" : "PARTIALLY_PAID";

      DB.save("invoices", allInvoices);

      setInvoices(allInvoices.filter((i) => i.policyId === inv.policyId));
      setPaymentForm({ invoiceId: "", amount: "" });
      setShowPaymentModal(false);

      console.log("[SUCCESS] Payment applied:", payment);
    } catch (err) {
      console.error("[ERROR] Failed to apply payment:", err);
      alert("Error applying payment.");
    }
  };

  /* ------------------------------------------------------
     STEP 10: Missing customer
     ------------------------------------------------------ */
  if (!customer) {
    return (
      <div className="container mt-5">
        <h3>Customer not found.</h3>
      </div>
    );
  }

  /* ------------------------------------------------------
     STEP 11: Render UI
     ------------------------------------------------------ */
  return (
    <div className="container mt-5">

      <h1 className="mb-4 text-brand">
        {customer.first_name} {customer.last_name}
      </h1>

      {/* ACTION BUTTONS */}
      <div className="d-flex gap-3 mb-4">
        <button className="btn btn-brand" onClick={() => setShowPolicyModal(true)}>
          + Add Policy
        </button>

        <button className="btn btn-warning" onClick={() => setShowInvoiceModal(true)}>
          + Generate Invoice
        </button>

        <button className="btn btn-info text-white" onClick={() => setShowPaymentModal(true)}>
          + Apply Payment
        </button>
      </div>

      {/* POLICIES */}
      <h3 className="mt-4">Policies</h3>
      <ul className="list-group mb-4">
        {policies.map((p) => (
          <li key={p.policyId} className="list-group-item">
            <strong>{p.type}</strong> — Premium: {formatMoney(p.premium)} — Fee:{" "}
            {formatMoney(p.agencyFee)}
          </li>
        ))}
      </ul>

      {/* INVOICES */}
      <h3 className="mt-4">Invoices</h3>
      <ul className="list-group mb-4">
        {invoices.map((inv) => (
          <li key={inv.invoiceId} className="list-group-item">
            <strong>{inv.invoiceType}</strong> — Due: {formatMoney(inv.amountDue)} — Paid:{" "}
            {formatMoney(inv.amountPaid)} — Status: {inv.status}
          </li>
        ))}
      </ul>

      {/* ------------------------------------------------------
         MODALS
         ------------------------------------------------------ */}

      {/* POLICY MODAL */}
      {showPolicyModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">Add Policy</h5>
                <button className="btn-close" onClick={() => setShowPolicyModal(false)}></button>
              </div>

              <form onSubmit={addPolicy}>
                <div className="modal-body">

                  <input
                    className="form-control mb-3"
                    placeholder="Policy Type"
                    value={policyForm.type}
                    onChange={(e) => setPolicyForm({ ...policyForm, type: e.target.value })}
                    required
                  />

                  <input
                    type="number"
                    className="form-control mb-3"
                    placeholder="Premium"
                    value={policyForm.premium}
                    onChange={(e) => setPolicyForm({ ...policyForm, premium: e.target.value })}
                    required
                  />

                  <input
                    type="number"
                    className="form-control mb-3"
                    placeholder="Agency Fee"
                    value={policyForm.fee}
                    onChange={(e) => setPolicyForm({ ...policyForm, fee: e.target.value })}
                    required
                  />

                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowPolicyModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-brand">Save Policy</button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* INVOICE MODAL */}
      {showInvoiceModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">Generate Invoice</h5>
                <button className="btn-close" onClick={() => setShowInvoiceModal(false)}></button>
              </div>

              <form onSubmit={generateInvoice}>
                <div className="modal-body">

                  <select
                    className="form-control mb-3"
                    value={invoiceForm.policyId}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, policyId: e.target.value })}
                    required
                  >
                    <option value="">Select Policy</option>
                    {policies.map((p) => (
                      <option key={p.policyId} value={p.policyId}>
                        {p.type}
                      </option>
                    ))}
                  </select>

                  <select
                    className="form-control mb-3"
                    value={invoiceForm.invoiceType}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceType: e.target.value })}
                    required
                  >
                    <option value="">Select Invoice Type</option>
                    <option value="PREMIUM">Premium Only</option>
                    <option value="FEE">Agency Fee Only</option>
                    <option value="PREMIUM+FEE">Premium + Fee</option>
                  </select>

                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowInvoiceModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-warning">Generate Invoice</button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">Apply Payment</h5>
                <button className="btn-close" onClick={() => setShowPaymentModal(false)}></button>
              </div>

              <form onSubmit={applyPayment}>
                <div className="modal-body">

                  <select
                    className="form-control mb-3"
                    value={paymentForm.invoiceId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, invoiceId: e.target.value })}
                    required
                  >
                    <option value="">Select Invoice</option>
                    {invoices.map((inv) => (
                      <option key={inv.invoiceId} value={inv.invoiceId}>
                        {inv.invoiceType} — Due {formatMoney(inv.amountDue)}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    className="form-control mb-3"
                    placeholder="Payment Amount"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    required
                  />

                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-info text-white">Apply Payment</button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerDetail;
