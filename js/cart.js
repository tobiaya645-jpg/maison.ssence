/**
 * MAISON ESSENCE — Cart / Cotización System
 * Uses LocalStorage so the selection persists.
 * Supports quantity for the same product.
 */

const CART_KEY = "maison_essence_cart";

// ============================================
// CONFIGURACIÓN WHATSAPP
// Cambia solo este número cuando lo tengas
// Formato: código de país + número (sin + ni espacios)
// Ejemplo México: 5215512345678
// ============================================
const WHATSAPP_NUMBER = "526251220282"; // ← REEMPLAZA con el número real

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}

function addToCart(productId) {
  const product = getProductById(productId);
  if (!product) return;

  const cart = getCart();
  const exists = cart.find(item => item.id === productId);

  if (exists) {
    exists.qty = (exists.qty || 1) + 1;
    saveCart(cart);
    showToast(`"${product.name}" × ${exists.qty}`);
    return;
  }

  cart.push({
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    volume: product.volume,
    qty: 1
  });

  saveCart(cart);
  showToast(`"${product.name}" agregado a cotización`);
}

function changeQty(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.qty = (item.qty || 1) + delta;

  if (item.qty <= 0) {
    saveCart(cart.filter(i => i.id !== productId));
    return;
  }

  saveCart(cart);
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

/** Total de unidades (para el badge) */
function getCartCount() {
  return getCart().reduce((sum, item) => sum + (item.qty || 1), 0);
}

function getCartTotal() {
  const cart = getCart();
  if (cart.length === 0) return null;

  const hasAllPrices = cart.every(item => item.price !== null && item.price !== undefined);
  if (!hasAllPrices) return null;

  return cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
}

function updateCartUI() {
  const count = getCartCount();
  const badges = document.querySelectorAll(".cart-count");
  badges.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  });

  renderCartItems();
}

function renderCartItems() {
  const container = document.getElementById("cart-items");
  const empty = document.getElementById("cart-empty");
  const footer = document.getElementById("cart-footer");
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = "";
    if (empty) empty.style.display = "block";
    if (footer) footer.style.display = "none";
    return;
  }

  if (empty) empty.style.display = "none";
  if (footer) footer.style.display = "block";

  container.innerHTML = cart.map(item => {
    const qty = item.qty || 1;
    const linePrice = item.price !== null && item.price !== undefined
      ? formatPrice(item.price * qty)
      : formatPrice(item.price);

    return `
    <div class="cart-item">
      <div class="cart-item-img">
        <span style="font-size:1.4rem;opacity:0.3;">◈</span>
      </div>
      <div class="cart-item-info">
        <div class="cart-item-brand">${item.brand}</div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatPrice(item.price)}${item.volume ? " · " + item.volume : ""}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.id}', -1)" aria-label="Menos">−</button>
          <span class="qty-value">${qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}', 1)" aria-label="Más">+</button>
        </div>
      </div>
      <div class="cart-item-right">
        <div class="cart-item-line-total">${linePrice}</div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Quitar">✕</button>
      </div>
    </div>
  `;
  }).join("");

  const totalEl = document.getElementById("cart-total-value");
  if (totalEl) {
    const total = getCartTotal();
    totalEl.textContent = total !== null ? formatPrice(total) : "Por cotizar";
  }
}

function openCart() {
  document.getElementById("cart-overlay")?.classList.add("open");
  document.getElementById("cart-drawer")?.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  document.getElementById("cart-overlay")?.classList.remove("open");
  document.getElementById("cart-drawer")?.classList.remove("open");
  document.body.style.overflow = "";
}

function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

/**
 * Construye el mensaje de cotización para WhatsApp
 */
function buildWhatsAppMessage() {
  const cart = getCart();
  if (cart.length === 0) return "";

  let message = "¡Hola! Me interesa cotizar estos perfumes de *Maison Essence*:\n\n";

  cart.forEach((item, index) => {
    const qty = item.qty || 1;
    const qtyText = qty > 1 ? ` × ${qty}` : "";
    let priceText = "";
    if (item.price !== null && item.price !== undefined) {
      const line = item.price * qty;
      priceText = qty > 1
        ? ` — $${item.price.toLocaleString("es-MX")} c/u = $${line.toLocaleString("es-MX")}`
        : ` — $${item.price.toLocaleString("es-MX")}`;
    }
    message += `${index + 1}. *${item.brand}* — ${item.name}`;
    if (item.volume) message += ` (${item.volume})`;
    message += `${qtyText}${priceText}\n`;
  });

  const total = getCartTotal();
  if (total !== null) {
    message += `\n*Total estimado:* $${total.toLocaleString("es-MX")}`;
  } else {
    message += `\n*Total:* Por cotizar`;
  }

  message += "\n\n¿Me podrías ayudar con la cotización? ¡Gracias!";

  return message;
}

/**
 * Abre WhatsApp con el mensaje de cotización pre-armado
 */
function sendWhatsAppQuote() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast("Agrega al menos un perfume a la cotización");
    return;
  }

  if (WHATSAPP_NUMBER === "5210000000000") {
    showToast("Configura el número de WhatsApp en js/cart.js");
  }

  const message = buildWhatsAppMessage();
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;

  window.open(url, "_blank");
}

// Init on load
document.addEventListener("DOMContentLoaded", updateCartUI);
