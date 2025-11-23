// Product Detail Page Gallery and Quantity Selector

export function initProductDetail() {
  initMobileSlider();
  initQuantitySelector();
  initAddToCart();
}

function initMobileSlider() {
  const slider = document.querySelector(".gallery-slider");
  if (!slider) return;

  const slides = slider.querySelectorAll(".slider-item");
  const prevBtn = slider.querySelector(".slider-prev");
  const nextBtn = slider.querySelector(".slider-next");
  const dots = slider.querySelectorAll(".dot");

  if (slides.length === 0) return;

  let currentIndex = 0;

  function updateSlider() {
    // Hide all slides
    slides.forEach((slide) => {
      slide.style.display = "none";
    });

    // Show current slide
    if (slides[currentIndex]) {
      slides[currentIndex].style.display = "flex";
    }

    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });

    // Update button states
    if (prevBtn) {
      prevBtn.disabled = currentIndex === 0;
      prevBtn.style.opacity = currentIndex === 0 ? "0.3" : "1";
    }
    if (nextBtn) {
      nextBtn.disabled = currentIndex === slides.length - 1;
      nextBtn.style.opacity = currentIndex === slides.length - 1 ? "0.3" : "1";
    }
  }

  function goToSlide(index) {
    if (index < 0) index = 0;
    if (index >= slides.length) index = slides.length - 1;
    currentIndex = index;
    updateSlider();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  // Event listeners for buttons
  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      prevSlide();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      nextSlide();
    });
  }

  // Event listeners for dots
  dots.forEach((dot, index) => {
    dot.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      goToSlide(index);
    });
  });

  // Touch gestures for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  slider.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    },
    { passive: true }
  );

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next slide
        nextSlide();
      } else {
        // Swipe right - previous slide
        prevSlide();
      }
    }
  }

  // Initialize slider
  updateSlider();
}

function initQuantitySelector() {
  const qtyInput = document.getElementById("qty-input");
  const qtyMinus = document.getElementById("qty-minus");
  const qtyPlus = document.getElementById("qty-plus");

  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener("click", () => {
      const current = parseInt(qtyInput.value);
      if (current > 1) qtyInput.value = current - 1;
    });

    qtyPlus.addEventListener("click", () => {
      const current = parseInt(qtyInput.value);
      const max = parseInt(qtyInput.max);
      if (current < max) qtyInput.value = current + 1;
    });
  }
}

function initAddToCart() {
  const addToCartBtn = document.getElementById("add-to-cart-btn");
  const qtyInput = document.getElementById("qty-input");

  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      const quantity = parseInt(qtyInput?.value || 1);
      const productId = addToCartBtn.dataset.productId;
      const productName = addToCartBtn.dataset.productName;
      const productPrice = parseFloat(addToCartBtn.dataset.productPrice);

      // Add to cart with quantity
      for (let i = 0; i < quantity; i++) {
        window.addToCart(productId, productName, productPrice);
      }

      // Reset quantity
      if (qtyInput) qtyInput.value = 1;
    });
  }
}
