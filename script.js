let cart = [];
let orders = [];

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

async function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const order = { items: cart, total: total.toFixed(2) };

  try {
    const res = await fetch("https://vanguard-backend-yl1g.onrender.com/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });

    if (!res.ok) throw new Error("Server error");

    const data = await res.json();
    if (data.success) {
      alert("Order placed: #" + data.order.id);
      cart = [];
      updateCart();
      updateAdmin();
    } else {
      alert("Checkout failed");
    }
  } catch (e) {
    console.error(e);
    alert("Cannot connect to backend. Make sure the backend is running and CORS is enabled.");
  }
}

async function updateAdmin() {
  try {
    const res = await fetch("https://vanguard-backend-yl1g.onrender.com/api/orders");
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

// Initialize admin table on page load
updateAdmin();
