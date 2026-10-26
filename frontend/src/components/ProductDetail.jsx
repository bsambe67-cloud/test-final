import { useState } from "react";
import { ArrowLeft, ShoppingCart, MessageCircle, CheckCircle2 } from "lucide-react";
import OrderModal from "./OrderModal.jsx";

export default function ProductDetail({ product, loading, onBack, onAddToCart, onCartOpen }) {
  const [quantity, setQuantity] = useState(1);
  const [orderOpen, setOrderOpen] = useState(false);
  const [added, setAdded] = useState(false);

  if (loading && !product) {
    return <section className="product-detail section"><p className="empty-state">Chargement du produit…</p></section>;
  }

  if (!product) {
    return (
      <section className="product-detail section">
        <button className="text-link detail-back" type="button" onClick={onBack}><ArrowLeft size={17}/> Retour aux produits</button>
        <div className="empty-state">Ce produit est introuvable.</div>
      </section>
    );
  }

  const image = product.image || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=85";
  const price = Number(product.price) || 0;

  function addToCart() {
    onAddToCart(product, Number(quantity));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  return (
    <section className="product-detail section">
      <button className="text-link detail-back" type="button" onClick={onBack}><ArrowLeft size={17}/> Retour aux produits</button>
      <div className="product-detail-layout">
        <div className="product-detail-image">
          <img src={image} alt={product.name} onError={(event) => { event.currentTarget.src = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=85"; }} />
          <span className="product-category">{product.category}</span>
          {!product.available && <span className="unavailable">Indisponible</span>}
        </div>
        <div className="product-detail-info">
          <span className="eyebrow">{product.category || "PRODUIT BS3"}</span>
          <h1>{product.name}</h1>
          <strong className="product-detail-price">{price.toLocaleString("fr-FR")} <small>FCFA</small></strong>
          <div className="detail-divider" />
          <h2>Description</h2>
          <p className="product-full-description">{product.description || "Contactez BS3 pour obtenir plus d'informations sur ce produit."}</p>
          <p className="detail-availability"><CheckCircle2 size={17}/> {product.available ? "Disponible à la commande" : "Actuellement indisponible"}</p>
          <label className="detail-quantity">
            Quantité
            <input type="number" min="1" max="100" value={quantity} onChange={(event) => setQuantity(Math.min(100, Math.max(1, Number(event.target.value) || 1)))} disabled={!product.available} />
          </label>
          <p className="detail-subtotal">Sous-total : <strong>{(price * quantity).toLocaleString("fr-FR")} FCFA</strong></p>
          <div className="detail-actions">
            <button className="button" type="button" onClick={addToCart} disabled={!product.available || !product._id}><ShoppingCart size={18}/> Ajouter au panier</button>
            <button className="button button-outline" type="button" onClick={() => setOrderOpen(true)} disabled={!product.available || !product._id}><MessageCircle size={18}/> Commander</button>
          </div>
          {added && <p className="cart-added-message" role="status">Produit ajouté au panier. <button type="button" onClick={onCartOpen}>Voir le panier</button></p>}
        </div>
      </div>
      {orderOpen && <OrderModal items={[{ product, quantity: Number(quantity) }]} onClose={() => setOrderOpen(false)} />}
    </section>
  );
}
