// In a production build, localhost points to each visitor's own computer.
// Ignore a local development URL accidentally included in the production env.
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const localApiUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i;
const productionApiUrl = "https://bs3-backend.onrender.com/api";
const developmentApiUrl = "http://localhost:5000/api";

export const API_URL = (
  configuredApiUrl && !(import.meta.env.PROD && localApiUrl.test(configuredApiUrl))
    ? configuredApiUrl
    : import.meta.env.PROD
      ? productionApiUrl
      : developmentApiUrl
).replace(/\/$/, "");

// Récupérer le jeton de connexion de l'administrateur
function getAuthHeaders() {
  const token = sessionStorage.getItem("bs3_admin_token");

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

// Charger tous les produits
export async function getProducts() {
  const response = await fetch(`${API_URL}/products`);

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message || "Impossible de charger les produits depuis l'API."
    );
  }

  return result.data || [];
}

// Ajouter un produit
export async function createProduct(product) {
  return request("/products", "POST", product);
}

// Modifier un produit
export async function updateProduct(id, product) {
  return request(`/products/${id}`, "PUT", product);
}

// Supprimer un produit
export async function deleteProduct(id) {
  return request(`/products/${id}`, "DELETE");
}

export async function createOrder(order) {
  return request("/orders", "POST", order);
}

export async function getOrders() {
  const response = await fetch(`${API_URL}/orders`, {
    headers: getAuthHeaders(),
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Impossible de charger les commandes.");
  }

  return result.data || [];
}

// Fonction commune pour envoyer les requêtes au backend
async function request(path, method, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "Accès refusé. Vérifiez votre connexion administrateur."
      );
    }

    throw new Error(result.message || "La requête a échoué.");
  }

  return result.data;
}
