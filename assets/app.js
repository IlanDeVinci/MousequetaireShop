import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

console.log("🎨 MouseQuetaire Shop - Powered by GSAP");

// Initialize animations when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initAnimations();
  initCart();
  initScrollTriggers();
  // Dispatch flash notifications from server-side rendered data
  try {
    const flashesEl = document.getElementById("flashes-data");
    if (flashesEl) {
      const data = JSON.parse(flashesEl.textContent || "{}");
      (data.success || []).forEach((m) =>
        document.dispatchEvent(
          new CustomEvent("show-notification", { detail: { message: m } })
        )
      );
      (data.error || []).forEach((m) =>
        document.dispatchEvent(
          new CustomEvent("show-notification", { detail: { message: m } })
        )
      );
    }
  } catch (e) {
    console.error("Failed to parse flash messages", e);
  }
});

// Import admin-specific form behaviors (drag/drop, delete image, banner preview)
import "./js/admin-forms.js";
import "./js/admin-tables.js";
import { initProductDetail } from "./js/product-detail.js";

// Initialize product detail page if on product page
if (document.querySelector(".product-detail-page")) {
  document.addEventListener("DOMContentLoaded", initProductDetail);
}

// Listen for notification events from web components
document.addEventListener("show-notification", (e) => {
  showNotification(e.detail.message);
});

// Listen for cart update events
document.addEventListener("cart-updated", () => {
  updateCartDisplay();
});
// Infinite diagonal scrolling keyboard animation
function initInfiniteGrid() {
  const gridContainer = document.getElementById("hero-grid");
  if (!gridContainer) return;

  // Image paths from data attributes
  const images = {
    grosse: gridContainer.dataset.grosseImage || "/images/grosse_touche.png",
    petite: gridContainer.dataset.petiteImage || "/images/petite_touche.png",
  };

  // Configuration
  const KEY_SIZES = {
    small: { width: 180, height: 180 },
    spacebar: { width: 360, height: 180 },
  };

  const LINE_SPACING = 500;
  const KEY_SPACING = 250;
  const MIN_KEYS_PER_LINE = 10;
  const Y_OFFSET_BELOW = 500;
  const Y_OFFSET_ABOVE = 1000;
  const ANIMATION_SPEED = 1.5;
  const BUFFER_ZONE = 2000;
  const OFFSCREEN_BUFFER = 2000;

  const lines = [];
  const keys = [];
  let nextLineId = 0;
  let animationFrame;

  // Create DOM element for a key
  function createKeyElement(key) {
    const div = document.createElement("div");
    div.className = "grid-item";
    div.style.position = "absolute";
    div.style.width = key.width + "px";
    div.style.height = key.height + "px";
    div.style.willChange = "transform";
    div.style.pointerEvents = "none";

    const img = document.createElement("img");
    img.src = key.img;
    img.alt = key.type === "spacebar" ? "Grosse touche" : "Petite touche";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "contain";
    img.style.opacity = "0.4";
    img.style.display = "block";

    div.appendChild(img);
    gridContainer.appendChild(div);
    key.element = div;
  }

  // Create a new diagonal line with keys
  function createKey(line, offset) {
    const rand = Math.random();
    const isSmall = rand < 0.5;
    const size = isSmall ? KEY_SIZES.small : KEY_SIZES.spacebar;
    const x = line.x0 + offset;
    const y = line.baseY - offset;

    const key = {
      lineId: line.id,
      type: isSmall ? "small" : "spacebar",
      x,
      y,
      width: size.width,
      height: size.height,
      img: isSmall ? images.petite : images.grosse,
      element: null,
    };

    createKeyElement(key);
    keys.push(key);
    line.keyCount += 1;
  }

  function createLine(x0) {
    const baseY = gridContainer.offsetHeight + Y_OFFSET_BELOW;
    const line = { id: nextLineId++, x0, baseY, keyCount: 0 };
    lines.push(line);

    let offset = 0;
    const targetY = baseY - Y_OFFSET_ABOVE;
    while (line.baseY - offset > targetY || line.keyCount < MIN_KEYS_PER_LINE) {
      createKey(line, offset);
      offset += KEY_SPACING;
    }
  }

  // Initialize the grid with lines
  function initialize() {
    // Clear any existing keys
    lines.forEach((line) => {
      const remaining = keys.filter((key) => key.lineId === line.id);
      remaining.forEach((key) => {
        if (key.element && key.element.parentNode) {
          gridContainer.removeChild(key.element);
        }
      });
    });
    lines.length = 0;
    keys.length = 0;

    // Calculate how many lines we need to cover the screen plus buffer
    const numLines =
      Math.ceil((window.innerWidth + BUFFER_ZONE * 2) / LINE_SPACING) + 1;
    let startX = -BUFFER_ZONE;
    for (let i = 0; i < numLines; i++) {
      createLine(startX);
      startX += LINE_SPACING;
    }

    console.log(
      "Initialized with " + keys.length + " keys across " + numLines + " lines"
    );
  }

  // Update positions of all keys
  function updateKeys() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    lines.forEach((line) => {
      line.x0 += ANIMATION_SPEED;
    });

    for (let i = keys.length - 1; i >= 0; i--) {
      const key = keys[i];
      key.x += ANIMATION_SPEED;
      key.y += ANIMATION_SPEED;
      key.element.style.transform =
        "translate(" + key.x + "px, " + key.y + "px)";

      const offScreenX = key.x - key.width > screenWidth + OFFSCREEN_BUFFER;
      const offScreenY = key.y - key.height > screenHeight + OFFSCREEN_BUFFER;
      if (offScreenX && offScreenY) {
        if (key.element && key.element.parentNode) {
          gridContainer.removeChild(key.element);
        }
        keys.splice(i, 1);
        const parentLine = lines.find((line) => line.id === key.lineId);
        if (parentLine) {
          parentLine.keyCount -= 1;
          if (parentLine.keyCount <= 0) {
            const index = lines.indexOf(parentLine);
            if (index !== -1) {
              lines.splice(index, 1);
            }
          }
        }
      }
    }

    if (lines.length === 0) {
      createLine(-BUFFER_ZONE);
      return;
    }

    let leftmostX0 = Math.min(...lines.map((line) => line.x0));
    while (leftmostX0 > -BUFFER_ZONE - LINE_SPACING) {
      const newX0 = leftmostX0 - LINE_SPACING;
      createLine(newX0);
      leftmostX0 = newX0;
    }
  }

  // Animation loop
  function animate() {
    updateKeys();
    animationFrame = requestAnimationFrame(animate);
  }

  // Handle window resize
  function handleResize() {
    initialize();
  }

  window.addEventListener("resize", handleResize);

  // Cleanup
  window.addEventListener("beforeunload", () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });

  // Start animation
  initialize();
  animate();
}

