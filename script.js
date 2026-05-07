const BACKEND = "https://vanguard-backend-yl1g.onrender.com/";
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

function toggleCart() {
  document.getElementById("cart").classList.toggle("open");
  document.getElementById("cartOverlay").classList.toggle("open");
}

function addToCart(name, price) {
  cart.push({name, price});
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
}

function updateCart() {
  const cartItems = document.getElementById("cartItems");
  if (!cartItems) return;

  let total = 0;

  cartItems.innerHTML = cart.map(item => {
    total += item.price;
    return `<div class="cart-item">${item.name} - $${item.price}</div>`;
  }).join("");

  document.getElementById("total").innerText = total.toFixed(2);
  document.getElementById("count").innerText = cart.length;
}

function goCheckout() {
  window.location.href = "checkout.html";
}

const checkoutForm = document.getElementById("checkoutForm");

if (checkoutForm) {
  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const order = {
      fullName: document.getElementById("fullName").value,
      email: document.getElementById("email").value,
      address: document.getElementById("address").value,
      items: cart,
      total: cart.reduce((a,b)=>a+b.price,0).toFixed(2)
    };

    const res = await fetch("/api/order", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(order)
    });

    const data = await res.json();

    alert("Order placed. Your order number is #" + data.order.id);

    localStorage.removeItem("cart");
    cart = [];
    window.location.href = "index.html";
  });
}

async function loginAdmin() {
  const password = document.getElementById("adminPassword").value;

  const res = await fetch("/api/admin-login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({password})
  });

  if (res.ok) {
    document.querySelector(".admin-login").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";

    loadOrders(password);
  } else {
    alert("Wrong password");
  }
}

async function loadOrders(password) {
  const res = await fetch("/api/orders", {
    headers: {
      "x-admin-password": password
    }
  });

  const orders = await res.json();

  document.getElementById("orders").innerHTML = orders.map(o => `
    <tr>
      <td>#${o.id}</td>
      <td>${o.fullName}</td>
      <td>${o.email}</td>
      <td>${o.address}</td>
      <td>$${o.total}</td>
    </tr>
  `).join("");
}

updateCart();
