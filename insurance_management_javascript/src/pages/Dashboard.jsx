import React, { useState, useEffect } from 'react';
import { DB } from '../services/db';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [customers, setCustomers] = useState([]);
    const [form, setForm] = useState({ first: '', last: '', age: '' });

    useEffect(() => {
        setCustomers(DB.get("customers"));
    }, []);

    const handleAdd = (e) => {
        e.preventDefault();
        const newCust = {
            id: Date.now(),
            first_name: form.first,
            last_name: form.last,
            age: parseInt(form.age),
            createdAt: new Date().toISOString()
        };
        const updated = [...customers, newCust];
        DB.save("customers", updated);
        setCustomers(updated);
        setForm({ first: '', last: '', age: '' });
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Customer Directory</h1>
            <form className="card p-3 shadow-sm mb-4 row g-3" onSubmit={handleAdd}>
                <div className="col-md-4">
                    <input
                        className="form-control"
                        placeholder="First Name"
                        value={form.first}
                        onChange={e => setForm({ ...form, first: e.target.value })}
                        required
                    />
                </div>
                <div className="col-md-4">
                    <input
                        className="form-control"
                        placeholder="Last Name"
                        value={form.last}
                        onChange={e => setForm({ ...form, last: e.target.value })}
                        required
                    />
                </div>
                <div className="col-md-2">
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Age"
                        value={form.age}
                        onChange={e => setForm({ ...form, age: e.target.value })}
                        required
                    />
                </div>
                <div className="col-md-2">
                    <button className="btn" style={{ backgroundColor: 'var(--brand-blue)' }}>Register</button>
                </div>
            </form>

            <div className="table-responsive bg-white shadow-sm rounded">
                <table className="table table-hover mb-0">
                    <thead className="table-dark">
                        <tr><th>ID</th><th>Name</th><th>Age</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {customers.map(c => (
                            <tr key={c.id}>
                                <td>#{c.id}</td>
                                <td>{c.first_name} {c.last_name}</td>
                                <td>{c.age}</td>
                                <td>
                                    <Link to={`/customer/${c.id}`} className="btn btn-sm btn-info text-white">
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
