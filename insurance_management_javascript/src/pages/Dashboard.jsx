import React, { useState, useEffect } from 'react';
import { DB } from '../services/db';
import { Link } from 'react-router-dom';

/*
===========================================================
DASHBOARD COMPONENT
-----------------------------------------------------------
This page handles:
- Displaying all customers
- Adding new customers
- Saving to localStorage (via DB service)
- Using Bootstrap + custom theme colors
- Heavy debugging + error trapping
===========================================================
*/

const Dashboard = () => {

    /* ------------------------------------------------------
       STATE: customers array + form fields
       ------------------------------------------------------ */
    const [customers, setCustomers] = useState([]);
    const [form, setForm] = useState({ first: '', last: '', age: '' });

    /* ------------------------------------------------------
       EFFECT: Load customers on page load
       ------------------------------------------------------ */
    useEffect(() => {
        try {
            console.log("Loading customers from DB...");
            const data = DB.get("customers") || [];
            console.log("Loaded customers:", data);
            setCustomers(data);
        } catch (err) {
            console.error("ERROR loading customers:", err);
        }
    }, []);

    /* ------------------------------------------------------
       HANDLER: Add new customer
       ------------------------------------------------------ */
    const handleAdd = (e) => {
        e.preventDefault();

        console.log("Attempting to add new customer...");

        try {
            // Basic validation
            if (!form.first || !form.last || !form.age) {
                console.warn("Form validation failed:", form);
                alert("Please fill out all fields.");
                return;
            }

            const newCust = {
                id: Date.now(), // simple unique ID
                first_name: form.first.trim(),
                last_name: form.last.trim(),
                age: parseInt(form.age),
                createdAt: new Date().toISOString()
            };

            console.log("New customer object:", newCust);

            // OOP-style array update
            const updated = [...customers, newCust];

            // Save to DB
            DB.save("customers", updated);
            console.log("Customer saved to DB.");

            // Update UI
            setCustomers(updated);
            setForm({ first: '', last: '', age: '' });

        } catch (err) {
            console.error("ERROR adding customer:", err);
            alert("Something went wrong while adding the customer.");
        }
    };

    /* ------------------------------------------------------
       RENDER UI
       ------------------------------------------------------ */
    return (
        <div className="container mt-5">

            {/* PAGE TITLE */}
            <h1 className="mb-4 text-brand">Customer Directory</h1>

            {/* FORM CARD */}
            <form className="card card-brand p-4 shadow-sm mb-4" onSubmit={handleAdd}>
                <h4 className="mb-3">Register New Customer</h4>

                <div className="row g-3">

                    {/* FIRST NAME */}
                    <div className="col-md-4">
                        <input
                            className="form-control"
                            placeholder="First Name"
                            value={form.first}
                            onChange={e => {
                                console.log("First name changed:", e.target.value);
                                setForm({ ...form, first: e.target.value });
                            }}
                            required
                        />
                    </div>

                    {/* LAST NAME */}
                    <div className="col-md-4">
                        <input
                            className="form-control"
                            placeholder="Last Name"
                            value={form.last}
                            onChange={e => {
                                console.log("Last name changed:", e.target.value);
                                setForm({ ...form, last: e.target.value });
                            }}
                            required
                        />
                    </div>

                    {/* AGE */}
                    <div className="col-md-2">
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Age"
                            value={form.age}
                            onChange={e => {
                                console.log("Age changed:", e.target.value);
                                setForm({ ...form, age: e.target.value });
                            }}
                            required
                        />
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="col-md-2 d-grid">
                        <button className="btn btn-brand">
                            Register
                        </button>
                    </div>
                </div>
            </form>

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

                        {customers.map(c => (
                            <tr key={c.id}>
                                <td>#{c.id}</td>
                                <td>{c.first_name} {c.last_name}</td>
                                <td>{c.age}</td>
                                <td>
                                    <Link
                                        to={`/customer/${c.id}`}
                                        className="btn btn-sm btn-info text-white"
                                    >
                                        Profile
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default Dashboard;
