// Search Modal Component
class SearchModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.debounceTimer = null;
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: none;
          justify-content: center;
          align-items: flex-start;
          padding-top: 100px;
          z-index: 10000;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .modal-overlay.visible {
          display: flex;
          opacity: 1;
        }

        .modal-content {
          background: white;
          border: 5px solid #0e112b;
          border-radius: 22px;
          width: 90%;
          max-width: 700px;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transform: translateY(-20px);
          transition: transform 0.3s;
        }

        .modal-overlay.visible .modal-content {
          transform: translateY(0);
        }

        .modal-header {
          padding: 25px 30px;
          border-bottom: 3px solid #0e112b;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .close-btn {
          background: #0e112b;
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 24px;
          transition: all 0.3s;
          flex-shrink: 0;
        }

        .close-btn:hover {
          background: #181e4b;
          transform: rotate(90deg);
        }

        .search-input-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          background: #f5f5f5;
          border: 2px solid #0e112b;
          border-radius: 50px;
          padding: 0 20px;
          height: 50px;
        }

        .search-input-wrapper:focus-within {
          border-color: #181e4b;
          background: white;
        }

        .search-icon {
          width: 24px;
          height: 24px;
          color: #0e112b;
          margin-right: 12px;
          flex-shrink: 0;
        }

        .search-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 0;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          color: #0e112b;
          background: transparent;
        }

        .search-input::placeholder {
          color: #999;
        }

        .clear-search-btn {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 5px;
          display: none;
          transition: color 0.3s;
          font-size: 20px;
          flex-shrink: 0;
        }

        .clear-search-btn:hover {
          color: #0e112b;
        }

        .clear-search-btn.visible {
          display: block;
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .search-results {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .search-result-item {
          padding: 15px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 15px;
          text-decoration: none;
          color: inherit;
        }

        .search-result-item:hover {
          border-color: #0e112b;
          transform: translateX(5px);
          background: #f9f9f9;
        }

        .result-image {
          width: 70px;
          height: 70px;
          background: #ddf4ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 35px;
          flex-shrink: 0;
        }

        .result-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 10px;
        }

        .result-info {
          flex: 1;
        }

        .result-name {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: #0e112b;
          margin-bottom: 5px;
        }

        .result-category {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #666;
        }

        .result-price {
          font-family: 'Oxanium', sans-serif;
          font-weight: 700;
          font-size: 22px;
          color: #0e112b;
          flex-shrink: 0;
        }

        .no-results {
          padding: 60px 20px;
          text-align: center;
          font-family: 'Inter', sans-serif;
          color: #666;
        }

        .no-results-icon {
          font-size: 60px;
          margin-bottom: 15px;
        }

        .no-results-text {
          font-size: 18px;
          font-weight: 600;
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
          font-family: 'Inter', sans-serif;
          color: #666;
        }

        .empty-state-icon {
          font-size: 60px;
          margin-bottom: 15px;
        }

        .empty-state-text {
          font-size: 16px;
        }

        .loading {
          padding: 40px 20px;
          text-align: center;
          font-family: 'Inter', sans-serif;
          color: #666;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .spinner {
          display: inline-block;
          width: 30px;
          height: 30px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #0e112b;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }
      </style>

      <div class="modal-overlay" id="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <button class="close-btn" id="close-btn">×</button>
            <div class="search-input-wrapper">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8" stroke-width="2"/>
                <path d="M21 21l-4.35-4.35" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <input 
                type="text" 
                class="search-input" 
                placeholder="Rechercher un produit..."
                id="search-input"
                autofocus
              />
              <button class="clear-search-btn" id="clear-search-btn">✕</button>
            </div>
          </div>
          <div class="modal-body">
            <div class="search-results" id="search-results">
              <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-text">Commencez à taper pour rechercher des produits...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const overlay = this.shadowRoot.getElementById("modal-overlay");
    const closeBtn = this.shadowRoot.getElementById("close-btn");
    const input = this.shadowRoot.getElementById("search-input");
    const clearBtn = this.shadowRoot.getElementById("clear-search-btn");
    const resultsContainer = this.shadowRoot.getElementById("search-results");

    // Close modal
    closeBtn.addEventListener("click", () => this.close());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        this.close();
      }
    });

    // Escape key to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("visible")) {
        this.close();
      }
    });

    // Search input
    input.addEventListener("input", (e) => {
      const query = e.target.value.trim();
      clearBtn.classList.toggle("visible", query.length > 0);

      if (query.length === 0) {
        resultsContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <div class="empty-state-text">Commencez à taper pour rechercher des produits...</div>
          </div>
        `;
        return;
      }

      // Debounce search
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.performSearch(query);
      }, 300);
    });

    // Clear button
    clearBtn.addEventListener("click", () => {
      input.value = "";
      clearBtn.classList.remove("visible");
      resultsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">Commencez à taper pour rechercher des produits...</div>
        </div>
      `;
      input.focus();
    });
  }

  open() {
    const overlay = this.shadowRoot.getElementById("modal-overlay");
    const input = this.shadowRoot.getElementById("search-input");
    overlay.classList.add("visible");
    setTimeout(() => input.focus(), 100);
    document.body.style.overflow = "hidden";
  }

  close() {
    const overlay = this.shadowRoot.getElementById("modal-overlay");
    const input = this.shadowRoot.getElementById("search-input");
    const clearBtn = this.shadowRoot.getElementById("clear-search-btn");
    const resultsContainer = this.shadowRoot.getElementById("search-results");

    overlay.classList.remove("visible");
    input.value = "";
    clearBtn.classList.remove("visible");
    resultsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-text">Commencez à taper pour rechercher des produits...</div>
      </div>
    `;
    document.body.style.overflow = "";
  }

  async performSearch(query) {
    const resultsContainer = this.shadowRoot.getElementById("search-results");
    resultsContainer.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <div>Recherche en cours...</div>
      </div>
    `;

    try {
      console.log("Searching for:", query);
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Search results:", data);

      // Ensure data is an array
      const products = Array.isArray(data) ? data : [];

      if (products.length === 0) {
        resultsContainer.innerHTML = `
          <div class="no-results">
            <div class="no-results-icon">😕</div>
            <div class="no-results-text">Aucun produit trouvé pour "${query}"</div>
          </div>
        `;
        return;
      }

      resultsContainer.innerHTML = products
        .map(
          (product) => `
        <a href="/product/${product.id}" class="search-result-item">
          <div class="result-image">
            ${
              product.image
                ? `<img src="${product.image}" alt="${this.escapeHtml(
                    product.name
                  )}" />`
                : "⌨️"
            }
          </div>
          <div class="result-info">
            <div class="result-name">${this.highlightMatch(
              this.escapeHtml(product.name),
              query
            )}</div>
            <div class="result-category">${
              this.escapeHtml(product.category) || "Sans catégorie"
            }</div>
          </div>
          <div class="result-price">${parseFloat(product.price).toFixed(
            2
          )} €</div>
        </a>
      `
        )
        .join("");
    } catch (error) {
      console.error("Search error:", error);
      resultsContainer.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">❌</div>
          <div class="no-results-text">Erreur lors de la recherche</div>
        </div>
      `;
    }
  }

  highlightMatch(text, query) {
    const regex = new RegExp(`(${this.escapeRegex(query)})`, "gi");
    return text.replace(regex, "<strong>$1</strong>");
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}

customElements.define("search-modal", SearchModal);
export default SearchModal;
