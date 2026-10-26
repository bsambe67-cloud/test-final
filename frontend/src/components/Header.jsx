import { useState } from "react";
import { Menu, X, Search, Phone, ShoppingCart } from "lucide-react";

const links = [
  ["Accueil", "#accueil"], ["À propos", "#apropos"], ["Produits", "#produits"],
  ["Services", "#services"], ["Contact", "#contact"]
];

export default function Header({ onNavigate, cartCount = 0, onCartOpen }) {
  const [open, setOpen] = useState(false);
  function followLink(event, href) {
    event.preventDefault();
    setOpen(false);
    onNavigate(href);
  }
  return <>
    <div className="top-bar">
      <span>Bienvenue chez BS3 Entreprise Multiservices</span>
      <div><span>📍 Meckhé, Sénégal</span><a href="tel:+221778794493"><Phone size={14}/> +221 77 879 44 93</a><a href="mailto:babacarsambe2022@gmail.com">✉ babacarsambe2022@gmail.com</a></div>
    </div>
    <header className="site-header">
      <a className="brand" href="/#accueil" onClick={(event) => followLink(event, "#accueil")} aria-label="BS3 Accueil">
        <div className="brand-mark">BS3</div>
        <div><strong>BS3</strong><small>ENTREPRISE MULTISERVICES</small></div>
      </a>
      <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-label="Ouvrir le menu">{open ? <X/> : <Menu/>}</button>
      <nav className={open ? "nav-links open" : "nav-links"}>
        {links.map(([label, href]) => <a key={href} href={href} onClick={(event) => followLink(event, href)}>{label}</a>)}
      </nav>
      <div className="header-actions">
        <button className="button button-small cart-button" type="button" onClick={onCartOpen} aria-label={`Ouvrir le panier, ${cartCount} article(s)`}>
          <ShoppingCart size={17}/> Panier <span className="cart-count">{cartCount}</span>
        </button>
        <a className="button button-small header-cta" href="#contact" onClick={(event) => followLink(event, "#contact")}><Search size={16}/> Nous contacter</a>
      </div>
    </header>
  </>;
}
