import './stimulus_bootstrap.js';
import './styles/app.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

console.log('🎨 MouseQuetaire Shop - Powered by GSAP');

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initAnimations();
    initCart();
});

function initAnimations() {
    // Animate hero content on page load
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        gsap.from(heroContent, {
            duration: 1.2,
            scale: 0.8,
            opacity: 0,
            ease: 'back.out(1.7)',
            delay: 0.3
        });
    }

    // Animate keyboard icons
    const keyboardIcons = document.querySelectorAll('.keyboard-icon');
    if (keyboardIcons.length > 0) {
        keyboardIcons.forEach((icon, index) => {
            gsap.to(icon, {
                y: '-=20',
                duration: 3 + (index * 0.2),
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        });
    }

    // Animate product cards on scroll
    const productCards = document.querySelectorAll('.product-card');
    if (productCards.length > 0) {
        gsap.from(productCards, {
            scrollTrigger: {
                trigger: '.products-grid',
                start: 'top 80%',
            },
            y: 50,
            opacity: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: 'power2.out'
        });
    }

    // Animate why items
    const whyItems = document.querySelectorAll('.why-item');
    if (whyItems.length > 0) {
        gsap.from(whyItems, {
            scrollTrigger: {
                trigger: '.why-section',
                start: 'top 70%',
            },
            scale: 0,
            opacity: 0,
            stagger: 0.2,
            duration: 0.8,
            ease: 'back.out(1.7)'
        });

        // Rotate sparkles continuously
        const sparkles = document.querySelectorAll('.sparkle');
        sparkles.forEach(sparkle => {
            gsap.to(sparkle, {
                rotation: 360,
                duration: 10,
                repeat: -1,
                ease: 'none'
            });
        });
    }

    // Animate admin stats
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length > 0) {
        gsap.from(statCards, {
            y: 30,
            opacity: 0,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power2.out'
        });
    }
}

// Cart functionality
function initCart() {
    // Get cart from localStorage or initialize empty
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartDisplay();

    // Add to cart buttons
    document.querySelectorAll('[data-add-to-cart]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = button.dataset.productId;
            const productName = button.dataset.productName;
            const productPrice = parseFloat(button.dataset.productPrice);
            
            addToCart(productId, productName, productPrice);
        });
    });
}

function addToCart(productId, productName, productPrice) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification('Product added to cart!');
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    window.location.reload(); // Refresh cart page
}

function updateQuantity(productId, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update cart icon badge if it exists
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
        cartBadge.textContent = cartCount;
        cartBadge.style.display = cartCount > 0 ? 'flex' : 'none';
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    gsap.fromTo(notification,
        { y: -100, opacity: 0 },
        { y: 20, opacity: 1, duration: 0.3 }
    );
    
    setTimeout(() => {
        gsap.to(notification, {
            y: -100,
            opacity: 0,
            duration: 0.3,
            onComplete: () => notification.remove()
        });
    }, 3000);
}

// Export functions for use in templates
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
