# Maison Essence — Sitio Web

Sitio catálogo + cotizador para Maison Essence.

## Estructura

```
maison-essence/
├── index.html              ← Página de inicio
├── css/styles.css          ← Estilos (negro + blanco + oro)
├── js/
│   ├── products.js         ← BASE DE DATOS DE PRODUCTOS (editar aquí)
│   ├── cart.js             ← Sistema de cotización
│   └── main.js             ← Lógica de interfaz
├── pages/
│   ├── disenador.html      ← Catálogo Diseñador
│   ├── arabes.html         ← Catálogo Árabes (pendiente productos)
│   └── dama.html           ← Catálogo Dama (pendiente productos)
└── assets/images/          ← Imágenes de productos (futuro)
```

## Cómo agregar / editar productos

Abre `js/products.js` y agrega un objeto como este:

```js
{
  id: "marca-nombre-unico",
  name: "Nombre del perfume",
  brand: "Marca",
  category: "diseñador",   // "diseñador" | "arabes" | "dama"
  gender: "hombre",        // "hombre" | "mujer" | "unisex"
  price: 1290,             // número o null (muestra "Consultar")
  volume: "100ml",
  notes: "Nota1, Nota2, Nota3",
  accords: ["Aromático", "Amaderado"],
  longevity: "7h",
  sillage: "Fuerte",
  rating: 4.2,
  popular: true,           // true = aparece en inicio
  image: null              // ruta a imagen cuando las tengas
}
```

## Cómo probarlo

1. Abre `index.html` en el navegador (doble clic o Live Server en VS Code)
2. Navega, agrega perfumes a cotización
3. El carrito se guarda aunque cierres la página


## WhatsApp — Cotización

1. Abre `js/cart.js`
2. Busca la línea: `const WHATSAPP_NUMBER = "5210000000000";`
3. Reemplaza por el número real (código país + número, sin + ni espacios)
   - Ejemplo México: `5215512345678`

El botón arma automáticamente un mensaje con todos los perfumes de la cotización.

## Pendiente

- [ ] Precios reales
- [x] Botón de cotización por WhatsApp (falta solo poner el número real)
- [ ] Número de WhatsApp real (cambiar en `js/cart.js`)
- [ ] Productos de Árabes y Dama
- [ ] Imágenes de los perfumes
- [ ] Página individual de producto (detalle completo)

## Colores

- Negro: `#0A0A0A`
- Blanco: `#F8F6F2`
- Oro: `#C9A962`
