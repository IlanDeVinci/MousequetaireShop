# 🚀 Guide de Démarrage Rapide

## Démarrage du Serveur

```bash
cd C:\Users\Ilan\Documents\GitHub\MousequetaireShop
php -S localhost:8080 -t public
```

## URLs Importantes

- **Page d'accueil:** http://localhost:8080
- **Produits:** http://localhost:8080/products
- **Panier:** http://localhost:8080/cart
- **Admin:** http://localhost:8080/admin
- **Test Components:** http://localhost:8080/test-components.html

## Comptes de Test

### Admin

- Email: `admin@shop.com`
- Password: `admin123`

### Client

- Email: `client@shop.com`
- Password: `client123`

## Fonctionnalités Testées

### ✅ Page Produits (/products)

1. **Barre de recherche dynamique**

   - Tapez dans la barre de recherche
   - Les résultats s'affichent en temps réel
   - Cliquez sur un résultat pour voir le produit

2. **Web Components (Cartes Produits)**

   - Toutes les cartes sont maintenant des `<product-card>` custom elements
   - Chaque carte a son JavaScript intégré
   - Le Shadow DOM encapsule les styles

3. **Filtrage**

   - Cochez "En stock uniquement"
   - Cliquez sur "Appliquer"
   - Les produits sont filtrés dynamiquement

4. **Load More**

   - Cliquez sur "Charger plus de produits"
   - Les nouveaux produits sont ajoutés avec animation

5. **Animations ScrollTrigger**
   - Scrollez vers le bas
   - Les cartes apparaissent avec animation fade-in + slide-up

### ✅ Page Produit Détail (/product/{id})

1. **Images correctes**

   - L'image uploadée en backoffice s'affiche
   - Fallback sur emoji si pas d'image

2. **Bouton Ajouter au Panier**
   - Fonctionne maintenant correctement
   - Ajoute le produit au localStorage
   - Met à jour le badge du panier
   - Affiche une notification

### ✅ Animations

1. **Hero (page d'accueil)**

   - Animation scale + fade au chargement
   - Flottement des icônes clavier

2. **ScrollTrigger (toutes les pages)**

   - Cartes produits
   - Section "Pourquoi choisir"
   - Footer
   - Titres de page

3. **Sparkles**
   - Rotation continue sur la section "Pourquoi"

### ✅ Footer

- Background corrigé: `#0e112b` (même couleur que le top-bar)
- Texte blanc
- Icônes Instagram et LinkedIn en blanc

## Test des Web Components

### Option 1 : Page de Test Dédiée

Visitez http://localhost:8080/test-components.html

Cette page permet de :

- Tester la barre de recherche isolément
- Charger des produits de test dynamiquement
- Voir les web components en action sans base de données

### Option 2 : Console JavaScript

Ouvrez la console sur /products et testez :

```javascript
// Charger plus de produits
const loader = new ProductLoader("#products-grid");
await loader.loadMore();

// Filtrer
await loader.filterProducts({ inStock: true });

// Créer une carte manuellement
const card = document.createElement("product-card");
card.setAttribute("product-id", "999");
card.setAttribute("product-name", "Test Product");
card.setAttribute("product-price", "99.99");
card.setAttribute("product-stock", "10");
card.setAttribute("product-category", "Test");
card.setAttribute("product-url", "/product/999");
card.setAttribute("is-authenticated", "true");
document.querySelector(".products-grid").appendChild(card);
```

## Vérification des Corrections

### 1. MIME Type

- ✅ Pas d'erreur dans la console
- ✅ Les modules JS se chargent correctement

### 2. Images Produits

- ✅ Sur /products : images des produits uploadés
- ✅ Sur /product/{id} : image en grand
- ✅ Sur / (homepage) : images dans les 4 cartes

### 3. Boutons Panier

- ✅ PLP (liste) : boutons fonctionnels
- ✅ PDP (détail) : bouton fonctionnel
- ✅ Badge mis à jour
- ✅ Notification affichée

### 4. Animations ScrollTrigger

- ✅ Cartes produits animées au scroll
- ✅ Section "Pourquoi" animée
- ✅ Footer animé
- ✅ Pas d'animation si déjà visible (start: "top 85%")

### 5. Footer

- ✅ Background #0e112b
- ✅ Texte blanc
- ✅ Icônes blanches

## Architecture des Web Components

```
MousequetaireShop/
├── assets/
│   ├── app.js (import des components)
│   └── controllers/
│       ├── product-card_controller.js (Web Component)
│       ├── search-bar_controller.js (Web Component)
│       └── product-loader_controller.js (AJAX Loader)
│
├── src/
│   └── Controller/
│       ├── ProductApiController.php (API REST)
│       └── SearchController.php (API Search)
│
└── templates/
    └── product/
        └── list.html.twig (utilise <product-card>)
```

## Debugging

### Voir les cartes dans le DOM

```javascript
document.querySelectorAll("product-card");
```

### Voir le Shadow DOM d'une carte

```javascript
const card = document.querySelector("product-card");
console.log(card.shadowRoot);
```

### Vérifier le panier

```javascript
console.log(localStorage.getItem("cart"));
```

### Vérifier GSAP

```javascript
console.log(gsap.version);
console.log(ScrollTrigger);
```

## Next Steps / Améliorations Futures

- [ ] Pagination côté serveur
- [ ] Filtres par catégorie (dropdown)
- [ ] Filtres par prix (range slider)
- [ ] Tri (prix, nom, nouveauté)
- [ ] Wishlist
- [ ] Comparateur de produits
- [ ] Vue grille / liste
- [ ] Lazy loading des images
- [ ] Cache API avec Service Worker

---

**Tout est prêt ! 🎉**
