import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import ProductCard from "./ProductCard.jsx";

export default function Products({ products, loading, apiError, onProductOpen, onAddToCart }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Toutes");
  const categories = useMemo(() => ["Toutes", ...new Set(products.map((p) => p.category).filter(Boolean))], [products]);
  const filtered = products.filter((p) => {
    const query = search.toLowerCase().trim();
    return (!query || `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(query))
      && (category === "Toutes" || p.category === category);
  });
  return <section className="section products-section section-anchor" id="produits">
    <div className="section-heading">
      <span className="eyebrow">NOTRE SÉLECTION</span>
      <h2>Des produits adaptés à <span>vos besoins</span></h2>
      <p>Découvrez nos équipements informatiques, électroménagers et professionnels.</p>
    </div>
    <div className="catalog-tools">
      <label className="search-field"><Search size={19}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit..." aria-label="Rechercher un produit"/></label>
      <label className="category-field"><SlidersHorizontal size={17}/><select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filtrer par catégorie">{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
    </div>
    {apiError && <div className="notice"><strong>Mode démonstration :</strong> le catalogue réel est indisponible ou vide. Les produits affichés sont des exemples ; connectez MongoDB et ajoutez le catalogue pour activer les commandes.</div>}
    {loading ? <div className="empty-state">Chargement des produits…</div> :
      filtered.length ? <div className="product-grid">{filtered.map((p) => <ProductCard key={p._id || p.name} product={p} onOpen={() => onProductOpen(p)} onAddToCart={onAddToCart}/>)}</div> :
      <div className="empty-state">Aucun produit ne correspond à votre recherche.</div>}
  </section>;
}
