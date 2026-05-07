/* =====================
   VANGUARD LABS — script.js
===================== */

const BACKEND = "https://vanguard-backend-yl1g.onrender.com";

let cart = [];

/* ---- CURSOR ---- */
const dot  = document.getElementById("cursor-dot");
const ring = document.getElementById("cursor-ring");

document.addEventListener("mousemove", e => {
  dot.style.left  = e.clientX + "px";
  dot.style.top   = e.clientY + "px";
  ring.style.left = e.clientX + "px";
  ring.style.top  = e.clientY + "px";
});

function attachHoverCursor() {
  document.querySelectorAll("a, button, .product-card, .feature-card, .pay-pill, select").forEach(el => {
    el.addEventListener("mouseenter", () => ring.classList.add("hovered"));
    el.addEventListener("mouseleave", () => ring.classList.remove("hovered"));
  });
}

/* ---- NAV SCROLL ---- */
window.addEventListener("scroll", () => {
  document.getElementById("navbar").classList.toggle("scrolled", window.scrollY > 40);
});

/* ---- MOBILE MENU ---- */
function toggleMobileMenu() {
  document.getElementById("mobileMenu").classList.toggle("open");
}

/* ---- CART ---- */
function toggleCart() {
  const cartEl   = document.getElementById("cart");
  const overlay  = document.getElementById("cartOverlay");
  cartEl.classList.toggle("open");
  overlay.classList.toggle("open");
}

function addToCart(name, price) {
  cart.push({ name, price });
  updateCart();

  /* brief flash on the cart button */
  const btns = document.querySelectorAll(".cart-btn");
  btns.forEach(b => {
    b.style.borderColor = "var(--accent)";
    setTimeout(() => b.style.borderColor = "", 500);
  });
}

function removeItem(index) {
  cart.splice(index, 1);
  updateCart();
}

function updateCart() {
  const itemsEl = document.getElementById("cartItems");
  let total = 0;

  if (cart.length === 0) {
    itemsEl.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
  } else {
    itemsEl.innerHTML = cart.map((item, i) => `
      <div class="cart-item">
        <span class="cart-item-name">${item.name}</span>
        <div class="cart-item-right">
          <span class="cart-item-price">$${item.price.toFixed(2)}</span>
          <button class="cart-item-remove" onclick="removeItem(${i})" title="Remove">✕</button>
        </div>
      </div>
    `).join("");
  }

  cart.forEach(i => total += i.price);
  document.getElementById("total").innerText = total.toFixed(2);

  /* update both desktop + mobile counts */
  ["count", "countMobile"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = cart.length;
  });

  /* re-attach hover cursor to new buttons */
  attachHoverCursor();
}

/* ---- CHECKOUT ---- */
async function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const btn = document.querySelector(".checkout-btn");
  btn.disabled = true;
  btn.innerText = "Placing order…";

  const total = cart.reduce((s, i) => s + i.price, 0);
  const order = { items: cart, total: total.toFixed(2) };

  try {
    const res = await fetch(`${BACKEND}/api/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });
    const data = await res.json();

    if (data.success) {
      btn.innerText = "✓ Order placed!";
      btn.style.background = "#00b894";
      cart = [];
      updateCart();
      setTimeout(() => {
        toggleCart();
        btn.disabled = false;
        btn.innerText = "Proceed to Checkout";
        btn.style.background = "";
        updateAdmin();
      }, 2000);
    } else {
      alert("Checkout failed. Please try again.");
      btn.disabled = false;
      btn.innerText = "Proceed to Checkout";
    }
  } catch (e) {
    alert("Cannot connect to backend. Please try again later.");
    btn.disabled = false;
    btn.innerText = "Proceed to Checkout";
  }
}

/* ---- ADMIN ---- */
async function updateAdmin() {
  const statusEl = document.getElementById("adminStatus");
  const tbody    = document.getElementById("orders");
  const emptyEl  = document.getElementById("adminEmpty");

  statusEl.innerText = "Loading…";

  try {
    const res    = await fetch(`${BACKEND}/api/orders`);
    const orders = await res.json();

    statusEl.innerText = `${orders.length} order${orders.length !== 1 ? "s" : ""} total`;

    if (orders.length === 0) {
      tbody.innerHTML = "";
      emptyEl.style.display = "block";
      return;
    }

    emptyEl.style.display = "none";
    tbody.innerHTML = orders.map(o => {
      const date = new Date(o.date).toLocaleDateString("en-AU", {
        day: "2-digit", month: "short", year: "numeric"
      });
      const statusClass = `status-${(o.status || "pending").toLowerCase()}`;
      return `
        <tr>
          <td>#${o.id}</td>
          <td>${o.items.length} item${o.items.length !== 1 ? "s" : ""}</td>
          <td>$${o.total}</td>
          <td>${date}</td>
          <td><span class="status-badge ${statusClass}">${o.status}</span></td>
          <td>
            <select class="status-select" onchange="updateOrderStatus(${o.id}, this.value)">
              <option ${o.status==="Pending"   ? "selected" : ""}>Pending</option>
              <option ${o.status==="Shipped"   ? "selected" : ""}>Shipped</option>
              <option ${o.status==="Completed" ? "selected" : ""}>Completed</option>
              <option ${o.status==="Cancelled" ? "selected" : ""}>Cancelled</option>
            </select>
          </td>
        </tr>
      `;
    }).join("");

    attachHoverCursor();

  } catch (e) {
    statusEl.innerText = "Could not load orders.";
    console.warn("Admin fetch error:", e);
  }
}

async function updateOrderStatus(id, status) {
  try {
    await fetch(`${BACKEND}/api/order/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    updateAdmin();
  } catch (e) {
    console.warn("Status update failed:", e);
  }
}

/* ---- CONTACT ---- */
function handleContact(e) {
  e.preventDefault();
  const btn     = document.getElementById("contactSubmit");
  const success = document.getElementById("contactSuccess");

  btn.disabled    = true;
  btn.innerText   = "Sending…";

  /* Simulated send — wire to a real endpoint if needed */
  setTimeout(() => {
    btn.style.display    = "none";
    success.style.display = "block";
    document.getElementById("contactForm").reset();

    setTimeout(() => {
      btn.style.display    = "";
      success.style.display = "none";
      btn.disabled          = false;
      btn.innerText         = "Send Message";
    }, 4000);
  }, 1000);
}

/* ---- INIT ---- */
attachHoverCursor();
updateAdmin();
