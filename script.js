let cart = [];
let orders = [];
let adminToken = null;

function toggleCart() {
  document.getElementById("cart").classList.toggle("open");
}

function addToCart(name, price) {
  cart.push({ name, price });
  updateCart();
}

function removeItem(i) {
  cart.splice(i, 1);
  updateCart();
}

function updateCart() {
  const items = document.getElementById("cartItems");
  let total = 0;
  items.innerHTML = "";

  cart.forEach((item, i) => {
    total += item.price;
    items.innerHTML += `
      <div class="cart-item">
        <span>${item.name}</span>
        <span>
          $${item.price.toFixed(2)}
          <button onclick="removeItem(${i})">❌</button>
        </span>
      </div>
    `;
  });

  document.getElementById("total").innerText = total.toFixed(2);
  document.getElementById("count").innerText = cart.length;
}

// --- Checkout with customer info ---
async function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const name = document.getElementById("customerName").value.trim();
  const email = document.getElementById("customerEmail").value.trim();
  const address = document.getElementById("customerAddress").value.trim();

  if (!name || !email || !address) {
    alert("Please fill in all your details.");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const order = {
    customer: { name, email, address },
    items: cart,
    total: total.toFixed(2)
  };

  try {
    const res = await fetch("https://vanguard-backend-yl1g.onrender.com/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });

    if (!res.ok) throw new Error("Server error");

    const data = await res.json();
    if (data.success) {
      alert(`Order placed successfully! Order #${data.order.id}`);
      cart = [];
      updateCart();
      document.getElementById("customerName").value = "";
      document.getElementById("customerEmail").value = "";
      document.getElementById("customerAddress").value = "";
      if (adminToken) updateAdmin();
    } else {
      alert("Checkout failed");
    }
  } catch (e) {
    console.error(e);
    alert("Cannot connect to backend. Make sure backend is running.");
  }
}

// --- Admin Login ---
async function adminLogin() {
  const username = document.getElementById("adminUsername").value;
  const password = document.getElementById("adminPassword").value;

  try {
    const res = await fetch("https://vanguard-backend-yl1g.onrender.com/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (data.success) {
      alert("Login successful!");
      adminToken = data.token;
      document.getElementById("adminLogin").style.display = "none";
      document.getElementById("adminSection").style.display = "block";
      updateAdmin();
    } else {
      alert("Invalid credentials");
    }
  } catch (e) {
    console.error(e);
    alert("Login failed");
  }
}

// --- Admin Orders Fetch ---
async function updateAdmin() {
  if (!adminToken) return;

  try {
    const res = await fetch("https://vanguard-backend-yl1g.onrender.com/api/orders", {
      headers: { "Authorization": "Bearer " + adminToken }
    });

    if (!res.ok) throw new Error("Failed to fetch orders");

    const ordersData = await res.json();
    const table = document.getElementById("orders");
    table.innerHTML = "";

    ordersData.forEach(o => {
      table.innerHTML += `
        <tr>
          <td>${o.id}</td>
          <td>${o.items.length}</td>
          <td>$${o.total}</td>
          <td>${o.status}</td>
        </tr>
      `;
    });
  } catch (e) {
    console.error("Cannot load admin:", e);
  }
}

// Initialize admin table if logged in
updateAdmin();
