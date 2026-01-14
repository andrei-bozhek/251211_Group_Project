import { useEffect, useState } from 'react';
import api, { getImageUrl } from '../api.js';

const Admin = ({ user, onNotice }) => {
  const [section, setSection] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    stock: '',
    rating: '',
    topSelling: false,
    offer: '',
    description: '',
    category: '',
    image: null
  });
  const [categoryForm, setCategoryForm] = useState({ name: '' });

  const loadProducts = () => {
    api.get('/api/products')
      .then((res) => setProducts(res.data))
      .catch(() => onNotice?.('Unable to load products.', 'error'));
  };

  const loadCategories = () => {
    api.get('/api/categories')
      .then((res) => setCategories(res.data))
      .catch(() => onNotice?.('Unable to load categories.', 'error'));
  };

  const loadUsers = () => {
    api.get('/api/admin/users')
      .then((res) => setUsers(res.data))
      .catch(() => onNotice?.('Unable to load users.', 'error'));
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    loadProducts();
    loadCategories();
    loadUsers();
  }, [user]);

  if (!user) {
    return <div className="container notice">Please login to access admin.</div>;
  }

  if (user.role !== 'admin') {
    return <div className="container notice">Admin access required.</div>;
  }

  const handleProductChange = (event) => {
    const { name, value, type, checked, files } = event.target;
    if (type === 'checkbox') {
      setProductForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    if (type === 'file') {
      setProductForm((prev) => ({ ...prev, image: files[0] }));
      return;
    }
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      price: '',
      stock: '',
      rating: '',
      topSelling: false,
      offer: '',
      description: '',
      category: '',
      image: null
    });
    setEditingId(null);
  };

  const handleProductSubmit = (event) => {
    event.preventDefault();
    const data = new FormData();
    Object.entries(productForm).forEach(([key, value]) => {
      if (value === '' || value === null) return;
      data.append(key, value);
    });
    const request = editingId
      ? api.put(`/api/products/${editingId}`, data)
      : api.post('/api/products', data);

    request
      .then(() => {
        resetProductForm();
        loadProducts();
      })
      .catch((err) => onNotice?.(err?.response?.data?.message || 'Unable to save product.', 'error'));
  };

  const handleEditProduct = (product) => {
    setEditingId(product._id);
    setProductForm({
      name: product.name || '',
      price: product.price || '',
      stock: product.stock || '',
      rating: product.rating || '',
      topSelling: Boolean(product.topSelling),
      offer: product.offer || '',
      description: product.description || '',
      category: product.category?._id || product.category || '',
      image: null
    });
  };

  const handleDeleteProduct = (id) => {
    api.delete(`/api/products/${id}`)
      .then(() => loadProducts())
      .catch(() => onNotice?.('Unable to delete product.', 'error'));
  };

  const handleCategoryChange = (event) => {
    setCategoryForm({ name: event.target.value });
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '' });
    setEditingCategoryId(null);
  };

  const handleCategorySubmit = (event) => {
    event.preventDefault();
    const request = editingCategoryId
      ? api.put(`/api/categories/${editingCategoryId}`, categoryForm)
      : api.post('/api/categories', categoryForm);

    request
      .then(() => {
        resetCategoryForm();
        loadCategories();
      })
      .catch((err) => onNotice?.(err?.response?.data?.message || 'Unable to save category.', 'error'));
  };

  const handleEditCategory = (category) => {
    setEditingCategoryId(category._id);
    setCategoryForm({ name: category.name });
  };

  const handleDeleteCategory = (id) => {
    api.delete(`/api/categories/${id}`)
      .then(() => loadCategories())
      .catch((err) => onNotice?.(err?.response?.data?.message || 'Unable to delete category.', 'error'));
  };

  const handleDeleteUser = (id) => {
    api.delete(`/api/admin/users/${id}`)
      .then(() => loadUsers())
      .catch(() => onNotice?.('Unable to delete user.', 'error'));
  };

  const handleToggleBlock = (id) => {
    api.patch(`/api/admin/users/${id}/block`)
      .then((res) => {
        const next = res.data?.user;
        setUsers((prev) => prev.map((entry) => (
          entry._id === id ? { ...entry, isBlocked: next?.isBlocked } : entry
        )));
      })
      .catch((err) => onNotice?.(err?.response?.data?.message || 'Unable to update block status.', 'error'));
  };

  const handleRoleChange = (id, role) => {
    api.patch(`/api/admin/users/${id}/role`, { role })
      .then((res) => {
        setUsers((prev) => prev.map((entry) => (
          entry._id === id ? { ...entry, role: res.data?.user?.role || role } : entry
        )));
      })
      .catch((err) => onNotice?.(err?.response?.data?.message || 'Unable to update role.', 'error'));
  };

  return (
    <div className="container page-stack">
      <div className="admin-header">
        <h2>Admin dashboard</h2>
        <div className="admin-tabs">
          <button className={section === 'products' ? 'active' : ''} onClick={() => setSection('products')}>Products</button>
          <button className={section === 'categories' ? 'active' : ''} onClick={() => setSection('categories')}>Categories</button>
          <button className={section === 'users' ? 'active' : ''} onClick={() => setSection('users')}>Users</button>
        </div>
      </div>

      {section === 'products' && (
        <div className="admin-grid">
          <div className="admin-form-panel">
            <form className="form" onSubmit={handleProductSubmit}>
              <h3>{editingId ? 'Edit product' : 'New product'}</h3>
              <div className="field">
                <label>Name</label>
                <input name="name" value={productForm.name} onChange={handleProductChange} required />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Price</label>
                  <input name="price" type="number" value={productForm.price} onChange={handleProductChange} required />
                </div>
                <div className="field">
                  <label>Stock</label>
                  <input name="stock" type="number" value={productForm.stock} onChange={handleProductChange} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Rating</label>
                  <input name="rating" type="number" step="0.1" value={productForm.rating} onChange={handleProductChange} />
                </div>
                <div className="field">
                  <label>Category</label>
                  <select name="category" value={productForm.category} onChange={handleProductChange} required>
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Offer</label>
                <input name="offer" value={productForm.offer} onChange={handleProductChange} placeholder="10% off" />
              </div>
              <label className="check">
                <input name="topSelling" type="checkbox" checked={productForm.topSelling} onChange={handleProductChange} />
                Top selling
              </label>
              <div className="field">
                <label>Description</label>
                <textarea name="description" value={productForm.description} onChange={handleProductChange} rows="4" />
              </div>
              <div className="field">
                <label>Image</label>
                <input name="image" type="file" onChange={handleProductChange} />
              </div>
              <button className="button" type="submit">{editingId ? 'Save changes' : 'Create product'}</button>
              {editingId && <button className="button-outline" type="button" onClick={resetProductForm}>Cancel</button>}
            </form>
          </div>

          <div className="table">
            <h3>Product list</h3>
            <div className="table-body">
              {products.map((product) => (
                <div key={product._id} className="table-row">
                  <div className="table-main">
                    <div className="table-media">
                      {product.image ? (
                        <img src={getImageUrl(product.image)} alt={product.name} />
                      ) : (
                        <div className="media-placeholder">No image</div>
                      )}
                    </div>
                    <div>
                      <strong>{product.name}</strong>
                      <div className="muted">{product.category?.name || 'No category'}</div>
                    </div>
                  </div>
                  <div className="table-meta">
                    <span>{product.price}円</span>
                    <span>{product.stock} in stock</span>
                  </div>
                  <div className="table-actions">
                    <button className="button-outline" onClick={() => handleEditProduct(product)}>Edit</button>
                    <button className="button-danger" onClick={() => handleDeleteProduct(product._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === 'categories' && (
        <div className="admin-grid">
          <div className="admin-form-panel">
            <form className="form" onSubmit={handleCategorySubmit}>
              <h3>{editingCategoryId ? 'Edit category' : 'New category'}</h3>
              <div className="field">
                <label>Name</label>
                <input value={categoryForm.name} onChange={handleCategoryChange} required />
              </div>
              <button className="button" type="submit">{editingCategoryId ? 'Save changes' : 'Create category'}</button>
              {editingCategoryId && <button className="button-outline" type="button" onClick={resetCategoryForm}>Cancel</button>}
            </form>
          </div>

          <div className="table">
            <h3>Category list</h3>
            <div className="table-body">
              {categories.map((category) => (
                <div key={category._id} className="table-row">
                  <div className="table-main">
                    <strong>{category.name}</strong>
                  </div>
                  <div className="table-actions">
                    <button className="button-outline" onClick={() => handleEditCategory(category)}>Edit</button>
                    <button className="button-danger" onClick={() => handleDeleteCategory(category._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === 'users' && (
        <div className="table">
          <h3>User list</h3>
          <div className="table-body">
            {users.map((entry) => (
              <div key={entry._id} className="table-row">
                <div className="table-main">
                  <strong>{entry.name}</strong>
                  <div className="muted">{entry.email}</div>
                </div>
                <div className="table-meta">
                  <div className="user-role-row">
                    {entry.isBlocked && <span className="blocked-badge">blocked</span>}
                    <select
                      className="admin-role"
                      value={entry.role}
                      onChange={(event) => handleRoleChange(entry._id, event.target.value)}
                    >
                      <option value="customer">customer</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                </div>
                <div className="table-actions">
                  <button className="button-outline" onClick={() => handleToggleBlock(entry._id)}>
                    {entry.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                  <button className="button-danger" onClick={() => handleDeleteUser(entry._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
