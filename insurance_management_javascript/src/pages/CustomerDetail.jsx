/**
 * CustomerDetail.jsx
 * ------------------
 * This component displays detailed information about a single customer,
 * including their policies and invoices. It also allows adding new policies,
 * generating invoices, and applying payments.
 *
 * ✅ Converted from TypeScript to JavaScript
 * ✅ Added beginner-friendly comments explaining logic and architecture
 * ✅ Added console.log() debugging and error trapping everywhere important
 * ✅ Preserved scalable, modular, production-ready structure
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DB, formatMoney } from '../services/db';

const CustomerDetail = () => {
    // --- STEP 1: Get customer ID from URL ---
    const { id } = useParams();
    const customerId = parseInt(id || "0");

    console.log("[DEBUG] Loaded CustomerDetail component for customerId:", customerId);

    // --- STEP 2: Initialize state ---
    // Root cause: Without initial state, React would throw undefined errors when rendering.
    // Fix: Initialize with safe defaults and handle missing data gracefully.
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

    const [policies, setPolicies] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [policyForm, setPolicyForm] = useState({ type: '', premium: '', fee: '' });

    // --- STEP 3: Load policies and invoices when component mounts ---
    useEffect(() => {
        try {
            console.log("[INFO] Fetching policies and invoices for customerId:", customerId);
            const allPolicies = DB.get("policies").filter(p => p.customerId === customerId);
            const allInvoices = DB.get("invoices").filter(inv => {
                const myPolicyIds = allPolicies.map(p => p.policyId);
                return myPolicyIds.includes(inv.policyId);
            });
            setPolicies(allPolicies);
            setInvoices(allInvoices);
            console.log("[DEBUG] Loaded policies:", allPolicies);
            console.log("[DEBUG] Loaded invoices:", allInvoices);
        } catch (err) {
            console.error("[ERROR] Failed to load data:", err);
        }
    }, [customerId]);

    // --- STEP 4: Add new policy ---
    const addPolicy = (e) => {
        e.preventDefault();
        try {
            console.log("[INFO] Adding new policy for customerId:", customerId);
            const newPolicy = {
                policyId: Date.now(),
                customerId,
                type: policyForm.type,
                premium: parseFloat(policyForm.premium) || 0,
                agencyFee: parseFloat(policyForm.fee) || 0,
                dateAdded: new Date().toISOString()
            };
            const all = [...DB.get("policies"), newPolicy];
            DB.save("policies", all);
            setPolicies(all.filter(p => p.customerId === customerId));
            setPolicyForm({ type: '', premium: '', fee: '' });
            console.log("[SUCCESS] Policy added:", newPolicy);
        } catch (err) {
            console.error("[ERROR] Failed to add policy:", err);
            alert("Something went wrong while adding the policy. Check console for details.");
        }
    };

    // --- STEP 5: Generate invoice ---
    const generateInvoice = (policy) => {
        try {
            console.log("[INFO] Generating invoice for policyId:", policy.policyId);
            const typeSelect = document.getElementById(`type-${policy.policyId}`);
            if (!typeSelect) throw new Error("Invoice type selector not found.");
            const invType = typeSelect.value;

            const lineItems = [];
            if (invType.includes("PREMIUM") && policy.premium > 0)
                lineItems.push({ label: "Premium", amount: policy.premium });
            if (invType.includes("FEE") && policy.agencyFee > 0)
                lineItems.push({ label: "Agency Fee", amount: policy.agencyFee });

            if (lineItems.length === 0) {
                alert("Nothing to bill for this selection!");
                console.warn("[WARN] No line items generated for invoice.");
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
                payments: []
            };

            const all = [...DB.get("invoices"), newInvoice];
            DB.save("invoices", all);
            setInvoices(all.filter(i => i.policyId === policy.policyId || invoices.some(curr => curr.invoiceId === i.invoiceId)));
            console.log("[SUCCESS] Invoice generated:", newInvoice);
            window.location.reload();
        } catch (err) {
            console.error("[ERROR] Failed to generate invoice:", err);
            alert("Error generating invoice. Check console for details.");
        }
    };

    // --- STEP 6: Apply payment ---
    const applyPayment = (invoiceId, amount) => {
        try {
            console.log("[INFO] Applying payment:", amount, "to invoiceId:", invoiceId);
            const allInvoices = DB.get("invoices");
            const inv = allInvoices.find(i => i.invoiceId === invoiceId);
            if (!inv) throw new Error("Invoice not found.");

            const payment = {
                paymentId: Date.now(),
                invoiceId,
                amount,
                datePaid: new Date().toLocaleDateString()
            };

            inv.payments.push(payment);
            inv.amountPaid += amount;
            inv.status = inv.amountPaid >= inv.amountDue ? "PAID" : "PARTIALLY_PAID";

            DB.save("invoices", allInvoices);
            console.log("[SUCCESS] Payment applied:", payment);
            window.location.reload();
        } catch (err) {
            console.error("[ERROR] Failed to apply payment:", err);
            alert("Payment failed. Check console for details.");
        }
    };

    // --- STEP 7: Handle missing customer ---
    if (!customer) {
        console.warn("[WARN] Customer not found for ID:", customerId);
        return <div className="container mt-5">Customer not found.</div>;
    }

    // --- STEP 8: Render UI ---

   return (
        <div className="container mt-4">
            <Link to="/" className="btn btn-link p-0 mb-3 text-decoration-none">← Back to Dashboard</Link>
            
            <div className="row">
                <div className="col-md-4">
                    {/* Profile Card */}
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
                                <input className="form-control mb-2" placeholder="Type (e.g. Auto)" value={policyForm.type} onChange={e => setPolicyForm({...policyForm, type: e.target.value})} required />
                                <div className="row g-2 mb-3">
                                    <div className="col"><input type="number" className="form-control" placeholder="Premium" value={policyForm.premium} onChange={e => setPolicyForm({...policyForm, premium: e.target.value})} /></div>
                                    <div className="col"><input type="number" className="form-control" placeholder="Agency Fee" value={policyForm.fee} onChange={e => setPolicyForm({...policyForm, fee: e.target.value})} /></div>
                                </div>
                                <button className="btn btn-success w-100">Add to Profile</button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    {/* Tabs */}
                    <ul className="nav nav-tabs">
                        <li className="nav-item"><button className="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-policies">Policies</button></li>
                        <li className="nav-item"><button className="nav-link" data-bs-toggle="tab" data-bs-target="#tab-invoices">Invoices</button></li>
                    </ul>

                    <div className="tab-content bg-white p-3 border border-top-0 rounded-bottom shadow-sm">
                        {/* Policy Tab */}
                        <div className="tab-pane fade show active" id="tab-policies">
                            <ul className="list-group list-group-flush">
                                {policies.map(p => (
                                    <li key={p.policyId} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{p.type}</strong><br/>
                                            <small className="text-muted">Prem: {formatMoney(p.premium)} | Fee: {formatMoney(p.agencyFee)}</small>
                                        </div>
                                        <span className="badge bg-secondary">#{p.policyId}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Invoice Tab (Accordion) */}
                        <div className="tab-pane fade" id="tab-invoices">
                            <div className="accordion" id="invAcc">
                                {policies.map(p => {
                                    const policyInvoices = invoices.filter(inv => inv.policyId === p.policyId);
                                    return (
                                        <div className="accordion-item" key={p.policyId}>
                                            <h2 className="accordion-header">
                                                <button className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target={`#collapse-${p.policyId}`}>
                                                    {p.type} • {policyInvoices.length} Invoices
                                                </button>
                                            </h2>
                                            <div id={`collapse-${p.policyId}`} className="accordion-collapse collapse" data-bs-parent="#invAcc">
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
                                                            <button className="btn btn-primary" onClick={() => generateInvoice(p)}>Create</button>
                                                        </div>
                                                    </div>

                                                    {/* Existing Invoices List */}
                                                    {policyInvoices.map(inv => (
                                                        <div className="card mb-3 border-info" key={inv.invoiceId}>
                                                            <div className="card-header d-flex justify-content-between">
                                                                <span>Invoice #INV-{inv.invoiceId}</span>
                                                                <span className={`badge ${inv.status === 'PAID' ? 'bg-success' : 'bg-warning text-dark'}`}>{inv.status}</span>
                                                            </div>
                                                            <div className="card-body">
                                                                <p className="mb-1"><strong>Due: {formatMoney(inv.amountDue)}</strong></p>
                                                                <p className="small text-muted mb-3">Paid: {formatMoney(inv.amountPaid)} | Remaining: {formatMoney(inv.amountDue - inv.amountPaid)}</p>
                                                                
                                                                {inv.status !== 'PAID' && (
                                                                    <div className="input-group input-group-sm mb-3">
                                                                        <input type="number" className="form-control" placeholder="Pay amount" id={`pay-val-${inv.invoiceId}`} />
                                                                        <button className="btn btn-outline-primary" onClick={() => {
                                                                            const val = parseFloat(document.getElementById(`pay-val-${inv.invoiceId}`).value);

                                                                        }}>Submit Payment</button>
                                                                    </div>
                                                                )}

                                                                {/* Payment History */}
                                                                {inv.payments.length > 0 && (
                                                                    <div className="mt-2">
                                                                        <small className="fw-bold">Payment History:</small>
                                                                        {inv.payments.map(pmt => <div key={pmt.paymentId} className="small text-success">• {formatMoney(pmt.amount)} on {pmt.datePaid}</div>)}
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
            </div>
        </div>
    );
};

export default CustomerDetail;
