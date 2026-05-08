const BACKEND = "https://vanguard-backend-yl1g.onrender.com";

let cart = JSON.parse(localStorage.getItem("cart") || "[]");

// ======================
// CART
// ======================

function toggleCart() {
  document.getElementById("cart").classList.toggle("open");
  document.getElementById("cartOverlay").classList.toggle("open");
}

function addToCart(name, price) {
  cart.push({ name, price });

  localStorage.setItem("cart", JSON.stringify(cart));

  updateCart();
}

function updateCart() {
  const cartItems = document.getElementById("cartItems");

  if (!cartItems) return;

  let total = 0;

  cartItems.innerHTML = cart.map(item => {
    total += item.price;

    return `
      <div class="cart-item">
        <span>${item.name}</span>
        <span>AU$${item.price}</span>
      </div>
    `;
  }).join("");

  document.getElementById("total").innerText = `AU$${total.toFixed(2)}`;
  document.getElementById("count").innerText = cart.length;
}

function goCheckout() {
  window.location.href = "checkout.html";
}

// ======================
// CHECKOUT
// ======================

const checkoutForm = document.getElementById("checkoutForm");

if (checkoutForm) {
  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const order = {
      fullName: document.getElementById("fullName").value,
      email: document.getElementById("email").value,
      address: document.getElementById("address").value,
      btcAddress: document.getElementById("btcAddress").value,
      items: cart,
      total: cart.reduce((a, b) => a + b.price, 0).toFixed(2)
    };

    try {
      const res = await fetch(`${BACKEND}/api/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(order)
      });

      const data = await res.json();

      alert(`Order placed successfully.\nOrder #${data.order.id}`);

      localStorage.removeItem("cart");

      cart = [];

      window.location.href = "index.html";

    } catch (err) {
      console.error(err);
      alert("Checkout failed.");
    }
  });
}

// ======================
// ADMIN LOGIN
// ======================

async function loginAdmin() {
  const password = document.getElementById("adminPassword").value;

  try {
    const res = await fetch(`${BACKEND}/api/admin-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password })
    });

    if (res.ok) {
      document.querySelector(".admin-login").style.display = "none";

      document.getElementById("adminPanel").style.display = "block";

      loadOrders(password);

    } else {
      alert("Wrong password");
    }

  } catch (err) {
    console.error(err);
    alert("Login failed.");
  }
}

// ======================
// LOAD ORDERS
// ======================

async function loadOrders(password) {
  try {
    const res = await fetch(`${BACKEND}/api/orders`, {
      headers: {
        "x-admin-password": password
      }
    });

    const orders = await res.json();

    document.getElementById("orders").innerHTML = orders.reverse().map(o => `
    
      <div class="order-card">

        <div class="order-top">
          <h2>Order #${o.id}</h2>

          <span class="order-total">
            AU$${o.total}
          </span>
        </div>

        <div class="order-section">
          <strong>Customer</strong>

          <p>${o.fullName}</p>
          <p>${o.email}</p>
        </div>

        <div class="order-section">
          <strong>Shipping Address</strong>

          <p>${o.address}</p>
        </div>

        <div class="order-section">
          <strong>Bitcoin Address</strong>

          <p class="btc">
            ${o.btcAddress || "N/A"}
          </p>
        </div>

        <div class="order-section">
          <strong>Items Ordered</strong>

          <div class="items">

            ${o.items.map(i => `
              <div class="item">
                <span>${i.name}</span>
                <span>AU$${i.price}</span>
              </div>
            `).join("")}

          </div>
        </div>

      </div>

    `).join("");

  } catch (err) {
    console.error(err);
    alert("Failed to load orders.");
  }
}

// ======================
// INIT
// ======================

updateCart();
