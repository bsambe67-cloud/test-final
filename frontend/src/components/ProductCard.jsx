import { Eye, ShoppingCart } from "lucide-react";

export default function ProductCard({ product, onOpen, onAddToCart }) {
  const image = product.image || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=85";
  return <article className="product-card">
    <button className="product-image-wrap product-open-button" type="button" onClick={onOpen} aria-label={`Voir ${product.name}`}>
      <img src={image} alt={product.name} loading="lazy" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=85"; }} />
      <span className="product-category">{product.category}</span>
      {!product.available && <span className="unavailable">Indisponible</span>}
    </button>
    <div className="product-content">
      <button className="product-title-button" type="button" onClick={onOpen}><h3>{product.name}</h3></button>
      <p>{product.description || "Contactez-nous pour en savoir plus sur ce produit."}</p>
      <div className="product-bottom">
        <strong className="price">{Number(product.price).toLocaleString("fr-FR")} <small>FCFA</small></strong>
        <div className="product-card-actions">
          <button className="order-button detail-button" type="button" onClick={onOpen} aria-label={`Voir ${product.name}`}><Eye size={16}/> Détails</button>
          <button className="order-button cart-add-button" type="button" onClick={() => onAddToCart(product)} disabled={!product.available || !product._id} aria-label={`Ajouter ${product.name} au panier`}><ShoppingCart size={16}/> Panier</button>
        </div>
      </div>
    </div>
  </article>;
}
