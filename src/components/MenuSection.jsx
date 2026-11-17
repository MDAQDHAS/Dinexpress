import React, { useState, useMemo } from 'react';
import { useWebApp } from '../context/WebAppContext';
import { CATEGORIES } from '../constants/MockData';
import ProductCard from './ProductCard';
import {
  LayoutGrid,
  Coffee,
  ChefHat,
  Cookie,
  Wine,
  Cake,
  PenTool,
  SlidersHorizontal,
  Search,
  X,
  Sparkles,
} from 'lucide-react';

const iconMap = {
  All: LayoutGrid,
  Breakfast: Coffee,
  Lunch: ChefHat,
  Snacks: Cookie,
  Drinks: Wine,
  Cakes: Cake,
  Stationery: PenTool,
};

export default function MenuSection() {
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    activeTab,
    favorites,
  } = useWebApp();

  const [dietFilter, setDietFilter] = useState('all'); // 'all', 'veg', 'nonveg'
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended', 'price-low', 'price-high', 'rating'

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Favorites tab filter
    if (activeTab === 'favorites') {
      list = list.filter((p) => favorites.includes(Number(p.id)));
    }

    // Category Filter
    if (selectedCategory !== 'All') {
      list = list.filter(
        (p) => (p.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.desc && p.desc.toLowerCase().includes(q))
      );
    }

    // Diet Filter
    if (dietFilter === 'veg') {
      list = list.filter((p) => {
        const isNonVeg =
          p.name.toLowerCase().includes('chicken') ||
          p.name.toLowerCase().includes('mutton') ||
          p.name.toLowerCase().includes('egg');
        return !isNonVeg;
      });
    } else if (dietFilter === 'nonveg') {
      list = list.filter((p) => {
        const isNonVeg =
          p.name.toLowerCase().includes('chicken') ||
          p.name.toLowerCase().includes('mutton') ||
          p.name.toLowerCase().includes('egg');
        return isNonVeg;
      });
    }

    // Sorting
    if (sortBy === 'price-low') {
      list.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (parseFloat(b.rating) || 4.5) - (parseFloat(a.rating) || 4.5));
    }

    return list;
  }, [products, selectedCategory, searchQuery, dietFilter, sortBy, activeTab, favorites]);

  return (
    <section id="menu-section" className="menu-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-block">
          <div>
            <h2 className="section-title">
              {activeTab === 'favorites' ? 'Your Favorite Dishes ❤️' : 'Explore Canteen Menu'}
            </h2>
            <p className="section-subtitle">
              {activeTab === 'favorites'
                ? 'Quick access to the meals you love the most.'
                : 'Freshly prepared meals, snacks, beverages and campus stationery items.'}
            </p>
          </div>

          <div className="menu-sort-controls">
            <span className="sort-label">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="recommended">Featured / Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated ★</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills (Only if not in favorites tab) */}
        {activeTab !== 'favorites' && (
          <div className="category-scroll-wrapper">
            <div className="category-pill-row">
              {CATEGORIES.map((cat) => {
                const IconComponent = iconMap[cat.name] || LayoutGrid;
                const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`category-tab-btn ${isSelected ? 'active-tab' : ''}`}
                  >
                    <IconComponent size={18} className="cat-icon" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sub-Filters: Veg / Non-Veg + Search indicator */}
        <div className="sub-filter-row">
          <div className="diet-toggles">
            <button
              onClick={() => setDietFilter('all')}
              className={`diet-btn ${dietFilter === 'all' ? 'active' : ''}`}
            >
              All Types
            </button>
            <button
              onClick={() => setDietFilter('veg')}
              className={`diet-btn veg-diet ${dietFilter === 'veg' ? 'active' : ''}`}
            >
              <span className="mini-veg-dot"></span> Pure Veg
            </button>
            <button
              onClick={() => setDietFilter('nonveg')}
              className={`diet-btn nonveg-diet ${dietFilter === 'nonveg' ? 'active' : ''}`}
            >
              <span className="mini-nonveg-dot"></span> Non-Veg
            </button>
          </div>

          <div className="filter-count-label">
            <span>
              Showing <strong>{filteredProducts.length}</strong> items
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="clear-search-pill">
                Clear search <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Food & Item Cards Responsive Grid */}
        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state-box">
            <div className="empty-icon-circle">
              <Search size={32} color="#FE8C00" />
            </div>
            <h3>No items found</h3>
            <p>
              {activeTab === 'favorites'
                ? "You haven't added any favorites yet! Tap the heart icon on any dish."
                : `We couldn't find any dishes matching "${searchQuery}".`}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setDietFilter('all');
              }}
              className="btn-primary"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
