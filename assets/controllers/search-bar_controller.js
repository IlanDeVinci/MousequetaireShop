// Dynamic Search Bar Component
class SearchBar extends HTMLElement {
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
          width: 100%;
        }

        .search-container {
          position: relative;
          width: 100%;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background: white;
          border: 2px solid #0e112b;
          border-radius: 50px;
          padding: 0 15px;
          transition: all 0.3s;
          height: 40px;
        }

        .search-input-wrapper:focus-within {
          border-color: #181e4b;
          box-shadow: 0 4px 12px rgba(14, 17, 43, 0.15);
        }

        .search-icon {
          width: 20px;
          height: 20px;
          color: #0e112b;
          margin-right: 10px;
          flex-shrink: 0;
        }

        .search-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 8px 0;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #0e112b;
          background: transparent;
        }

        .search-input::placeholder {
          color: #666;
        }

        .clear-btn {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 5px;
          display: none;
          transition: color 0.3s;
          font-size: 16px;
          flex-shrink: 0;
        }

        .clear-btn:hover {
          color: #0e112b;
        }

        .clear-btn.visible {
          display: block;
        }

        .search-results {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          right: 0;
          background: white;
          border: 3px solid #0e112b;
          border-radius: 15px;
          max-height: 400px;
          overflow-y: auto;
          display: none;
          z-index: 1000;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .search-results.visible {
          display: block;
        }

        .search-result-item {
          padding: 15px 20px;
          border-bottom: 1px solid #e0e0e0;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          gap: 15px;
          text-decoration: none;
          color: inherit;
        }

        .search-result-item:last-child {
          border-bottom: none;
        }

        .search-result-item:hover {
          background: #f5f5f5;
        }

        .result-image {
          width: 60px;
          height: 60px;
          background: #ddf4ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          flex-shrink: 0;
        }

        .result-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }

        .result-info {
          flex: 1;
        }

        .result-name {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: #0e112b;
          margin-bottom: 4px;
        }

        .result-category {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #666;
        }

        .result-price {
          font-family: 'Oxanium', sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: #0e112b;
        }

        .no-results {
          padding: 30px 20px;
          text-align: center;
          font-family: 'Inter', sans-serif;
          color: #666;
        }

        .loading {
          padding: 20px;
          text-align: center;
          font-family: 'Inter', sans-serif;
          color: #666;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #0e112b;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      </style>

      <div class="search-container">
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
          />
          <button class="clear-btn" id="clear-btn">✕</button>
        </div>
        <div class="search-results" id="search-results"></div>
      </div>
    `;
  }

  attachEventListeners() {
    const input = this.shadowRoot.getElementById("search-input");
    const clearBtn = this.shadowRoot.getElementById("clear-btn");
    const resultsContainer = this.shadowRoot.getElementById("search-results");

    input.addEventListener("input", (e) => {
      const query = e.target.value.trim();
      clearBtn.classList.toggle("visible", query.length > 0);

      if (query.length === 0) {
        resultsContainer.classList.remove("visible");
        return;
      }

      // Debounce search
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.performSearch(query);
      }, 300);
    });

    clearBtn.addEventListener("click", () => {
      input.value = "";
      clearBtn.classList.remove("visible");
      resultsContainer.classList.remove("visible");
      input.focus();
    });

    // Close results when clicking outside
    document.addEventListener("click", (e) => {
      if (!this.contains(e.target)) {
        resultsContainer.classList.remove("visible");
      }
    });
  }

  async performSearch(query) {
    const resultsContainer = this.shadowRoot.getElementById("search-results");
    resultsContainer.innerHTML =
      '<div class="loading"><div class="spinner"></div></div>';
    resultsContainer.classList.add("visible");

    try {
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      // Ensure data is an array
      const products = Array.isArray(data) ? data : [];

      if (products.length === 0) {
        resultsContainer.innerHTML =
          '<div class="no-results">Aucun produit trouvé</div>';
        return;
      }

      resultsContainer.innerHTML = products
        .map(
          (product) => `
        <a href="/product/${product.id}" class="search-result-item">
          <div class="result-image">
            ${
              product.image
                ? `<img src="${product.image}" alt="${product.name}" />`
                : "⌨️"
            }
          </div>
          <div class="result-info">
            <div class="result-name">${this.highlightMatch(
              product.name,
              query
            )}</div>
            <div class="result-category">${
              product.category || "Sans catégorie"
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
      resultsContainer.innerHTML =
        '<div class="no-results">Erreur lors de la recherche</div>';
    }
  }

  highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, "<strong>$1</strong>");
  }
}

customElements.define("search-bar", SearchBar);
export default SearchBar;
