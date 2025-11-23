/* Cart Display and Management */

export function displayCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartDisplay = document.getElementById("cart-display");

  if (!cartDisplay) return;

  if (cart.length === 0) {
    cartDisplay.innerHTML = `
            <div class="empty-cart">
                <div class="empty-icon">🛒</div>
                <h2 class="empty-title">Votre panier est vide</h2>
                <p class="empty-text">Ajoutez des produits pour les voir ici !</p>
                <a href="/products" class="continue-shopping">Continuer mes achats</a>
            </div>
        `;
    return;
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  cartDisplay.innerHTML = `
        <div class="cart-content">
            <div class="cart-items">
                ${cart
                  .map(
                    (item) => `
                    <div class="cart-item">
                        <div class="item-image">⌨️</div>
                        <div class="item-details">
                            <div class="item-name">${escapeHtml(
                              item.name
                            )}</div>
                            <div class="item-price">${item.price.toFixed(
                              2
                            )} €</div>
                        </div>
                        <div class="item-quantity">
                            <button class="qty-btn" onclick="changeQuantity('${
                              item.id
                            }', ${item.quantity - 1})">-</button>
                            <input type="number" class="qty-input" value="${
                              item.quantity
                            }" 
                                   onchange="changeQuantity('${
                                     item.id
                                   }', parseInt(this.value))" min="1">
                            <button class="qty-btn" onclick="changeQuantity('${
                              item.id
                            }', ${item.quantity + 1})">+</button>
                        </div>
                        <div class="item-total">${(
                          item.price * item.quantity
                        ).toFixed(2)} €</div>
                        <button class="remove-btn" onclick="window.removeFromCart('${
                          item.id
                        }')">🗑️</button>
                    </div>
                `
                  )
                  .join("")}
            </div>

            <div class="cart-summary">
                <h3 class="summary-title">Résumé</h3>
                <div class="summary-row">
                    <span>Sous-total</span>
                    <span>${subtotal.toFixed(2)} €</span>
                </div>
                <div class="summary-row">
                    <span>Livraison</span>
                    <span>${
                      shipping === 0 ? "Gratuite" : shipping.toFixed(2) + " €"
                    }</span>
                </div>
                <div class="summary-total">
                    <span>Total</span>
                    <span>${total.toFixed(2)} €</span>
                </div>
                <button class="checkout-btn" onclick="checkout()">Passer commande</button>
            </div>
        </div>
    `;
}

export function changeQuantity(productId, newQuantity) {
  if (newQuantity <= 0) {
    if (confirm("Voulez-vous retirer cet article du panier ?")) {
      window.removeFromCart(productId);
    }
  } else {
    window.updateQuantity(productId, newQuantity);
    displayCart();
  }
}

export function checkout() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) return;

  // Here you would normally send the order to your backend
  alert("Fonctionnalité de paiement à implémenter");
  // After successful checkout:
  // localStorage.removeItem('cart');
  // window.location.href = '/account';
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Make functions globally available
if (typeof window !== "undefined") {
  window.changeQuantity = changeQuantity;
  window.checkout = checkout;
}

// Auto-initialize on cart page
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("cart-display")) {
    displayCart();
  }
});
