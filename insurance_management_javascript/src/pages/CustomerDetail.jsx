/**
 * CustomerDetail.jsx (Accordion Version)
 * --------------------------------------
 * ✅ Pure JavaScript + Bootstrap Accordion
 * ✅ Customer info card
 * ✅ Policy → Invoice → Payment hierarchy
 * ✅ Prevents overpayments
 * ✅ Beginner-friendly comments + debugging
 */

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { DB, formatMoney } from "../services/db";

const CustomerDetail = () => {
  // --- STEP 1: Get customer ID from URL ---
  const { id } = useParams();
  const customerId = parseInt(id || "0");
  console.log("[DEBUG] Loaded CustomerDetail for customerId:", customerId);

  // --- STEP 2: Load customer safely ---
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

  // --- STEP 3: State for policies, invoices, and form ---
  const [policies, setPolicies] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [policyForm, setPolicyForm] = useState({ type: "", premium: "", fee: "" });

  // --- STEP 4: Load policies + invoices ---
  useEffect(() => {
    try {
      console.log("[INFO] Loading policies + invoices for:", customerId);
      const allPolicies = DB.get("policies").filter(p => p.customerId === customerId);
      const allInvoices = DB.get("invoices").filter(inv =>
        allPolicies.some(p => p.policyId === inv.policyId)
      );
      setPolicies(allPolicies);
      setInvoices(allInvoices);
      console.log("[DEBUG] Policies:", allPolicies);
      console.log("[DEBUG] Invoices:", allInvoices);
    } catch (err) {
      console.error("[ERROR] Failed loading data:", err);
    }
  }, [customerId]);

  // --- STEP 5: Add Policy ---
  const addPolicy = (e) => {
    e.preventDefault();
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
      setPolicies(updated.filter(p => p.customerId === customerId));
      setPolicyForm({ type: "", premium: "", fee: "" });
      console.log("[SUCCESS] Policy added:", newPolicy);
    } catch (err) {
      console.error("[ERROR] Failed to add policy:", err);
      alert("Error adding policy.");
    }
  };

  // --- STEP 6: Generate Invoice ---
  const generateInvoice = (policy, type) => {
    try {
      console.log("[INFO] Generating invoice for policyId:", policy.policyId);
      const lineItems = [];
      if (type.includes("PREMIUM") && policy.premium > 0)
        lineItems.push({ label: "Premium", amount: policy.premium });
      if (type.includes("FEE") && policy.agencyFee > 0)
        lineItems.push({ label: "Agency Fee", amount: policy.agencyFee });
      if (lineItems.length === 0) {
        alert("Nothing to bill for this selection.");
        return;
      }
      const newInvoice = {
        invoiceId: Date.now(),
        policyId: policy.policyId,
        invoiceType: type,
        lineItems,
        amountDue: lineItems.reduce((sum, item) => sum + item.amount, 0),
        amountPaid: 0,
        status: "OPEN",
        dateGenerated: new Date().toLocaleDateString(),
        payments: [],
      };
      const updated = [...DB.get("invoices"), newInvoice];
      DB.save("invoices", updated);
      setInvoices(updated.filter(i => i.policyId === policy.policyId));
      console.log("[SUCCESS] Invoice generated:", newInvoice);
    } catch (err) {
      console.error("[ERROR] Failed to generate invoice:", err);
      alert("Error generating invoice.");
    }
  };

  // --- STEP 7: Apply Payment (prevent overpayment) ---
  const applyPayment = (invoiceId, amount) => {
    try {
      const allInvoices = DB.get("invoices");
      const inv = allInvoices.find(i => i.invoiceId === invoiceId);
      if (!inv) throw new Error("Invoice not found.");
      const remaining = inv.amountDue - inv.amountPaid;
      if (amount > remaining) {
        alert(`Overpayment not allowed. Remaining balance: ${formatMoney(remaining)}`);
        return;
      }
      const payment = {
        paymentId: Date.now(),
        invoiceId,
        amount,
        datePaid: new Date().toLocaleDateString(),
      };
      inv.payments.push(payment);
      inv.amountPaid += amount;
      inv.status = inv.amountPaid >= inv.amountDue ? "PAID" : "PARTIALLY_PAID";
      DB.save("invoices", allInvoices);
      setInvoices(allInvoices.filter(i => i.policyId === inv.policyId));
      console.log("[SUCCESS] Payment applied:", payment);
    } catch (err) {
      console.error("[ERROR] Failed to apply payment:", err);
      alert("Error applying payment.");
    }
  };

  // --- STEP 8: Handle missing customer ---
  if (!customer) {
    return <div className="container mt-5">Customer not found.</div>;
  }

  /* ------------------------------------------------------
     STEP 11: Render UI
     ------------------------------------------------------ */
 return (
  <div className="container mt-4">
    {/* Back to Dashboard */}
    <Link to="/" className="btn btn-link p-0 mb-3 text-decoration-none">
      ← Back to Dashboard
    </Link>

    <div className="row">
      {/* LEFT COLUMN: Customer Info + Add Policy */}
      <div className="col-md-4">
        {/* Customer Info */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-primary text-white">Customer Info</div>
          <div className="card-body">
            <h3>{customer.first_name} {customer.last_name}</h3>
            <p className="text-muted mb-0">Age: {customer.age}</p>
            <small className="text-muted">ID: {customer.id}</small>
          </div>
        </div>

        {/* Add Policy Form */}
        <div className="card shadow-sm">
          <div className="card-header bg-dark text-white">Add Policy / Fee</div>
          <div className="card-body">
            <form onSubmit={addPolicy}>
              <input
                className="form-control mb-2"
                placeholder="Type (e.g. Auto)"
                value={policyForm.type}
                onChange={e => setPolicyForm({ ...policyForm, type: e.target.value })}
                required
              />
              <div className="row g-2 mb-3">
                <div className="col">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Premium"
                    value={policyForm.premium}
                    onChange={e => setPolicyForm({ ...policyForm, premium: e.target.value })}
                  />
                </div>
                <div className="col">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Agency Fee"
                    value={policyForm.fee}
                    onChange={e => setPolicyForm({ ...policyForm, fee: e.target.value })}
                  />
                </div>
              </div>
              <button className="btn btn-success w-100">Add to Profile</button>
            </form>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Accordion for Policies, Invoices, Payments */}
      <div className="col-md-8">
        <div className="accordion" id="policyAccordion">
          {policies.map(p => {
            const policyInvoices = invoices.filter(inv => inv.policyId === p.policyId);
            return (
              <div className="accordion-item" key={p.policyId}>
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse-${p.policyId}`}
                  >
                    {p.type} • {policyInvoices.length} Invoices
                  </button>
                </h2>

                <div
                  id={`collapse-${p.policyId}`}
                  className="accordion-collapse collapse"
                  data-bs-parent="#policyAccordion"
                >
                  <div className="accordion-body">
                    {/* Create Invoice UI */}
                    <div className="bg-light p-3 rounded mb-3">
                      <h6>New Invoice</h6>
                      <div className="input-group">
                        <select className="form-select" id={`type-${p.policyId}`}>
                          <option value="PREMIUM_PLUS_AGENCY_FEE">Premium + Fee</option>
                          <option value="PREMIUM_ONLY">Premium Only</option>
                          <option value="AGENCY_FEE_ONLY">Fee Only</option>
                        </select>
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            const select = document.getElementById(`type-${p.policyId}`);
                            const type = select ? select.value : "PREMIUM_PLUS_AGENCY_FEE";
                            generateInvoice(p, type);
                          }}
                        >
                          Create
                        </button>
                      </div>
                    </div>

                    {/* Existing Invoices List */}
                    {policyInvoices.map(inv => (
                      <div className="card mb-3 border-info" key={inv.invoiceId}>
                        <div className="card-header d-flex justify-content-between align-items-center">
                          <span>Invoice #INV-{inv.invoiceId}</span>
                          <span
                            className={`badge ${
                              inv.status === "PAID"
                                ? "bg-success"
                                : "bg-warning text-dark"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>

                        <div className="card-body">
                          <p className="mb-1">
                            <strong>Due: {formatMoney(inv.amountDue)}</strong>
                          </p>
                          <p className="small text-muted mb-3">
                            Paid: {formatMoney(inv.amountPaid)} | Remaining:{" "}
                            {formatMoney(inv.amountDue - inv.amountPaid)}
                          </p>

                          {/* Payment Input */}
                          {inv.status !== "PAID" && (
                            <div className="input-group input-group-sm mb-3">
                              <input
                                type="number"
                                className="form-control"
                                placeholder="Pay amount"
                                id={`pay-val-${inv.invoiceId}`}
                              />
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => {
                                  const input = document.getElementById(`pay-val-${inv.invoiceId}`);
                                  const val = parseFloat(input?.value || "0");
                                  if (val > 0) applyPayment(inv.invoiceId, val);
                                }}
                              >
                                Submit Payment
                              </button>
                            </div>
                          )}

                          {/* Payment History */}
                          {inv.payments.length > 0 && (
                            <div className="mt-2">
                              <small className="fw-bold">Payment History:</small>
                              {inv.payments.map(pmt => (
                                <div key={pmt.paymentId} className="small text-success">
                                  • {formatMoney(pmt.amount)} on {pmt.datePaid}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);
};


export default CustomerDetail;
