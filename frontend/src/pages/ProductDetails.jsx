import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getImageUrl } from '../api.js';

const ProductDetails = ({ user, onCartChange, onNotice }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get(`/api/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setError('Product not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    api.post('/api/cart/add', { productId: product._id, quantity: 1 })
      .then(() => {
        onNotice?.('Added to cart.', 'success');
        onCartChange?.();
      })
      .catch(() => onNotice?.(user ? 'Unable to add to cart.' : 'Login to use the cart.', 'error'));
  };

  if (loading) {
    return <div className="container loading">Loading...</div>;
  }

  if (error) {
    return <div className="container notice error">{error}</div>;
  }

  return (
    <div className="container page-stack">
      <Link className="back-link" to="/products">Back to catalog</Link>
      <div className="details">
        <div className="details-media">
          {product.image ? (
            <img src={getImageUrl(product.image)} alt={product.name} />
          ) : (
            <div className="media-placeholder">No image</div>
          )}
        </div>
        <div className="details-info">
          <h1>{product.name}</h1>
          <div className="details-tags">
            {product.offer && <span className="badge">{product.offer}</span>}
            {product.topSelling && <span className="badge alt">Top</span>}
          </div>
          <div className="details-price">{product.price}円</div>
          <div className="details-meta">
            <span>{product.rating}★ rating</span>
            <span>{product.stock} in stock</span>
          </div>
          <p className="details-desc">{product.description || 'No description yet.'}</p>
          <button className="button" onClick={handleAdd}>Add to cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
