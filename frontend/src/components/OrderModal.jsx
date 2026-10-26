import { useState } from "react";
import { X } from "lucide-react";
import { createOrder } from "../services/productService.js";

const initialCustomer = {
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: ""
};

export default function OrderModal({ items, onClose, onQuantityChange, onRemove, onOrderComplete }) {
  const [customer, setCustomer] = useState(initialCustomer);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const total = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const result = await createOrder({
        items: items.map(({ product, quantity: itemQuantity }) => ({
          productId: product._id,
          quantity: itemQuantity
        })),
        customer
      });
      setMessage(result.message);
      setSubmitted(true);
      onOrderComplete?.();
    } catch (error) {
      setMessage(error.message || "Impossible d'enregistrer la commande.");
    } finally {
      setBusy(false);
    }
  }

  function updateCustomer(event) {
    setCustomer((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="product-modal order-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">COMMANDE BS3</span>
            <h3 id="order-title">{submitted ? "Commande reçue" : "Finaliser la commande"}</h3>
            {!submitted && <p>Renseignez vos coordonnées pour que nous puissions vous recontacter.</p>}
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fermer">
            <X />
          </button>
        </div>

        {message && <p className="admin-message" role="status">{message}</p>}

        {!submitted && items.length === 0 ? (
          <div className="dashboard-empty"><p>Votre panier est vide.</p></div>
        ) : !submitted && (
          <form onSubmit={submit} className="product-form">
            <div className="checkout-items">
              {items.map(({ product, quantity: itemQuantity }) => {
                const key = String(product._id || product.name);
                return (
                  <div className="checkout-item" key={key}>
                    <div><strong>{product.name}</strong><small>{Number(product.price).toLocaleString("fr-FR")} FCFA / unité</small></div>
                    {onQuantityChange ? (
                      <input aria-label={`Quantité de ${product.name}`} type="number" min="1" max="100" value={itemQuantity} onChange={(event) => onQuantityChange(key, event.target.value)} />
                    ) : <span>× {itemQuantity}</span>}
                    {onRemove && <button className="checkout-remove" type="button" onClick={() => onRemove(key)}>Retirer</button>}
                  </div>
                );
              })}
            </div>
            <label>
              Votre nom
              <input name="name" autoComplete="name" maxLength="120" value={customer.name} onChange={updateCustomer} required />
            </label>
            <label>
              Téléphone
              <input name="phone" type="tel" autoComplete="tel" maxLength="40" value={customer.phone} onChange={updateCustomer} required />
            </label>
            <label>
              E-mail (facultatif)
              <input name="email" type="email" autoComplete="email" maxLength="254" value={customer.email} onChange={updateCustomer} />
            </label>
            <label>
              Adresse de livraison ou lieu de contact
              <textarea name="address" autoComplete="street-address" rows="2" maxLength="500" value={customer.address} onChange={updateCustomer} required />
            </label>
            <label>
              Précisions (facultatif)
              <textarea name="notes" rows="2" maxLength="1000" value={customer.notes} onChange={updateCustomer} />
            </label>
            <p className="order-total">Total indicatif : <strong>{total.toLocaleString("fr-FR")} FCFA</strong></p>
            <button className="button full-button" type="submit" disabled={busy}>
              {busy ? "Envoi de la commande…" : "Envoyer ma commande"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
