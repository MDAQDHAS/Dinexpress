import React from 'react';
import { useWebApp } from '../context/WebAppContext';
import { getItemImage } from '../constants/MockData';
import { Heart, Plus, Minus, Star, ShoppingBag } from 'lucide-react';

export default function ProductCard({ product }) {
  const { cartItems, addToCart, updateQuantity, toggleFavorite, isFavorite } = useWebApp();

  const cartEntry = cartItems.find((item) => item.id === product.id);
  const inCart = !!cartEntry;
  const isFav = isFavorite(product.id);
  const imageUrl = product.image_url || getItemImage(product.name);

  const isVeg = product.is_veg !== undefined ? product.is_veg : !product.name.toLowerCase().includes('chicken') && !product.name.toLowerCase().includes('mutton') && !product.name.toLowerCase().includes('egg');

  return (
    <div className={`product-card ${product.is_available === false ? 'product-disabled' : ''}`}>
      {/* Top Image Box */}
      <div className="product-image-container">
        <img
          src={imageUrl}
          alt={product.name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = '/images/Logo.jpeg';
          }}
        />

        {/* Veg / Non-Veg Indicator */}
        <div className={`diet-badge ${isVeg ? 'diet-veg' : 'diet-nonveg'}`} title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}>
          <div className="diet-dot"></div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className={`fav-button ${isFav ? 'is-fav' : ''}`}
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={16} fill={isFav ? '#FF4D4D' : 'none'} color={isFav ? '#FF4D4D' : '#666666'} />
        </button>

        {/* Category Tag */}
        <span className="product-category-badge">{product.category}</span>
      </div>

      {/* Product Content Details */}
      <div className="product-info">
        <div className="product-meta-row">
          <div className="rating-pill">
            <Star size={12} fill="#F59E0B" color="#F59E0B" />
            <span>{product.rating || '4.5'}</span>
          </div>
          {product.is_available === false && (
            <span className="sold-out-badge">Sold Out</span>
          )}
        </div>

        <h3 className="product-title">{product.name}</h3>
        <p className="product-desc">{product.desc || `${product.name} prepared fresh daily at DineExpress canteen.`}</p>

        {/* Bottom Price & Action */}
        <div className="product-bottom-row">
          <div className="price-tag">
            <span className="currency-symbol">₹</span>
            <span className="price-value">{parseFloat(product.price).toFixed(0)}</span>
          </div>

          {product.is_available === false ? (
            <button disabled className="btn-add-cart disabled">
              Unavailable
            </button>
          ) : inCart ? (
            <div className="qty-control-pill">
              <button
                onClick={() => updateQuantity(product.id, -1)}
                className="qty-btn"
                title="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="qty-number">{cartEntry.quantity}</span>
              <button
                onClick={() => updateQuantity(product.id, 1)}
                className="qty-btn qty-plus"
                title="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product)}
              className="btn-add-cart"
              title="Add to order"
            >
              <ShoppingBag size={14} />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
