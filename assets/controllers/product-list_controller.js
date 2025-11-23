/* Product List Page Functionality */

// Product Loader functionality
export class ProductLoader {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    this.currentPage = 1;
    this.isLoading = false;
    this.hasMore = true;
    this.isAuthenticated = document.querySelector(".cart-badge") !== null;
    this.viewMode = localStorage.getItem("productViewMode") || "grid";
    this.allProducts = [];
    this.existingIds = new Set();
    this.applyViewMode();
    this.cacheInitialProducts();
  }

  cacheInitialProducts() {
    const cards = this.container.querySelectorAll("product-card");
    cards.forEach((card) => {
      this.allProducts.push({
        id: card.getAttribute("product-id"),
        name: card.getAttribute("product-name"),
        price: parseFloat(card.getAttribute("product-price")),
        stock: parseInt(card.getAttribute("product-stock")),
        element: card,
      });
      this.existingIds.add(card.getAttribute("product-id"));
    });
  }

  applyViewMode() {
    if (this.viewMode === "full") {
      this.container.classList.add("full-view");
    } else {
      this.container.classList.remove("full-view");
    }

    const cards = this.container.querySelectorAll("product-card");
    cards.forEach((card) => {
      card.setAttribute("view-mode", this.viewMode);
    });
  }

  setViewMode(mode) {
    this.viewMode = mode;
    localStorage.setItem("productViewMode", mode);
    this.applyViewMode();

    setTimeout(() => {
      const cards = this.container.querySelectorAll("product-card");
      cards.forEach((card) => {
        const currentMode = card.getAttribute("view-mode");
        card.removeAttribute("view-mode");
        requestAnimationFrame(() => {
          card.setAttribute("view-mode", mode);
        });
      });
    }, 50);
  }

  sortProducts(sortBy) {
    const cards = Array.from(this.container.querySelectorAll("product-card"));

    cards.sort((a, b) => {
      const aPrice = parseFloat(a.getAttribute("product-price"));
      const bPrice = parseFloat(b.getAttribute("product-price"));
      const aName = a.getAttribute("product-name");
      const bName = b.getAttribute("product-name");
      const aId = parseInt(a.getAttribute("product-id"));
      const bId = parseInt(b.getAttribute("product-id"));

      switch (sortBy) {
        case "price-asc":
          return aPrice - bPrice;
        case "price-desc":
          return bPrice - aPrice;
        case "name":
          return aName.localeCompare(bName);
        case "newest":
        default:
          return bId - aId;
      }
    });

    this.container.innerHTML = "";
    cards.forEach((card) => this.container.appendChild(card));
  }

  async loadMore() {
    if (this.isLoading || !this.hasMore) return;

    this.isLoading = true;
    this.showSmallLoader();

    try {
      this.currentPage++;
      const response = await fetch(
        `/api/products?page=${this.currentPage}&limit=12`
      );
      const data = await response.json();

      if (!data.products || data.products.length === 0) {
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
    } finally {
      this.isLoading = false;
      this.hideSmallLoader();
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
      const data = await response.json();

      this.clearProducts();

      if (data.products && data.products.length > 0) {
        this.appendProducts(data.products);
        // Hide load-more for filtered results (filter returns all matching items)
        this.hideLoadMoreButton();
      } else {
        this.container.innerHTML =
          '<div style="text-align: center; padding: 40px; font-family: Inter, sans-serif; color: #666;">Aucun produit trouvé</div>';
        this.hideLoadMoreButton();
      }
    } catch (error) {
      console.error("Error filtering products:", error);
    } finally {
      this.isLoading = false;
      this.hideLoader();
    }
  }

  appendProducts(products) {
    products.forEach((product) => {
      // Prevent duplicate products already on the page
      if (this.existingIds.has(String(product.id))) return;

      const card = this.createProductCard(product);
      this.container.appendChild(card);
      this.existingIds.add(String(product.id));
      this.allProducts.push({ id: String(product.id), element: card });

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
    card.setAttribute("view-mode", this.viewMode);

    if (product.images && product.images.length > 0) {
      card.setAttribute("product-images", JSON.stringify(product.images));
      card.setAttribute("product-image", product.images[0]);
    } else if (product.image) {
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
      // Add loading class to container for additional styling
      this.container.classList.add("loading");
    }
  }

  hideLoader() {
    const loader = document.getElementById("products-loader");
    if (loader) {
      loader.style.display = "none";
      this.container.classList.remove("loading");
    }
  }

  showSmallLoader() {
    const button = document.getElementById("load-more-btn");
    if (button) {
      button.disabled = true;
      button.innerHTML = '<div class="button-spinner"></div> Chargement...';
    }
  }

  hideSmallLoader() {
    const button = document.getElementById("load-more-btn");
    if (button) {
      button.disabled = false;
      button.innerHTML = 'Charger plus de produits';
    }
  }

  hideLoadMoreButton() {
    const section = document.querySelector(".load-more-section");
    if (section) {
      section.style.display = "none";
    }
  }

  showLoadMoreButton() {
    const section = document.querySelector(".load-more-section");
    if (section) {
      section.style.display = "block";
    }
  }
}

// Load categories helper
async function loadCategories() {
  try {
    const response = await fetch("/api/categories");
    const data = await response.json();

    const categories = data.member || data["hydra:member"] || data;

    const categorySelect = document.getElementById("filter-category");
    if (categorySelect && Array.isArray(categories)) {
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

// Initialize product list page
export function initProductListPage() {
  const container = document.getElementById("products-grid");
  if (!container) return;

  const loader = new ProductLoader("#products-grid");

  // Load categories
  loadCategories();

  // View Mode Toggle
  const gridViewBtn = document.getElementById("grid-view-btn");
  const fullViewBtn = document.getElementById("full-view-btn");

  if (loader.viewMode === "full") {
    gridViewBtn?.classList.remove("active");
    fullViewBtn?.classList.add("active");
  }

  gridViewBtn?.addEventListener("click", () => {
    loader.setViewMode("grid");
    gridViewBtn.classList.add("active");
    fullViewBtn.classList.remove("active");
  });

  fullViewBtn?.addEventListener("click", () => {
    loader.setViewMode("full");
    fullViewBtn.classList.add("active");
    gridViewBtn.classList.remove("active");
  });

  // Sorting
  document.getElementById("sort-select")?.addEventListener("change", (e) => {
    loader.sortProducts(e.target.value);
  });

  // Load More button
  document.getElementById("load-more-btn")?.addEventListener("click", () => {
    loader.loadMore();
  });

  // Apply Filters
  document.getElementById("apply-filters")?.addEventListener("click", () => {
    const filters = {
      category: document.getElementById("filter-category").value,
      inStock: document.getElementById("filter-in-stock").checked,
    };
    loader.filterProducts(filters);
  });

  // Clear Filters
  document.getElementById("clear-filters")?.addEventListener("click", () => {
    document.getElementById("filter-category").value = "";
    document.getElementById("filter-in-stock").checked = false;
    document.getElementById("sort-select").value = "newest";
    location.reload();
  });
}

// Auto-initialize on products page
document.addEventListener("DOMContentLoaded", () => {
  initProductListPage();
});
