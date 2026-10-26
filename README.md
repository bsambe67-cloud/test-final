# Projetfinal — BS3 Entreprise Multiservices

Application vitrine e-commerce légère pour BS3 Entreprise Multiservices :
- Frontend React + Vite
- Backend Node.js + Express
- MongoDB + Mongoose
- API CRUD des produits
- Recherche et filtre des produits
- Pages de détail avec descriptions complètes et panier persistant
- Commandes enregistrées dans MongoDB et visibles dans l'espace administrateur
- Notification des nouvelles commandes par e-mail (SMTP)
- Espace administrateur protégé pour gérer les produits et consulter les commandes

## Prérequis
- Node.js récent (LTS recommandé)
- npm
- Un compte MongoDB Atlas ou une instance MongoDB accessible

## 1. Installer le backend

Dans un terminal VS Code :

```powershell
cd backend
npm install
```

Copiez `.env.example` vers `.env`, puis renseignez `MONGO_URI`, `JWT_SECRET`, le compte administrateur et les paramètres SMTP.

```powershell
Copy-Item .env.example .env
```

Choisissez un `JWT_SECRET` aléatoire et fort, ainsi que `ADMIN_EMAIL` et `ADMIN_PASSWORD`, puis créez le compte administrateur :

```powershell
npm run create-admin
```

Démarrer le serveur en développement :

```powershell
npm run dev
```

API : `http://localhost:5000/api`
Vérification : `http://localhost:5000/api/health`
Produits : `http://localhost:5000/api/products`

Pour charger les produits de démonstration (facultatif) :

```powershell
npm run seed
```

### Notifications des commandes par e-mail

L'adresse de réception et les réglages SMTP Gmail sont préconfigurés sur `bsambe67@gmail.com` (`smtp.gmail.com`, port `465`, TLS). Pour autoriser l'envoi, activez la validation en deux étapes Google, créez un mot de passe d'application et mettez-le dans `MAIL_PASSWORD` dans `backend/.env` (pas le mot de passe habituel du compte, et sans les espaces de présentation du mot de passe d'application). Vérifiez ensuite la connexion SMTP depuis le dossier `backend` :

```powershell
npm run verify-email
```

La vérification ne transmet aucun e-mail. Si Gmail répond avec une erreur d'authentification `EAUTH`/`535`, régénérez le mot de passe d'application et remplacez la valeur de `MAIL_PASSWORD`. Si vous hébergez le backend, configurez ce secret dans les variables d'environnement de l'hébergeur. Le secret SMTP reste uniquement dans la configuration privée du backend et ne doit jamais être placé dans le frontend ni envoyé dans le chat.

Un clic sur un produit ouvre sa page de détail. Le client peut l'ajouter au panier, puis envoyer tous les articles du panier comme une commande. La commande est conservée dans MongoDB et apparaît dans la section « Commandes reçues » de l'espace administrateur. L'envoi par e-mail est fait par le serveur ; son état est affiché dans l'espace admin. Sans configuration SMTP valide, la commande reste enregistrée et consultable dans l'espace admin, mais l'e-mail ne peut pas être transmis.

## 2. Installer le frontend

Ouvrez un deuxième terminal :

```powershell
cd frontend
npm install
```

Créez `frontend/.env` à partir de `.env.example` :

```powershell
Copy-Item .env.example .env
```

Démarrer React :

```powershell
npm run dev
```

Ouvrez l'adresse affichée par Vite, généralement `http://localhost:5173`.

## 3. Tester le CRUD avec Postman

- `GET http://localhost:5000/api/products`
- `GET http://localhost:5000/api/products/ID_DU_PRODUIT`
- `POST http://localhost:5000/api/products` avec Body > raw > JSON :
```json
{
  "name": "Ordinateur portable HP",
  "category": "Informatique",
  "price": 250000,
  "description": "Ordinateur portable pour le travail et les études",
  "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
  "available": true
}
```
- `PUT http://localhost:5000/api/products/ID_DU_PRODUIT` avec les champs à modifier
- `DELETE http://localhost:5000/api/products/ID_DU_PRODUIT`

Pour POST/PUT, sélectionner `Content-Type: application/json`.

## 4. Images et identité visuelle

Les images de démonstration utilisent des URL d'images externes. Pour mettre le vrai logo et les images de BS3 :
1. Copiez vos images dans `frontend/public/images/`.
2. Utilisez des chemins tels que `/images/logo-babs.png` ou `/images/fond.png`.
3. Évitez les chemins Windows absolus comme `C:\\Users\\...`, qui ne fonctionneront pas après déploiement.

## 5. Déploiement

- MongoDB : créer une base sur MongoDB Atlas, autoriser l'adresse IP du serveur de déploiement et copier l'URI de connexion dans `MONGO_URI`.
- Backend : déployer le dossier `backend` sur un hébergeur Node (par exemple Render). Ajouter `MONGO_URI`, `CLIENT_URL` et `NODE_ENV=production` dans les variables d'environnement de l'hébergeur.
- Frontend : déployer le dossier `frontend` sur un hébergeur statique (par exemple Vercel ou Netlify). Définir `VITE_API_URL` avec l'URL publique du backend, en terminant par `/api`.
- Ajouter le domaine frontend dans `CLIENT_URL` côté backend.
- Ne jamais publier le fichier `.env` ni son URI MongoDB.

## Sécurité avant une mise en production réelle
L'espace administrateur nécessite une connexion et les routes de gestion sont protégées par un jeton. Utilisez des mots de passe forts, conservez les secrets uniquement dans les variables d'environnement du backend et configurez HTTPS avant tout usage public.
