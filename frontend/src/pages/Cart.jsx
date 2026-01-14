import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../api.js';

const Cart = ({ user, onCartChange, onNotice }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get('/api/cart')
      .then((res) => {
        setCart(res.data);
        const items = res.data?.items || [];
        const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        onCartChange?.(count);
      })
      .catch(() => onNotice?.('Unable to load cart.', 'error'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleRemove = (productId) => {
    api.post('/api/cart/remove', { productId })
      .then((res) => {
        setCart(res.data);
        const items = res.data?.items || [];
        const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        onCartChange?.(count);
      })
      .catch(() => onNotice?.('Unable to update cart.', 'error'));
  };

  const handleUpdateQty = (productId, nextQty) => {
    api.patch('/api/cart/update', { productId, quantity: nextQty })
      .then((res) => {
        setCart(res.data);
        const items = res.data?.items || [];
        const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        onCartChange?.(count);
      })
      .catch((err) => onNotice?.(err?.response?.data?.message || 'Unable to update cart.', 'error'));
  };

  const handleClear = () => {
    api.post('/api/cart/clear')
      .then((res) => {
        setCart(res.data);
        onCartChange?.(0);
      })
      .catch((err) => onNotice?.(err?.response?.data?.message || 'Unable to clear cart.', 'error'));
  };

  if (!user) {
    return (
      <div className="container notice">
        Please <Link to="/login">login</Link> to view your cart.
      </div>
    );
  }

  if (loading) {
    return <div className="container loading">Loading...</div>;
  }

  const items = cart?.items || [];

  return (
    <div className="container page-stack">
      <h2>Your cart</h2>
      {items.length === 0 ? (
        <div className="notice">Your cart is empty.</div>
      ) : (
        <div className="cart-grid">
          <div className="cart-list">
            {items.map((item) => (
              <div key={item.product?._id} className="cart-item">
                <div className="cart-media">
                  {item.product?.image ? (
                    <img src={getImageUrl(item.product.image)} alt={item.product?.name} />
                  ) : (
                    <div className="media-placeholder">No image</div>
                  )}
                </div>
                <div className="cart-info">
                  <div className="cart-title">{item.product?.name}</div>
                  <div className="cart-meta">
                    <span>Qty</span>
                    <div className="qty-controls">
                      <button
                        className="button-outline"
                        type="button"
                        onClick={() => {
                          if (item.quantity <= 1) {
                            handleRemove(item.product?._id);
                          } else {
                            handleUpdateQty(item.product?._id, item.quantity - 1);
                          }
                        }}
                      >
                        -
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="button-outline"
                        type="button"
                        onClick={() => handleUpdateQty(item.product?._id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-price">{item.product?.price}円</div>
                </div>
                <button className="button-outline" onClick={() => handleRemove(item.product?._id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>Summary</h3>
            <div className="summary-row">
              <span>Total</span>
              <strong>{cart?.total || 0}円</strong>
            </div>
            <Link to="/checkout" className="button">Proceed to checkout</Link>
            <button className="button-outline" type="button" onClick={handleClear}>
              Clear cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
