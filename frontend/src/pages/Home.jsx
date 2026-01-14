import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

const Home = ({ user, onCartChange, onNotice }) => {
  const [offers, setOffers] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/api/products', { params: { offer: true } }),
      api.get('/api/products', { params: { topSelling: true } }),
      api.get('/api/categories')
    ])
      .then(([offersRes, topRes, catRes]) => {
        setOffers(offersRes.data);
        setTopSelling(topRes.data);
        setCategories(catRes.data);
      })
      .catch(() => onNotice?.('Unable to load products.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (product) => {
    api.post('/api/cart/add', { productId: product._id, quantity: 1 })
      .then(() => {
        onNotice?.('Added to cart.', 'success');
        onCartChange?.();
      })
      .catch(() => onNotice?.(user ? 'Unable to add to cart.' : 'Login to use the cart.', 'error'));
  };

  const handleHeroSearch = (event) => {
    event.preventDefault();
    const query = heroSearch.trim();
    const url = query ? `/products?search=${encodeURIComponent(query)}` : '/products';
    navigate(url);
  };

  return (
    <div className="container page-stack">
      <section className="hero">
        <div>
          <h1>Welcome to NewShop!</h1>
          <p>Discover tech, lifestyle, and essentials with fast delivery and verified sellers.</p>
          <form className="hero-search" onSubmit={handleHeroSearch}>
            <input
              value={heroSearch}
              onChange={(event) => setHeroSearch(event.target.value)}
              placeholder="Search in NewShop"
            />
            <button type="submit">Explore</button>
          </form>
          <div className="hero-cats">
            {categories.slice(0, 6).map((cat) => (
              <Link key={cat._id} to={`/products?category=${cat._id}`}>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="hero-panel">
          <div className="hero-card">
            <h3>Member opportunities:</h3>
            <p>Free delivery for orders above 4000円 and early access to promotions.</p>
            <div className="hero-stats">
              <div>
                <span className="stat">24h</span>
                <span className="stat-label">dispatch</span>
              </div>
              <div>
                <span className="stat">4.8</span>
                <span className="stat-label">store rating</span>
              </div>
            </div>
          </div>
          <div className="hero-strip">
            <span>New brands</span>
            <span>Top sellers</span>
            <span>Premium picks</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Offers you can grab today</h2>
          <Link to="/products?offer=true" className="button-outline">See all</Link>
        </div>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="product-grid">
            {offers.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} onAdd={handleAdd} />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Top selling right now</h2>
          <Link to="/products?topSelling=true" className="button-outline">See all</Link>
        </div>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="product-grid">
            {topSelling.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} onAdd={handleAdd} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
