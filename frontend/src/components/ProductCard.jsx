import { Link } from 'react-router-dom';
import { getImageUrl } from '../api.js';

const ProductCard = ({ product, onAdd }) => {
  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-media">
        {product.image ? (
          <img src={getImageUrl(product.image)} alt={product.name} />
        ) : (
          <div className="media-placeholder">No image</div>
        )}
      </Link>
      <div className="product-body">
        <div className="product-title">{product.name}</div>
        <div className="offer-slot">
          {product.offer ? <div className="badge">{product.offer}</div> : <div className="badge ghost">No offer</div>}
        </div>
        <div className="product-meta">
          <span className="price">{product.price}円</span>
          <span className="rating">{product.rating}★</span>
        </div>
        <div className="product-actions">
          <Link to={`/products/${product._id}`} className="button-outline">View</Link>
          <button className="button" onClick={() => onAdd(product)}>
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
