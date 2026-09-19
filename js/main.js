/**
 * MAISON ESSENCE — Main UI Logic
 */

/** Ruta correcta a producto.html según la página actual */
function productUrl(id) {
  const inPages = /\/pages\//.test(window.location.pathname) ||
    window.location.pathname.endsWith("/pages") ||
    document.body?.dataset?.page === "product" ||
    document.body?.dataset?.category;
  // Si estamos en index (raíz), prefix pages/
  // Si estamos en pages/*, solo producto.html
  const path = window.location.pathname.replace(/\\/g, "/");
  if (path.includes("/pages/") || path.match(/\/(disenador|arabes|dama|producto)\.html/)) {
    return `producto.html?id=${encodeURIComponent(id)}`;
  }
  return `pages/producto.html?id=${encodeURIComponent(id)}`;
}

function categoryPageUrl(category) {
  const map = {
    diseñador: "disenador.html",
    arabes: "arabes.html",
    dama: "dama.html"
  };
  const file = map[category] || "disenador.html";
  const path = window.location.pathname.replace(/\\/g, "/");
  if (path.includes("/pages/") || path.match(/\/(disenador|arabes|dama|producto)\.html/)) {
    return file;
  }
  return `pages/${file}`;
}


/** Ajusta rutas de assets según si estamos en /pages/ o en la raíz */
function resolveAssetPath(src) {
  if (!src) return src;
  if (/^https?:\/\//i.test(src) || src.startsWith("data:")) return src;
  const inPages = /\/pages\//.test(window.location.pathname) ||
    /\/(disenador|arabes|dama|producto)\.html/.test(window.location.pathname);
  if (inPages && src.startsWith("assets/")) return "../" + src;
  if (inPages && src.startsWith("/assets/")) return ".." + src;
  return src;
}

function categoryLabel(category) {
  const map = {
    diseñador: "Diseñador",
    arabes: "Árabes",
    dama: "Dama"
  };
  return map[category] || category;
}

function createProductCard(product) {
  const priceHtml = product.price !== null && product.price !== undefined
    ? `<span class="product-price">${formatPrice(product.price)}</span>`
    : `<span class="product-price pending">Consultar precio</span>`;

  const url = productUrl(product.id);

  return `
    <article class="product-card" data-id="${product.id}">
      <a href="${url}" class="product-card-link">
        <div class="product-image">
          ${product.popular ? '<span class="product-badge">Popular</span>' : ''}
          ${getProductMainImage(product)
            ? `<img src="${resolveAssetPath(getProductMainImage(product))}" alt="${product.name}" loading="lazy">`
            : '<div class="product-image-placeholder">◈</div>'}
        </div>
        <div class="product-info">
          <div class="product-brand">${product.brand}</div>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-notes">${product.notes || ""}</p>
        </div>
      </a>
      <div class="product-footer">
        ${priceHtml}
        <button class="btn-add" onclick="event.preventDefault(); addToCart('${product.id}')" title="Agregar a cotización" aria-label="Agregar a cotización">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    </article>
  `;
}

function renderProducts(products, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!products || products.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--gray);">
        <p>No hay productos en esta categoría todavía.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(createProductCard).join("");
}

function renderPopular() {
  const popular = getPopularProducts(8);
  renderProducts(popular, "popular-products");
}

function renderCategory(category) {
  const products = getProductsByCategory(category);
  renderProducts(products, "category-products");
}

function filterProducts(category, brand = "all") {
  let products = getProductsByCategory(category);
  if (brand && brand !== "all") {
    products = products.filter(p => p.brand === brand);
  }
  renderProducts(products, "category-products");
}

function getUniqueBrands(category) {
  const products = getProductsByCategory(category);
  const brands = [...new Set(products.map(p => p.brand))].sort();
  return brands;
}

function setupBrandFilter(category) {
  const select = document.getElementById("brand-filter");
  if (!select) return;

  const brands = getUniqueBrands(category);
  select.innerHTML = `<option value="all">Todas las marcas</option>` +
    brands.map(b => `<option value="${b}">${b}</option>`).join("");

  select.addEventListener("change", () => {
    filterProducts(category, select.value);
  });
}

/* ---------- Product detail page ---------- */

