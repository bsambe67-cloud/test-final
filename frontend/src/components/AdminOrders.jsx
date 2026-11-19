import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ShoppingBag } from "lucide-react";
import { getOrders } from "../services/productService.js";

const emailStatus = {
  sent: "E-mail envoyé",
  failed: "Échec de l'e-mail",
  not_configured: "E-mail non configuré"
};

const smsStatus = {
  sent: "SMS envoye",
  failed: "Echec du SMS",
  not_configured: "SMS non configure"
};

const whatsappStatus = {
  sent: "WhatsApp envoyé",
  failed: "Échec WhatsApp",
  not_configured: "WhatsApp non configuré"
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setError("");
    try {
      setOrders(await getOrders());
    } catch (loadError) {
      setError(loadError.message || "Impossible de charger les commandes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = window.setInterval(refresh, 30000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  return (
    <section className="orders-panel" aria-labelledby="orders-title">
      <div className="dashboard-panel-heading">
        <div>
          <h3 id="orders-title">Commandes reçues ({orders.length})</h3>
          <p>Actualisation automatique toutes les 30 secondes</p>
        </div>
        <button className="button orders-refresh" type="button" onClick={refresh} disabled={loading} aria-label="Actualiser les commandes">
          <RefreshCw size={16} /> Actualiser
        </button>
      </div>

      {error && <p className="admin-message order-error" role="alert">{error}</p>}

      {loading ? (
        <div className="dashboard-empty">Chargement des commandes…</div>
      ) : orders.length ? (
        <div className="orders-list">
          {orders.map((order) => {
            const items = order.items?.length
              ? order.items
              : [{ name: order.product?.name || "Produit", quantity: order.quantity }];
            return (
              <article className="order-admin-card" key={order._id}>
                <div className="order-admin-heading">
                  <div className="dashboard-product-icon"><ShoppingBag size={20} /></div>
                  <div>
                    <strong>{items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</strong>
                    <small>{new Date(order.createdAt).toLocaleString("fr-FR")}</small>
                  </div>
                  <div className="order-notification-statuses">
                    <span className={`order-email-status ${order.emailNotification}`}>
                      {emailStatus[order.emailNotification] || "Statut e-mail inconnu"}
                    </span>
                    <span className={`order-email-status ${order.smsNotification || "not_configured"}`}>
                      {smsStatus[order.smsNotification] || "Statut SMS inconnu"}
                    </span>
                    <span className={`order-email-status ${order.whatsappNotification || "not_configured"}`}>
                      {whatsappStatus[order.whatsappNotification] || "Statut WhatsApp inconnu"}
                    </span>
                  </div>
                </div>
                <div className="order-admin-details">
                  <span><strong>Client :</strong> {order.customer.name}</span>
                  <span><strong>Téléphone :</strong> <a href={`tel:${order.customer.phone}`}>{order.customer.phone}</a></span>
                  {order.customer.email && <span><strong>E-mail :</strong> <a href={`mailto:${order.customer.email}`}>{order.customer.email}</a></span>}
                  <span><strong>Adresse :</strong> {order.customer.address}</span>
                  {order.customer.notes && <span><strong>Précisions :</strong> {order.customer.notes}</span>}
                  <span><strong>Total :</strong> {Number(order.total).toLocaleString("fr-FR")} FCFA</span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="dashboard-empty"><ShoppingBag size={32} /><p>Aucune commande reçue pour le moment.</p></div>
      )}
    </section>
  );
}
