// Product Loader - Permet de charger des produits dynamiquement
class ProductLoader {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.currentPage = 1;
    this.isLoading = false;
    this.hasMore = true;
    this.isAuthenticated = document.querySelector(".cart-badge") !== null;
    // Track existing product IDs to avoid duplicates
    this.existingIds = new Set();
    if (this.container) {
      const cards = this.container.querySelectorAll("product-card");
      cards.forEach((card) =>
        this.existingIds.add(card.getAttribute("product-id"))
      );
    }
  }

  async loadMore() {
    if (this.isLoading || !this.hasMore) return;

    this.isLoading = true;
    this.showLoader();

    try {
      this.currentPage++;
      const response = await fetch(
        `/api/products?page=${this.currentPage}&limit=12`
      );
      const data = await response.json();

      if (data.products.length === 0) {
        this.hasMore = false;
        this.hideLoadMoreButton();
        return;
      }

      this.appendProducts(data.products);

      if (this.currentPage >= data.pages) {
        this.hasMore = false;
        this.hideLoadMoreButton();
      }
    } catch (error) {
      console.error("Error loading products:", error);
      this.showError("Erreur lors du chargement des produits");
    } finally {
      this.isLoading = false;
      this.hideLoader();
    }
  }

  async filterProducts(filters) {
    if (this.isLoading) return;

    this.isLoading = true;
    this.showLoader();

    try {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.minPrice) params.append("min_price", filters.minPrice);
      if (filters.maxPrice) params.append("max_price", filters.maxPrice);
      if (filters.inStock) params.append("in_stock", "true");

      const response = await fetch(`/api/products/filter?${params}`);
      const products = await response.json();

      this.clearProducts();
      this.appendProducts(products);
    } catch (error) {
      console.error("Error filtering products:", error);
      this.showError("Erreur lors du filtrage des produits");
    } finally {
      this.isLoading = false;
      this.hideLoader();
    }
  }

  appendProducts(products) {
    products.forEach((product) => {
      if (this.existingIds.has(String(product.id))) return;

      const card = this.createProductCard(product);
      this.container.appendChild(card);
      this.existingIds.add(String(product.id));

      // Animate the new card
      if (window.gsap) {
        gsap.from(card, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
        });
      }
    });
  }

  createProductCard(product) {
    const card = document.createElement("product-card");
    card.setAttribute("product-id", product.id);
    card.setAttribute("product-name", product.name);
    card.setAttribute("product-price", product.price);
    card.setAttribute("product-description", product.description || "");
    card.setAttribute("product-stock", product.stock);
    card.setAttribute("product-category", product.category || "");
    card.setAttribute("product-url", `/product/${product.id}`);

    if (product.image) {
      card.setAttribute("product-image", product.image);
    }

    if (this.isAuthenticated) {
      card.setAttribute("is-authenticated", "true");
    }

    return card;
  }

  clearProducts() {
    this.container.innerHTML = "";
    this.currentPage = 1;
    this.hasMore = true;
    this.existingIds.clear();
  }

  showLoader() {
    const loader = document.getElementById("products-loader");
    if (loader) {
      loader.style.display = "flex";
    }
  }

  hideLoader() {
    const loader = document.getElementById("products-loader");
    if (loader) {
      loader.style.display = "none";
    }
  }

  showError(message) {
    const event = new CustomEvent("show-notification", {
      bubbles: true,
      composed: true,
      detail: { message },
    });
    document.dispatchEvent(event);
  }

  hideLoadMoreButton() {
    const button = document.getElementById("load-more-btn");
    if (button) {
      button.style.display = "none";
    }
  }
}

// Export pour utilisation dans d'autres modules
export default ProductLoader;
