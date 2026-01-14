import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';

const Checkout = ({ user, onCartChange }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: '',
    address: '',
    city: '',
    zip: '',
    phone: ''
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    api.get('/api/cart')
      .then((res) => {
        setCart(res.data);
        const items = res.data?.items || [];
        const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        onCartChange?.(count);
      })
      .catch(() => setNotice({ message: 'Unable to load cart.', type: 'error' }))
      .finally(() => setLoading(false));
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    api.post('/api/checkout')
      .then((res) => {
        setOrder(res.data);
        setCart({ items: [], total: 0 });
        onCartChange?.(0);
        setNotice({ message: 'Payment successful.', type: 'success' });
      })
      .catch(() => setNotice({ message: 'Checkout failed.', type: 'error' }));
  };

  if (!user) {
    return (
      <div className="container notice">
        Please <Link to="/login">login</Link> to proceed with checkout.
      </div>
    );
  }

  if (loading) {
    return <div className="container loading">Loading...</div>;
  }

  if (order) {
    return (
      <div className="container page-stack">
        {notice && <div className={`notice ${notice.type || ''}`}>{notice.message}</div>}
        <div className="order-card">
          <h2>Order confirmed</h2>
          <p>Order ID: {order.orderId}</p>
          <p>Amount: {order.amount}円</p>
          <Link to="/products" className="button">Continue shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-stack">
      <h2>Checkout</h2>
      {notice && <div className={`notice ${notice.type || ''}`}>{notice.message}</div>}
      <div className="checkout-grid">
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Address</label>
            <input name="address" value={form.address} onChange={handleChange} required />
          </div>
          <div className="field-row">
            <div className="field">
              <label>City</label>
              <input name="city" value={form.city} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>ZIP</label>
              <input name="zip" value={form.zip} onChange={handleChange} required />
            </div>
          </div>
          <div className="field">
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} required />
          </div>
          <button className="button" type="submit">Pay now</button>
        </form>
        <div className="cart-summary">
          <h3>Order summary</h3>
          <div className="summary-row">
            <span>Items</span>
            <strong>{cart?.items?.length || 0}</strong>
          </div>
          <div className="summary-row">
            <span>Total</span>
            <strong>{cart?.total || 0}円</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
