import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

console.log("🎨 MouseQuetaire Shop - Powered by GSAP");

// Initialize animations when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initAnimations();
  initCart();
  initScrollTriggers();
});

// Listen for notification events from web components
document.addEventListener("show-notification", (e) => {
  showNotification(e.detail.message);
});

// Listen for cart update events
document.addEventListener("cart-updated", () => {
  updateCartDisplay();
});

// Infinite diagonal scrolling grid for hero section
function initInfiniteGrid() {
  const gridContainer = document.getElementById("hero-grid");
  if (!gridContainer) return;

  // Image paths using Symfony asset() function - will be set from template
  const images = [
    gridContainer.dataset.grosseImage || "/images/grosse_touche.png",
    gridContainer.dataset.petiteImage || "/images/petite_touche.png",
  ];

  // Calculate how many items we need to fill the grid plus duplicates for seamless loop
  // 3x larger (width) and 2x taller (height)
  const itemsPerRow = 24;
  const itemsPerCol = 16;
  const totalItems = itemsPerRow * itemsPerCol;

  // Populate grid with alternating images
  for (let i = 0; i < totalItems; i++) {
    const gridItem = document.createElement("div");
    gridItem.className = "grid-item";

    // Alternate between grosse and petite touches
    const imageIndex = i % 2 === 0 ? 0 : 1;

    const img = document.createElement("img");
    img.src = images[imageIndex];
    img.alt = imageIndex === 0 ? "Grosse touche" : "Petite touche";
    img.loading = "lazy";

    gridItem.appendChild(img);
    gridContainer.appendChild(gridItem);
  }

  // Simple infinite animation using GSAP timeline
  // Move by 2 cells diagonally (380px * 3 = 1140px for width pattern)
  const tl = gsap.timeline({ repeat: -1 });

  tl.to(gridContainer, {
    x: "+=1140",
    y: "+=760",
    duration: 30,
    ease: "none",
  }).to(gridContainer, {
    x: "-=1140",
    y: "-=760",
    duration: 0,
  });
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

  // Animate footer on scroll
  const footer = document.querySelector(".footer");
  if (footer) {
    gsap.from(footer, {
      scrollTrigger: {
        trigger: footer,
        start: "top 90%",
        toggleActions: "play none none reverse",
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
    });
  }
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