function initAnimations() {
  // Animate hero content on page load
  const heroContent = document.querySelector(".hero-content");
  if (heroContent) {
    gsap.from(heroContent, {
      duration: 1.2,
      scale: 0.8,
      opacity: 0,
      ease: "back.out(1.7)",
      delay: 0.3,
    });
  }

  // Initialize infinite diagonal scrolling grid
  initInfiniteGrid();

  // Rotate sparkles continuously
  const sparkles = document.querySelectorAll(".sparkle");
  sparkles.forEach((sparkle) => {
    gsap.to(sparkle, {
      rotation: 360,
      duration: 10,
      repeat: -1,
      ease: "none",
    });
  });

  // Animate admin stats
  const statCards = document.querySelectorAll(".stat-card");
  if (statCards.length > 0) {
    gsap.from(statCards, {
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out",
      clearProps: "all",
    });
  }
}

function initScrollTriggers() {
  // Animate product grid container on scroll (instead of individual cards)
  const productsGrid = document.querySelector("#products-grid, .products-grid");
  if (productsGrid) {
    gsap.from(productsGrid, {
      scrollTrigger: {
        trigger: productsGrid,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
      y: 60,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
    });
  }

  // Animate why items with ScrollTrigger
  const whyItems = document.querySelectorAll(".why-item");
  if (whyItems.length > 0) {
    whyItems.forEach((item, index) => {
      gsap.from(item, {
        scrollTrigger: {
          trigger: ".why-section",
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
        scale: 0,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.2,
        ease: "back.out(1.7)",
      });
    });
  }

  // Animate products section title
  const productsTitle = document.querySelector(".products-title");
  if (productsTitle) {
    gsap.from(productsTitle, {
      scrollTrigger: {
        trigger: productsTitle,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
    });
  }

  // Animate page title
  const pageTitle = document.querySelector(".page-title");
  if (pageTitle) {
    gsap.from(pageTitle, {
      scrollTrigger: {
        trigger: pageTitle,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
    });
  }

  // Footer is always visible - no animation needed
}

// Cart functionality
function initCart() {
  // Get cart from localStorage or initialize empty
  updateCartDisplay();

  // Add to cart buttons (for non-web-component buttons)
  document.querySelectorAll("[data-add-to-cart]").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const productId = button.dataset.productId;
      const productName = button.dataset.productName;
      const productPrice = parseFloat(button.dataset.productPrice);

      addToCart(productId, productName, productPrice);
    });
  });
}

function addToCart(productId, productName, productPrice) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Check if product already in cart
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      name: productName,
      price: productPrice,
      quantity: 1,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartDisplay();
  showNotification("Product added to cart!");
}

function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter((item) => item.id !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartDisplay();
  window.location.reload(); // Refresh cart page
}

function updateQuantity(productId, newQuantity) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const item = cart.find((item) => item.id === productId);

  if (item) {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = newQuantity;
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartDisplay();
    }
  }
}

function updateCartDisplay() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Update cart icon badge if it exists
  const cartBadge = document.querySelector(".cart-badge");
  if (cartBadge) {
    cartBadge.textContent = cartCount;
    cartBadge.style.display = cartCount > 0 ? "flex" : "none";
  }
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  gsap.fromTo(
    notification,
    { y: -100, opacity: 0 },
    { y: 20, opacity: 1, duration: 0.3 }
  );

  setTimeout(() => {
    gsap.to(notification, {
      y: -100,
      opacity: 0,
      duration: 0.3,
      onComplete: () => notification.remove(),
    });
  }, 3000);
}

// Export functions for use in templates
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;

// Hide page loader when the page has fully loaded (moved from base template)
window.addEventListener("load", function () {
  const loader = document.getElementById("page-loader");
  if (!loader) return;
  loader.classList.add("loaded");
  setTimeout(() => {
    try {
      loader.remove();
    } catch (e) {}
  }, 300);
});
