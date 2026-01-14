import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Header = ({ user, onLogout, cartCount }) => {
  const [term, setTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/products') return;
    const params = new URLSearchParams(location.search);
    setTerm(params.get('search') || '');
  }, [location.pathname, location.search]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const query = term.trim();
    const next = query ? `/products?search=${encodeURIComponent(query)}` : '/products';
    navigate(next);
  };

  return (
    <header className="header">
      <div className="container header-row">
        <div className="brand">
          <Link to="/" className="logo">NewShop</Link>
          <span className="logo-tag">market</span>
        </div>
        <form className="search" onSubmit={handleSubmit}>
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search for products, brands, categories"
            aria-label="Search"
          />
          <button type="submit">Search</button>
        </form>
        <div className="header-actions">
          <NavLink to="/products">Catalog</NavLink>
          <NavLink to="/cart" className="cart-link">
            Cart
            <span className="cart-badge">{cartCount}</span>
          </NavLink>
          {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
          {!user && <NavLink to="/login">Login</NavLink>}
          {!user && <NavLink to="/register">Register</NavLink>}
          {user && (
            <button className="link-button" onClick={onLogout}>
              Sign out
            </button>
          )}
        </div>
      </div>
      <div className="container header-sub">
        <div className="header-meta">
          <span className="pill">Fast delivery</span>
          <span className="pill">Pay on receipt</span>
          <span className="pill">Hot deals</span>
        </div>
        <div className="header-user">
          {user ? <span>Hi, {user.name}</span> : <span>Guest mode</span>}
        </div>
      </div>
    </header>
  );
};

export default Header;
