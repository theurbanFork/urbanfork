let cart = JSON.parse(localStorage.getItem("cart")) || [];
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {
  const existingItem = cart.find((item) => item.id === product.id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  try {
    saveCart();
    renderCart();
  } catch (err) {
    saveCart();
  }
}
function clearOrder() {
  localStorage.removeItem("cart");
  clearCart();
}
function removeQuantity(product) {
  const existingItem = cart.find((item) => item.id === product.id);
  if (existingItem && existingItem.quantity > 0) {
    existingItem.quantity--;
  }
  if (existingItem.quantity == 0) {
    cart = cart.filter((item) => item.id !== product.id);
  }
  renderCart();
  saveCart();
}
function removeCartItem(product) {
  cart = cart.filter((item) => item.id !== product.id);

  renderCart();
  saveCart();
}
function openPage(url) {
  window.open(url, "_self");
}

async function deleteItem(url) {
  try {
    const response = await fetch(url, {
      method: "DELETE",
    });

    const result = await response.text();
    alert(result);
  } catch (err) {
    console.error("Error:", err);
    alert("Failed to update product");
  }
}
