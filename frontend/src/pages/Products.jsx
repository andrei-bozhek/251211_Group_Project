import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

const Products = ({ user, onCartChange, onNotice }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [topSelling, setTopSelling] = useState(false);
  const [offerOnly, setOfferOnly] = useState(false);

  useEffect(() => {
    const searchValue = searchParams.get('search') || '';
    const categoryValue = searchParams.get('category') || '';
    const topValue = searchParams.get('topSelling') === 'true';
    const offerValue = searchParams.get('offer') === 'true';
    setSearch(searchValue);
    setCategory(categoryValue);
    setTopSelling(topValue);
    setOfferOnly(offerValue);
  }, [searchParams]);

  useEffect(() => {
    api.get('/api/categories')
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    const searchValue = searchParams.get('search');
    const categoryValue = searchParams.get('category');
    const topValue = searchParams.get('topSelling');
    const offerValue = searchParams.get('offer');
    if (searchValue) params.search = searchValue;
    if (categoryValue) params.category = categoryValue;
    if (topValue) params.topSelling = topValue;
    if (offerValue) params.offer = offerValue;

    api.get('/api/products', { params })
      .then((res) => setProducts(res.data))
      .catch(() => onNotice?.('Unable to load products.', 'error'))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const applyFilters = () => {
    const next = {};
    if (search.trim()) next.search = search.trim();
    if (category) next.category = category;
    if (topSelling) next.topSelling = 'true';
    if (offerOnly) next.offer = 'true';
    setSearchParams(next);
  };

  const handleAdd = (product) => {
    api.post('/api/cart/add', { productId: product._id, quantity: 1 })
      .then(() => {
        onNotice?.('Added to cart.', 'success');
        onCartChange?.();
      })
      .catch(() => onNotice?.(user ? 'Unable to add to cart.' : 'Login to use the cart.', 'error'));
  };

  return (
    <div className="container page-stack">
      <section className="filter-panel">
        <div className="filter-header">
          <h2>Product catalog</h2>
          <button className="button" onClick={applyFilters}>Apply filters</button>
        </div>
        <div className="filter-grid">
          <div className="field">
            <label>Search</label>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" />
          </div>
          <div className="field">
            <label>Category</label>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <label className="check">
            <input type="checkbox" checked={topSelling} onChange={(event) => setTopSelling(event.target.checked)} />
            Top selling
          </label>
          <label className="check">
            <input type="checkbox" checked={offerOnly} onChange={(event) => setOfferOnly(event.target.checked)} />
            Offers only
          </label>
        </div>
      </section>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} onAdd={handleAdd} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
