import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';
import { clearAuth, getStoredUser } from './auth.js';
import api from './api.js';

const App = () => {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [notice, setNotice] = useState(null);
  const noticeTimer = useRef(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const updateCartCount = (nextCount) => {
    if (!user) {
      setCartCount(0);
      return;
    }
    if (typeof nextCount === 'number') {
      setCartCount(nextCount);
      return;
    }
    api.get('/api/cart')
      .then((res) => {
        const items = res.data?.items || [];
        const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        setCartCount(count);
      })
      .catch(() => setCartCount(0));
  };

  useEffect(() => {
    updateCartCount();
  }, [user]);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setCartCount(0);
  };

  const showNotice = (message, type = '') => {
    if (!message) return;
    if (noticeTimer.current) {
      clearTimeout(noticeTimer.current);
    }
    setNotice({ message, type });
    noticeTimer.current = setTimeout(() => {
      setNotice(null);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (noticeTimer.current) {
        clearTimeout(noticeTimer.current);
      }
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <Header user={user} onLogout={handleLogout} cartCount={cartCount} />
        {notice && (
          <div className={`notice notice-floating ${notice.type || ''}`}>
            {notice.message}
          </div>
        )}
        <main className="page">
          <Routes>
            <Route path="/" element={<Home user={user} onCartChange={updateCartCount} onNotice={showNotice} />} />
            <Route path="/products" element={<Products user={user} onCartChange={updateCartCount} onNotice={showNotice} />} />
            <Route path="/products/:id" element={<ProductDetails user={user} onCartChange={updateCartCount} onNotice={showNotice} />} />
            <Route path="/cart" element={<Cart user={user} onCartChange={updateCartCount} onNotice={showNotice} />} />
            <Route path="/checkout" element={<Checkout user={user} onCartChange={updateCartCount} />} />
            <Route path="/login" element={<Login onAuth={setUser} onNotice={showNotice} />} />
            <Route path="/register" element={<Register onAuth={setUser} onNotice={showNotice} />} />
            <Route path="/admin" element={<Admin user={user} onNotice={showNotice} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
