import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatPrice } from '../../utils/formatters';

const CATEGORIES = ['Men', 'Women', 'Kids', 'Accessories', 'Footwear', 'Ethnic', 'Winterwear', 'Activewear'];

const EMPTY_FORM = { name: '', brand: '', price: '', mrp: '', category: 'Men', stock: '', description: '', imageUrl: '' };

// Reusable form fields component
function ProductForm({ formData, setFormData, onSubmit, onCancel, submitLabel }) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
        <label>Product Name</label>
        <input required className="form-input" placeholder="e.g. Classic Slim Fit Oxford Shirt" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>Brand</label>
        <input required className="form-input" placeholder="e.g. LuxoraEssentials" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>Category</label>
        <select required className="form-input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>Selling Price (₹)</label>
        <input required type="number" min="0" className="form-input" placeholder="e.g. 1299" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>MRP (₹)</label>
        <input required type="number" min="0" className="form-input" placeholder="e.g. 2499" value={formData.mrp} onChange={e => setFormData({ ...formData, mrp: e.target.value })} />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>Stock Quantity</label>
        <input required type="number" min="0" className="form-input" placeholder="e.g. 50" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>Image URL <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
        <input className="form-input" placeholder="https://images.unsplash.com/..." value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
      </div>

      <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
        <label>Description</label>
        <textarea required className="form-input" rows="3" placeholder="Describe the product..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
      </div>

      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', marginTop: '4px' }}>
        <button type="submit" className="btn btn-primary"><Save size={16} /> {submitLabel}</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}><X size={16} /> Cancel</button>
      </div>
    </form>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Product being edited
  const [search, setSearch] = useState('');

  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products?limit=50');
      setProducts(data.products);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...addForm,
        price: Number(addForm.price),
        mrp: Number(addForm.mrp),
        stock: Number(addForm.stock),
        images: [addForm.imageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500']
      };
      delete payload.imageUrl;
      const { data } = await api.post('/products', payload);
      setProducts([data.product, ...products]);
      setShowAddForm(false);
      setAddForm(EMPTY_FORM);
      toast.success('✅ Product created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product._id);
    setEditForm({
      name: product.name,
      brand: product.brand,
      price: product.price,
      mrp: product.mrp,
      category: product.category,
      stock: product.stock,
      description: product.description,
      imageUrl: product.images?.[0] || ''
    });
    setShowAddForm(false); // close add form if open
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editForm,
        price: Number(editForm.price),
        mrp: Number(editForm.mrp),
        stock: Number(editForm.stock),
        images: [editForm.imageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500']
      };
      delete payload.imageUrl;
      const { data } = await api.put(`/products/${editingProduct}`, payload);
      setProducts(products.map(p => p._id === editingProduct ? data.product : p));
      setEditingProduct(null);
      setEditForm(EMPTY_FORM);
      toast.success('✅ Product updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const cancelEdit = () => { setEditingProduct(null); setEditForm(EMPTY_FORM); };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="page container">
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Manage Products</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/admin'}>Overview</button>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/admin/orders'}>Orders</button>
          <button className="btn btn-primary">Products</button>
          <button className="btn btn-outline" onClick={() => { setShowAddForm(!showAddForm); setEditingProduct(null); }}>
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      {/* ── Edit Form (shows at top when editing) ── */}
      {editingProduct && (
        <div className="card" style={{ padding: '24px', marginBottom: '32px', border: '1px solid var(--accent)', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--accent)' }}>✏️ Edit Product</h2>
            <button className="btn btn-sm btn-secondary" onClick={cancelEdit}><X size={16} /> Cancel</button>
          </div>
          <ProductForm formData={editForm} setFormData={setEditForm} onSubmit={handleUpdate} onCancel={cancelEdit} submitLabel="Save Changes" />
        </div>
      )}

      {/* ── Add Form ── */}
      {showAddForm && !editingProduct && (
        <div className="card" style={{ padding: '24px', marginBottom: '32px', background: 'var(--bg-secondary)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Add New Product</h2>
          <ProductForm formData={addForm} setFormData={setAddForm} onSubmit={handleCreate} onCancel={() => setShowAddForm(false)} submitLabel="Create Product" />
        </div>
      )}

      {/* ── Search ── */}
      <div style={{ display: 'flex', marginBottom: '24px', position: 'relative' }}>
        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="form-input"
          placeholder={`Search ${products.length} products by name or brand...`}
          style={{ paddingLeft: '48px', maxWidth: '440px' }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ── Products Table ── */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Info</th>
              <th>Category</th>
              <th>Price / MRP</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product._id} style={{ background: editingProduct === product._id ? 'var(--accent-light)' : 'transparent' }}>
                <td>
                  <img
                    src={product.images?.[0] || 'https://placehold.co/50x50/png'}
                    alt={product.name}
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                    onError={e => { e.target.src = 'https://placehold.co/50x50/png'; }}
                  />
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{product.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{product.brand}</div>
                </td>
                <td>
                  <span className="status-badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    {product.category}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 700 }}>{formatPrice(product.price)}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{formatPrice(product.mrp)}</div>
                </td>
                <td>
                  <span style={{ color: product.stock <= 0 ? 'var(--danger)' : product.stock < 10 ? 'var(--warning)' : 'var(--success)', fontWeight: 700 }}>
                    {product.stock <= 0 ? 'Out of Stock' : product.stock}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(product)} title="Edit product">
                      <Edit size={14} />
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(product._id)} title="Delete product">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