function getQueryId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function renderProductDetail() {
  const loading = document.getElementById("product-loading");
  const content = document.getElementById("product-content");
  const notFound = document.getElementById("product-not-found");
  if (!content) return;

  const id = getQueryId();
  const product = id ? getProductById(id) : null;

  if (loading) loading.style.display = "none";

  if (!product) {
    if (notFound) notFound.style.display = "block";
    return;
  }

  document.title = `${product.name} — ${product.brand} | Maison Essence`;

  const priceHtml = product.price !== null && product.price !== undefined
    ? `<span class="pd-price">${formatPrice(product.price)}</span>`
    : `<span class="pd-price pending">Consultar precio</span>`;

  const accordsHtml = (product.accords || []).map(a =>
    `<span class="pd-accord">${a}</span>`
  ).join("");

  const metaItems = [];
  if (product.longevity) metaItems.push(`<div class="pd-meta-item"><span class="pd-meta-label">Longevidad</span><span>${product.longevity}</span></div>`);
  if (product.sillage) metaItems.push(`<div class="pd-meta-item"><span class="pd-meta-label">Estela</span><span>${product.sillage}</span></div>`);
  if (product.rating) metaItems.push(`<div class="pd-meta-item"><span class="pd-meta-label">Rating</span><span>${product.rating} ★</span></div>`);
  if (product.volume) metaItems.push(`<div class="pd-meta-item"><span class="pd-meta-label">Presentación</span><span>${product.volume}</span></div>`);

  const catUrl = categoryPageUrl(product.category);
  const catName = categoryLabel(product.category);

  content.innerHTML = `
    <div class="breadcrumb pd-breadcrumb">
      <a href="../index.html">Inicio</a>
      <span>/</span>
      <a href="${catUrl}">${catName}</a>
      <span>/</span>
      <span>${product.name}</span>
    </div>

    <div class="pd-grid">
      <div class="pd-gallery">
        <div class="pd-image" id="pd-main-image">
          ${(() => {
            const imgs = getProductImages(product);
            if (imgs.length) {
              return `<img src="${resolveAssetPath(imgs[0])}" alt="${product.brand} ${product.name}" id="pd-main-img">`;
            }
            return `<div class="pd-image-placeholder"><span>◈</span><p>${product.brand}</p></div>`;
          })()}
          ${product.popular ? '<span class="product-badge">Popular</span>' : ''}
        </div>
        ${(() => {
          const imgs = getProductImages(product);
          if (imgs.length <= 1) return "";
          return `<div class="pd-thumbs">
            ${imgs.map((src, i) => `
              <button type="button" class="pd-thumb ${i === 0 ? "active" : ""}" data-src="${resolveAssetPath(src)}" onclick="setMainProductImage(this)">
                <img src="${resolveAssetPath(src)}" alt="${product.name} ${i + 1}" loading="lazy">
              </button>
            `).join("")}
          </div>`;
        })()}
      </div>

      <div class="pd-info">
        <div class="pd-brand">${product.brand}</div>
        <h1 class="pd-name">${product.name}</h1>
        <div class="pd-price-row">${priceHtml}</div>

        ${product.notes ? `
          <div class="pd-section">
            <h3>Notas</h3>
            <p class="pd-notes">${product.notes}</p>
          </div>
        ` : ""}

        ${accordsHtml ? `
          <div class="pd-section">
            <h3>Acordes principales</h3>
            <div class="pd-accords">${accordsHtml}</div>
          </div>
        ` : ""}

        ${metaItems.length ? `
          <div class="pd-meta">${metaItems.join("")}</div>
        ` : ""}

        <div class="pd-actions">
          <button class="btn btn-primary" onclick="addToCart('${product.id}')">
            Agregar a cotización
          </button>
          <a href="${catUrl}" class="btn btn-dark">Ver más en ${catName}</a>
        </div>
      </div>
    </div>
  `;

  content.style.display = "block";
}

function setMainProductImage(btn) {
  const src = btn.getAttribute("data-src");
  const main = document.getElementById("pd-main-img");
  if (main && src) main.src = src;
  document.querySelectorAll(".pd-thumb").forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
}

/* Mobile menu */
function openMobileNav() {
  document.getElementById("mobile-nav")?.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeMobileNav() {
  document.getElementById("mobile-nav")?.classList.remove("open");
  document.body.style.overflow = "";
}

/* Init helpers based on page */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("popular-products")) {
    renderPopular();
  }

  const categoryEl = document.body.dataset.category;
  if (categoryEl && document.getElementById("category-products")) {
    renderCategory(categoryEl);
    setupBrandFilter(categoryEl);
  }

  if (document.body.dataset.page === "product") {
    renderProductDetail();
  }
});
