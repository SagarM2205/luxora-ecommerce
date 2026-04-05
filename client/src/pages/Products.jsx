import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ui/ProductCard';

const CATEGORIES = ['Men', 'Women', 'Kids', 'Accessories', 'Footwear', 'Ethnic', 'Winterwear', 'Activewear'];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (sort) params.set('sort', sort);

      setSearchParams(Object.fromEntries(params), { replace: true });

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.products);
      setTotal(data.pagination?.total || data.products.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
  };

  return (
    <div className="page">
      <div className="container">
        <div className="products-layout">
          {/* ── Sidebar ── */}
          <aside className="filters-sidebar">
            {/* Search */}
            <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  style={{ paddingRight: searchInput ? '70px' : '44px' }}
                />
                {searchInput && (
                  <button type="button" onClick={clearSearch} style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                    <X size={14} />
                  </button>
                )}
                <button type="submit" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <Search size={18} />
                </button>
              </div>
            </form>

            {/* Category */}
            <div className="filter-group">
              <h3>Category</h3>
              <div className={`filter-option ${category === '' ? 'active' : ''}`} onClick={() => setCategory('')}>
                All Categories
              </div>
              {CATEGORIES.map(cat => (
                <div key={cat} className={`filter-option ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>
                  {cat}
                </div>
              ))}
            </div>

            {/* Sort */}
            <div className="filter-group">
              <h3>Sort By</h3>
              <select className="form-input" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {/* Active Filters */}
            {(search || category) && (
              <div className="filter-group">
                <h3>Active Filters</h3>
                {search && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--accent-light)', borderRadius: 'var(--radius-md)', marginBottom: '6px', fontSize: '0.85rem' }}>
                    <span>🔍 "{search}"</span>
                    <button onClick={clearSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}><X size={12} /></button>
                  </div>
                )}
                {category && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--accent-light)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                    <span>🏷️ {category}</span>
                    <button onClick={() => setCategory('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}><X size={12} /></button>
                  </div>
                )}
              </div>
            )}
          </aside>

          {/* ── Product Grid ── */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {loading ? 'Loading...' : `${total} product${total !== 1 ? 's' : ''} found`}
                {category && <span style={{ color: 'var(--accent)', fontWeight: 600 }}> in {category}</span>}
              </h2>
            </div>

            {loading ? (
              <div className="loader"><div className="spinner"></div></div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <SlidersHorizontal size={48} />
                <h2>No products found</h2>
                <p>Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="product-grid">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
