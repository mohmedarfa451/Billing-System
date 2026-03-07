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

    // --- ميثود تحميل الـ PDF الجديدة ---
    const handleDownload = async (invoiceId) => {
        try {
            // طلب الملف من الـ API بنوع blob
            const response = await api.get(`/invoices/${invoiceId}/download`, {
                responseType: 'blob', 
            });

            // تحويل البيانات لرابط تحميل
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${invoiceId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("فشل تحميل الفاتورة:", error);
            alert("حدث خطأ أثناء تحميل الملف. تأكد من إعدادات السيرفر.");
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
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {/* زرار التحميل المدمج */}
                                            <button 
                                                onClick={() => handleDownload(invoice.id)} 
                                                className="btn-download-small"
                                            >
                                                PDF 📥
                                            </button>
                                            <button onClick={() => handleDelete(invoice.id)} className="btn-action-delete">Delete</button>
                                        </div>
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
                                <button 
                                    onClick={() => handleDownload(selectedInvoice.id)} 
                                    className="btn-primary" 
                                    style={{marginRight: '10px'}}
                                >
                                    Download PDF
                                </button>
                                <div className="grand-total">Grand Total: <span>${selectedInvoice.total_amount}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .dashboard-container { min-height: 100vh; background-color: #f8fafc; }
                .dashboard-header { background: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
                .brand-name { font-size: 1.25rem; font-weight: 700; color: #2563eb; }
                .dashboard-content { max-width: 1200px; margin: 2rem auto; padding: 0 1rem; }
                .content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .btn-download-small { background: white; border: 1px solid #2563eb; color: #2563eb; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; }
                .btn-download-small:hover { background: #2563eb; color: white; transition: 0.3s; }
                .table-card { background: white; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; }
                .invoices-table { width: 100%; border-collapse: collapse; text-align: left; }
                .invoices-table th { background: #f1f5f9; padding: 12px; font-weight: 600; border-bottom: 1px solid #e2e8f0; }
                .invoices-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
                .badge { padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; cursor: pointer; }
                .badge-pending { background: #fef3c7; color: #92400e; }
                .badge-paid { background: #dcfce7; color: #166534; }
                .btn-primary { background: #2563eb; color: white; padding: 8px 16px; border-radius: 6px; font-weight: 600; }
                .btn-danger { background: #ef4444; color: white; padding: 8px 16px; border-radius: 6px; }
                .invoice-id { color: #2563eb; cursor: pointer; font-weight: 600; }
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal-content { background: white; padding: 2rem; border-radius: 12px; width: 90%; max-width: 800px; }
                .spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Dashboard;