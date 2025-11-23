// Web Components Loader - Charge automatiquement les web components
import ProductCard from "./controllers/product-card_controller.js";
import SearchBar from "./controllers/search-bar_controller.js";
import SearchModal from "./controllers/search-modal_controller.js";

// Additional controller modules
import "./controllers/search-modal-init_controller.js";
import "./controllers/cart-display_controller.js";
import "./controllers/product-list_controller.js";

// Les composants sont auto-enregistrés dans leurs fichiers respectifs
console.log("✨ Web Components and controllers loaded");
