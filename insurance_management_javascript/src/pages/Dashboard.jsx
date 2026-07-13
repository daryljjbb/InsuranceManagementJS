import React, { useState, useEffect } from "react";
import { DB } from "../services/db";
import { Link } from "react-router-dom";

/*
===========================================================
DASHBOARD
-----------------------------------------------------------
This page ONLY handles:
- Listing customers
- Creating customers (modal)
- Deleting customers (optional)
===========================================================
*/

const Dashboard = () => {
  const [customers, setCustomers] = useState([]);

  // Modal visibility
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Customer form
  const [customerForm, setCustomerForm] = useState({
    first: "",
    last: "",
    age: "",
  });

  /* ------------------------------------------------------
     LOAD CUSTOMERS
     ------------------------------------------------------ */
  useEffect(() => {
    try {
      console.log("Loading customers...");
      const data = DB.get("customers") || [];
      console.log("Loaded:", data);
      setCustomers(data);
    } catch (err) {
      console.error("ERROR loading customers:", err);
    }
  }, []);

  /* ------------------------------------------------------
     CREATE CUSTOMER
     ------------------------------------------------------ */
  const handleCreateCustomer = (e) => {
    e.preventDefault();
    console.log("Creating customer...");

    try {
      const newCust = {
        id: Date.now(),
        first_name: customerForm.first.trim(),
        last_name: customerForm.last.trim(),
        age: parseInt(customerForm.age),
        createdAt: new Date().toISOString(),
      };

      console.log("New customer:", newCust);

      const updated = [...customers, newCust];
      DB.save("customers", updated);
      setCustomers(updated);

      // Reset + close modal
      setCustomerForm({ first: "", last: "", age: "" });
      setShowCustomerModal(false);
    } catch (err) {
      console.error("ERROR creating customer:", err);
      alert("Something went wrong.");
    }
  };

  /* ------------------------------------------------------
     DELETE CUSTOMER
     ------------------------------------------------------ */
  const handleDeleteCustomer = (id) => {
    console.log("Deleting customer:", id);

    try {
      const updated = customers.filter((c) => c.id !== id);
      DB.save("customers", updated);
      setCustomers(updated);
    } catch (err) {
      console.error("ERROR deleting customer:", err);
      alert("Could not delete customer.");
    }
  };

  /* ------------------------------------------------------
     RENDER UI
     ------------------------------------------------------ */
  return (
    <div className="container mt-5">

      <h1 className="mb-4 text-brand">Customer Dashboard</h1>

      {/* CREATE CUSTOMER BUTTON */}
      <button className="btn btn-brand mb-4" onClick={() => setShowCustomerModal(true)}>
        + Create Customer
      </button>

      {/* CUSTOMER TABLE */}
      <div className="table-responsive bg-white shadow-sm rounded">
        <table className="table table-hover mb-0">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {customers.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-3 text-muted">
                  No customers found.
                </td>
              </tr>
            )}

            {customers.map((c) => (
              <tr key={c.id}>
                <td>#{c.id}</td>
                <td>{c.first_name} {c.last_name}</td>
                <td>{c.age}</td>
                <td className="d-flex gap-2">

                  {/* PROFILE BUTTON */}
                  <Link
                    to={`/customer/${c.id}`}
                    className="btn btn-sm btn-info text-white"
                  >
                    Profile
                  </Link>

                  {/* DELETE BUTTON */}
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteCustomer(c.id)}
                  >
                    Delete
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ------------------------------------------------------
         CREATE CUSTOMER MODAL
         ------------------------------------------------------ */}
      {showCustomerModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">Create Customer</h5>
                <button className="btn-close" onClick={() => setShowCustomerModal(false)}></button>
              </div>

              <form onSubmit={handleCreateCustomer}>
                <div className="modal-body">

                  <input
                    className="form-control mb-3"
                    placeholder="First Name"
                    value={customerForm.first}
                    onChange={(e) => setCustomerForm({ ...customerForm, first: e.target.value })}
                    required
                  />

                  <input
                    className="form-control mb-3"
                    placeholder="Last Name"
                    value={customerForm.last}
                    onChange={(e) => setCustomerForm({ ...customerForm, last: e.target.value })}
                    required
                  />

                  <input
                    type="number"
                    className="form-control mb-3"
                    placeholder="Age"
                    value={customerForm.age}
                    onChange={(e) => setCustomerForm({ ...customerForm, age: e.target.value })}
                    required
                  />

                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowCustomerModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-brand">Save Customer</button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
