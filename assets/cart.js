document.addEventListener("DOMContentLoaded", function () {
    // Function to update the cart summary
    function updateCartSummary(cart) {
      document.getElementById("total-items").innerText = cart.item_count;
      document.getElementById("total-price").innerText = formatMoney(cart.total_price);
    }
  
    // Function to format money using numeral.js
    function formatMoney(amount) {
      return numeral(amount / 100).format("$0,0.00"); // Format amount to your desired currency format
    }
  
    // Function to handle AJAX requests
    function ajaxRequest(url, method, data, callback) {
      axios({
        method: method,
        url: url,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      })
      .then((response) => callback(response.data))
      .catch((error) => console.error("Error:", error));
    }
  
    // Function to handle quantity change
    function handleQuantityChange(key, newQuantity) {
      var cartItem = document.querySelector(`.cart__item[data-key="${key}"]`);
      var pricePerItem = parseInt(cartItem.dataset.price);
      var newLinePrice = pricePerItem * newQuantity;
  
      // Update item price immediately
      cartItem.querySelector(".cart__item-price").innerText = formatMoney(newLinePrice);
  
      // Update total price immediately
      var totalPrice = Array.from(document.querySelectorAll(".cart__item")).reduce((sum, item) => {
        var itemQuantity = parseInt(item.querySelector(".cart__quantity-input").value);
        var itemPrice = parseInt(item.dataset.price) * itemQuantity;
        return sum + itemPrice;
      }, 0);
  
      document.getElementById("total-price").innerText = formatMoney(totalPrice);
  
      var updates = {};
      updates[key] = newQuantity;
  
      ajaxRequest("/cart/update.js", "POST", { updates: updates }, function (cart) {
        updateCartSummary(cart);
      });
    }
  
    // Add event listeners to quantity increase buttons
    document.querySelectorAll('.cart__quantity-increase-btn').forEach(function (button) {
      button.addEventListener('click', function () {
        var key = this.dataset.key;
        var quantityInput = document.getElementById(`quantity_${key}`);
        var newQuantity = parseInt(quantityInput.value) + 1;
        quantityInput.value = newQuantity; // Update the quantity immediately
        handleQuantityChange(key, newQuantity); // Call the function to handle quantity change
      });
    });
  
    // Add event listeners to quantity decrease buttons
    document.querySelectorAll('.cart__quantity-decrease-btn').forEach(function (button) {
      button.addEventListener('click', function () {
        var key = this.dataset.key;
        var quantityInput = document.getElementById(`quantity_${key}`);
        var newQuantity = parseInt(quantityInput.value) - 1;
        if (newQuantity < 1) return; // Ensure quantity doesn't go below 1
        quantityInput.value = newQuantity; // Update the quantity immediately
        handleQuantityChange(key, newQuantity); // Call the function to handle quantity change
      });
    });
  
    // Handle item removal
    document.querySelectorAll(".cart__remove-btn").forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        var key = this.dataset.key;
  
        ajaxRequest("/cart/change.js", "POST", { id: key, quantity: 0 }, function (cart) {
          document.querySelector(`.cart__item[data-key="${key}"]`).remove();
          updateCartSummary(cart);
          var totalPrice = Array.from(document.querySelectorAll(".cart__item")).reduce((sum, item) => {
            var itemQuantity = parseInt(item.querySelector(".cart__quantity-input").value);
            var itemPrice = parseInt(item.dataset.price) * itemQuantity;
            return sum + itemPrice;
          }, 0);
          document.getElementById("total-price").innerText = formatMoney(totalPrice);
        });
      });
    });
  });
  