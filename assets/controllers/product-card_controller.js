// Product Card Web Component with Swiper support
import Swiper from "swiper/bundle";

class ProductCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.swiper = null;
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
    this.initSwiper();
  }

  disconnectedCallback() {
    if (this.swiper) {
      this.swiper.destroy();
      this.swiper = null;
    }
  }

  static get observedAttributes() {
    return [
      "product-id",
      "product-name",
      "product-price",
      "product-description",
      "product-image",
      "product-images",
      "product-stock",
      "product-category",
      "is-authenticated",
      "view-mode",
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
      if (
        name === "product-images" ||
        name === "product-image" ||
        name === "view-mode"
      ) {
        // Re-initialize Swiper when images or view mode changes
        setTimeout(() => this.initSwiper(), 100);
      }
    }
  }

  get productId() {
    return this.getAttribute("product-id");
  }

  get productName() {
    return this.getAttribute("product-name");
  }

  get productPrice() {
    return this.getAttribute("product-price");
  }

  get productDescription() {
    return this.getAttribute("product-description");
  }

  get productImage() {
    return this.getAttribute("product-image");
  }

  get productImages() {
    const imagesAttr = this.getAttribute("product-images");
    if (imagesAttr) {
      try {
        return JSON.parse(imagesAttr);
      } catch (e) {
        return [];
      }
    }
    return this.productImage ? [this.productImage] : [];
  }

  get productStock() {
    return parseInt(this.getAttribute("product-stock")) || 0;
  }

  get productCategory() {
    return this.getAttribute("product-category");
  }

  get isAuthenticated() {
    return this.getAttribute("is-authenticated") === "true";
  }

  get productUrl() {
    return this.getAttribute("product-url");
  }

  get viewMode() {
    return this.getAttribute("view-mode") || "grid";
  }

  initSwiper() {
    // Clean up existing swiper
    if (this.swiper) {
      this.swiper.destroy();
      this.swiper = null;
    }

    const swiperContainer = this.shadowRoot.querySelector(".swiper");
    if (!swiperContainer || this.productImages.length <= 1) {
      return;
    }

    // Wait for next frame to ensure DOM is ready
    requestAnimationFrame(() => {
      // Initialize Swiper
      this.swiper = new Swiper(swiperContainer, {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: this.productImages.length > 1,
        allowTouchMove: true,
        grabCursor: true,
        pagination: {
          el: swiperContainer.querySelector(".swiper-pagination"),
          clickable: true,
        },
        navigation: {
          nextEl: swiperContainer.querySelector(".swiper-button-next"),
          prevEl: swiperContainer.querySelector(".swiper-button-prev"),
        },
      });
    });
  }

  render() {
    const stock = this.productStock;
    let stockHTML = "";
    let stockClass = "";

    if (stock > 10) {
      stockHTML = `✓ En stock (${stock} disponibles)`;
      stockClass = "stock-available";
    } else if (stock > 0) {
      stockHTML = `⚠ Stock limité (${stock} restants)`;
      stockClass = "stock-low";
    } else {
      stockHTML = "✗ Rupture de stock";
      stockClass = "stock-out";
    }

    let addToCartButton = "";
    if (this.isAuthenticated && stock > 0) {
      addToCartButton = `
        <button class="add-to-cart-btn" id="add-to-cart">
          🛒 Ajouter au panier
        </button>
      `;
    } else if (stock <= 0) {
      addToCartButton = `
        <button class="add-to-cart-btn" disabled>Rupture de stock</button>
      `;
    } else {
      addToCartButton = `
        <a href="/login" class="add-to-cart-btn" style="text-align: center; text-decoration: none; display: block;">
          Connectez-vous pour acheter
        </a>
      `;
    }

    const description = this.productDescription || "";
    const truncatedDescription =
      description.length > 120
        ? description.slice(0, 120) + "..."
        : description;

    const images = this.productImages;
    const hasMultipleImages = images.length > 1;

    // Generate image gallery HTML
    let imageHTML;
    if (images.length === 0) {
      imageHTML = '<div class="product-emoji">⌨️</div>';
    } else if (hasMultipleImages) {
      imageHTML = `
        <div class="swiper">
          <div class="swiper-wrapper">
            ${images
              .map(
                (img) => `
              <div class="swiper-slide">
                <img src="${img}" alt="${this.productName}" />
              </div>
            `
              )
              .join("")}
          </div>
          <div class="swiper-pagination"></div>
          <div class="swiper-button-prev"></div>
          <div class="swiper-button-next"></div>
        </div>
      `;
    } else {
      imageHTML = `<img src="${images[0]}" alt="${this.productName}" />`;
    }

    const isFullWidth = this.viewMode === "full";

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css');

        :host {
          display: block;
        }

        .product-card {
          background: white;
          border: 5px solid #0e112b;
          border-radius: 22px;
          overflow: hidden;
          transition: transform 0.3s, box-shadow 0.3s;
          height: 100%;
          display: flex;
          flex-direction: ${isFullWidth ? "row" : "column"};
          cursor: pointer;
          position: relative;
        }

        .product-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        
        .card-link-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .product-image {
          height: ${isFullWidth ? "400px" : "250px"};
          width: ${isFullWidth ? "400px" : "100%"};
          background: #ddf4ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 80px;
          overflow: hidden;
          position: relative;
          flex-shrink: 0;
        }
        
        @media (max-width: 768px) {
          .product-image {
            width: 100%;
            height: 250px;
          }
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-emoji {
          font-size: 80px;
        }

        .swiper {
          width: 100%;
          height: 100%;
          position: relative;
          z-index: 2;
        }

        .swiper-slide {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .swiper-slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .swiper-pagination {
          bottom: 10px !important;
          z-index: 3;
        }

        .swiper-pagination-bullet {
          background: white;
          opacity: 0.7;
        }

        .swiper-pagination-bullet-active {
          background: #0e112b;
          opacity: 1;
        }

        .swiper-button-prev,
        .swiper-button-next {
          color: white;
          background: rgba(14, 17, 43, 0.7);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          transition: all 0.3s;
          z-index: 3;
        }

        .swiper-button-prev:hover,
        .swiper-button-next:hover {
          background: rgba(14, 17, 43, 0.9);
        }

        .swiper-button-prev:after,
        .swiper-button-next:after {
          font-size: 20px;
        }
        
        .swiper-button-prev.swiper-button-disabled,
        .swiper-button-next.swiper-button-disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .product-info {
          padding: ${isFullWidth ? "40px" : "25px"};
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .product-category {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }

        .product-name {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: ${isFullWidth ? "32px" : "24px"};
          color: #0e112b;
          margin-bottom: 10px;
        }

        .product-description {
          font-family: 'Inter', sans-serif;
          font-size: ${isFullWidth ? "16px" : "15px"};
          color: #666;
          margin-bottom: 15px;
          line-height: 1.5;
          flex: 1;
        }

        .product-stock {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          margin-bottom: 15px;
        }

        .stock-available {
          color: #10b981;
          font-weight: 600;
        }

        .stock-low {
          color: #f59e0b;
          font-weight: 600;
        }

        .stock-out {
          color: #ef4444;
          font-weight: 600;
        }

        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .product-price {
          font-family: 'Oxanium', sans-serif;
          font-weight: 700;
          font-size: ${isFullWidth ? "32px" : "28px"};
          color: #0e112b;
        }

        .product-actions {
          display: flex;
          gap: 10px;
          ${isFullWidth ? "flex-wrap: wrap;" : ""}
          position: relative;
          z-index: 2;
        }

        .add-to-cart-btn {
          background: #0e112b;
          color: white;
          border: none;
          padding: 12px 25px;
          border-radius: 11px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
          flex: 1;
        }

        .add-to-cart-btn:hover:not(:disabled) {
          background: #181e4b;
          transform: scale(1.05);
        }

        .add-to-cart-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .view-details-btn {
          background: transparent;
          color: #0e112b;
          border: 2px solid #0e112b;
          padding: 10px 20px;
          border-radius: 11px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
          transition: all 0.3s;
          display: inline-block;
        }

        .view-details-btn:hover {
          background: #0e112b;
          color: white;
        }
      </style>

      <div class="product-card">
        <a href="${
          this.productUrl
        }" class="card-link-overlay" aria-label="View ${this.productName}"></a>
        <div class="product-image">
          ${imageHTML}
        </div>
        <div class="product-info">
          <div class="product-category">${this.productCategory}</div>
          <h3 class="product-name">${this.productName}</h3>
          <p class="product-description">${
            isFullWidth ? description : truncatedDescription
          }</p>
          
          <div class="product-stock">
            <span class="${stockClass}">${stockHTML}</span>
          </div>

          <div class="product-footer">
            <span class="product-price">${parseFloat(this.productPrice).toFixed(
              2
            )} €</span>
          </div>
          
          <div class="product-actions">
            ${addToCartButton}
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const addToCartBtn = this.shadowRoot.getElementById("add-to-cart");
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.addToCart();
      });
    }
  }

  addToCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingItem = cart.find((item) => item.id === this.productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: this.productId,
        name: this.productName,
        price: parseFloat(this.productPrice),
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    this.updateCartDisplay();
    this.showNotification("Produit ajouté au panier !");

    // Dispatch custom event for cart update
    this.dispatchEvent(
      new CustomEvent("cart-updated", {
        bubbles: true,
        composed: true,
        detail: { cart },
      })
    );
  }

  updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const cartBadge = document.querySelector(".cart-badge");
    if (cartBadge) {
      cartBadge.textContent = cartCount;
      cartBadge.style.display = cartCount > 0 ? "flex" : "none";
    }
  }

  showNotification(message) {
    // Dispatch event to main app
    this.dispatchEvent(
      new CustomEvent("show-notification", {
        bubbles: true,
        composed: true,
        detail: { message },
      })
    );
  }
}

// Register the custom element
customElements.define("product-card", ProductCard);

export default ProductCard;
