import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Dashboard = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const [newInvoice, setNewInvoice] = useState({
        customer_id: 1,
        invoice_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        items: [{ product_name: '', quantity: 1, unit_price: 0 }]
    });

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const response = await api.get('/invoices');
            setInvoices(response.data.data);
        } catch (error) {
            console.error("Error fetching invoices:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewInvoice = async (id) => {
        try {
            const response = await api.get(`/invoices/${id}`);
            setSelectedInvoice(response.data.data);
        } catch (error) {
            alert("Error fetching invoice details.");
        }
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...newInvoice.items];
        updatedItems[index][field] = value;
        setNewInvoice({ ...newInvoice, items: updatedItems });
    };

    const addItemRow = () => {
        setNewInvoice({
            ...newInvoice,
            items: [...newInvoice.items, { product_name: '', quantity: 1, unit_price: 0 }]
        });
    };

    const removeItemRow = (index) => {
        if (newInvoice.items.length > 1) {
            const updatedItems = newInvoice.items.filter((_, i) => i !== index);
            setNewInvoice({ ...newInvoice, items: updatedItems });
        }
    };

    const calculateTotal = () => {
        return newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };

    const handleAddInvoice = async (e) => {
        e.preventDefault();
        try {
            const total = calculateTotal();
            const payload = {
                customer_id: 1,
                invoice_date: newInvoice.invoice_date,
                status: newInvoice.status,
                total_amount: total,
                items: newInvoice.items.map(item => ({
                    product_id: 1,
                    product_name: item.product_name,
                    quantity: parseInt(item.quantity),
                    unit_price: parseFloat(item.unit_price),
                    subtotal: parseInt(item.quantity) * parseFloat(item.unit_price)
                }))
            };

            const response = await api.post('/invoices', payload);
            if (response.data.status) {
                alert('Invoice added successfully!');
                setInvoices([response.data.data, ...invoices]);
                setShowForm(false);
                setNewInvoice({
                    customer_id: 1,
                    invoice_date: new Date().toISOString().split('T')[0],
                    status: 'pending',
                    items: [{ product_name: '', quantity: 1, unit_price: 0 }]
                });
            }
        } catch (error) {
            alert('Failed to add invoice. Please check item data.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            try {
                await api.delete(`/invoices/${id}`);
                setInvoices(invoices.filter(inv => inv.id !== id));
            } catch (error) {
                alert('Deletion failed.');
            }
        }
    };

    const toggleStatus = async (invoice) => {
        const newStatus = invoice.status === 'pending' ? 'paid' : 'pending';
        try {
            const response = await api.put(`/invoices/${invoice.id}`, {
                ...invoice,
                status: newStatus
            });
            setInvoices(invoices.map(inv => inv.id === invoice.id ? response.data.data : inv));
        } catch (error) {
            alert('Status update failed.');
        }
    };

    if (loading) return (
        <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading Dashboard...</p>
        </div>
    );

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-left">
                    <h1 className="brand-name">Billing System 📄</h1>
                </div>
                <div className="header-right">
                    <button onClick={() => { localStorage.removeItem('auth_token'); window.location.href = '/login'; }} className="btn-danger">Sign Out</button>
                </div>
            </header>

            <main className="dashboard-content">
                <div className="content-header">
                    <h2>Invoice Overview</h2>
                    <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                        {showForm ? 'Cancel' : 'Add New Invoice'}
                    </button>
                </div>

                {showForm && (
                    <div className="card form-card">
                        <h3>Create New Invoice</h3>
                        <form onSubmit={handleAddInvoice} className="invoice-form">
                            <div className="form-grid">
                                <div className="input-group">
                                    <label>Invoice Date</label>
                                    <input type="date" value={newInvoice.invoice_date} onChange={(e) => setNewInvoice({ ...newInvoice, invoice_date: e.target.value })} required />
                                </div>
                                <div className="input-group">
                                    <label>Status</label>
                                    <select value={newInvoice.status} onChange={(e) => setNewInvoice({ ...newInvoice, status: e.target.value })}>
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </div>
                            </div>

                            <div className="items-section">
                                <h4>Line Items</h4>
                                {newInvoice.items.map((item, index) => (
                                    <div key={index} className="item-row">
                                        <input placeholder="Product Name" value={item.product_name} onChange={(e) => handleItemChange(index, 'product_name', e.target.value)} required />
                                        <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} required />
                                        <input type="number" placeholder="Price" value={item.unit_price} onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)} required />
                                        <div className="item-subtotal">${item.quantity * item.unit_price}</div>
                                        <button type="button" onClick={() => removeItemRow(index)} className="btn-remove">×</button>
                                    </div>
                                ))}
                                <button type="button" onClick={addItemRow} className="btn-secondary">+ Add Item</button>
                            </div>

                            <div className="form-footer">
                                <div className="total-badge">Total Amount: <span>${calculateTotal()}</span></div>
                                <button type="submit" className="btn-primary">Save Invoice</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="card table-card">
                    <table className="invoices-table">
                        <thead>
                            <tr>
                                <th>Invoice ID</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td className="invoice-id" onClick={() => handleViewInvoice(invoice.id)}>#{invoice.id}</td>
                                    <td>{invoice.invoice_date}</td>
                                    <td className="amount">${invoice.total_amount}</td>
                                    <td>
                                        <span onClick={() => toggleStatus(invoice)} className={`badge badge-${invoice.status}`}>
                                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                        </span>
                                    </td>
                                    <td>
                                        <button onClick={() => handleDelete(invoice.id)} className="btn-action-delete">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {invoices.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="empty-state">No invoices found. Create your first one!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {selectedInvoice && (
                <div className="modal-overlay">
                    <div className="modal-content invoice-details">
                        <div className="modal-header">
                            <h3>Invoice Details #{selectedInvoice.id}</h3>
                            <button onClick={() => setSelectedInvoice(null)} className="btn-close">×</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-meta">
                                <p><strong>Date:</strong> {selectedInvoice.invoice_date}</p>
                                <p><strong>Status:</strong> <span className={`badge badge-${selectedInvoice.status}`}>{selectedInvoice.status}</span></p>
                            </div>
                            <table className="details-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedInvoice.items?.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.product_name}</td>
                                            <td>{item.quantity}</td>
                                            <td>${item.unit_price}</td>
                                            <td>${item.subtotal}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="modal-footer">
                                <div className="grand-total">Grand Total: <span>${selectedInvoice.total_amount}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .dashboard-container {
                    min-height: 100vh;
                    background-color: var(--background);
                }
                .dashboard-header {
                    background: white;
                    padding: 1rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--border);
                    box-shadow: var(--shadow-sm);
                }
                .brand-name {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--primary);
                }
                .dashboard-content {
                    max-width: 1200px;
                    margin: 2rem auto;
                    padding: 0 1rem;
                }
                .content-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .table-card {
                    padding: 0;
                    overflow: hidden;
                }
                .invoices-table {
                    border: none;
                }
                .invoice-id {
                    color: var(--primary);
                    font-weight: 600;
                    cursor: pointer;
                }
                .invoice-id:hover {
                    text-decoration: underline;
                }
                .amount {
                    font-weight: 500;
                }
                .empty-state {
                    text-align: center;
                    padding: 3rem;
                    color: var(--text-muted);
                }
                .form-card {
                    margin-bottom: 2rem;
                    border-top: 4px solid var(--primary);
                }
                .form-card h3 {
                    margin-bottom: 1.5rem;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                .items-section {
                    margin-top: 2rem;
                    padding-top: 2rem;
                    border-top: 1px solid var(--border);
                }
                .items-section h4 {
                    margin-bottom: 1rem;
                }
                .item-row {
                    display: grid;
                    grid-template-columns: 3fr 1fr 1fr 1.5fr auto;
                    gap: 1rem;
                    margin-bottom: 0.75rem;
                    align-items: center;
                }
                .item-subtotal {
                    background: #f1f5f9;
                    padding: 0.75rem;
                    border-radius: var(--radius);
                    text-align: center;
                    font-weight: 600;
                    font-size: 0.875rem;
                }
                .btn-remove {
                    background: none;
                    color: var(--danger);
                    font-size: 1.5rem;
                    padding: 0.25rem 0.5rem;
                }
                .btn-secondary {
                    background: #f1f5f9;
                    color: var(--secondary);
                    padding: 0.5rem 1rem;
                    margin-top: 0.5rem;
                }
                .form-footer {
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .total-badge {
                    font-size: 1.125rem;
                    font-weight: 500;
                }
                .total-badge span {
                    color: var(--primary);
                    font-weight: 700;
                    font-size: 1.25rem;
                }
                .btn-action-delete {
                    color: var(--danger);
                    background: none;
                    font-size: 0.875rem;
                    padding: 0.25rem 0.5rem;
                }
                .btn-action-delete:hover {
                    background: #fee2e2;
                }
                /* Modal Detail Styles */
                .modal-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .btn-close {
                    background: none;
                    font-size: 1.5rem;
                    color: var(--text-muted);
                }
                .modal-body {
                    padding: 1.5rem;
                }
                .detail-meta {
                    display: flex;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }
                .modal-footer {
                    margin-top: 2rem;
                    text-align: right;
                }
                .grand-total {
                    font-size: 1.25rem;
                }
                .grand-total span {
                    color: var(--primary);
                    font-weight: 700;
                }
                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    gap: 1rem;
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid var(--border);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;