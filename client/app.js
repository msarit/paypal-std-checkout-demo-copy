import { ITEMS } from "./constants.js";

const cartItems = [];
let cartTotal = 0;

function addToCart(productId, quantityId) {
  const quantitySelect = document.getElementById(quantityId);
  const selectedQuantity = parseInt(quantitySelect.value, 10);

  if (selectedQuantity > 0) {
    cartItems.push({
      id: productId,
      quantity: selectedQuantity,
    });
    cartTotal = calculateCartTotal(cartItems);
    updateCart(cartItems);
  }
}

function calculateCartTotal(cartItems) {
  let total = 0;
  cartItems.forEach((item) => {
    total += item.quantity * ITEMS[item.id].price;
  });

  return total;
}

function updateCart(cartItems) {
  const cartItemsList = document.getElementById("cart-items");
  const cartTotalElement = document.getElementById("cart-total");

  cartItemsList.innerHTML = "";
  cartTotalElement.textContent = cartTotal;

  cartItems.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${ITEMS[item.id].name}: ${item.quantity}`;
    cartItemsList.appendChild(li);
  });
}

window.paypal
  .Buttons({
    async createOrder() {
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // use the "body" param to optionally pass additional order information
          // like product ids and quantities
          body: JSON.stringify({
            cart: cartItems,
          }),
        });

        const orderData = await response.json();

        if (orderData.id) {
          return orderData.id;
        } else {
          const errorDetail = orderData?.details?.[0];
          const errorMessage = errorDetail
            ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
            : JSON.stringify(orderData);

          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error(error);
        resultMessage(`Could not initiate PayPal Checkout...<br><br>${error}`);
      }
    },
    async onApprove(data, actions) {
      try {
        const response = await fetch(`/api/orders/${data.orderID}/capture`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const orderData = await response.json();

        // Three cases to handle:
        //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
        //   (2) Other non-recoverable errors -> Show a failure message
        //   (3) Successful transaction -> Show confirmation or thank you message

        const errorDetail = orderData?.details?.[0];

        if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
          // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
          // recoverable state, per https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
          return actions.restart();
        } else if (errorDetail) {
          // (2) Other non-recoverable errors -> Show a failure message
          throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
        } else if (!orderData.purchase_units) {
          throw new Error(JSON.stringify(orderData));
        } else {
          // (3) Successful transaction -> Show confirmation or thank you message
          // Or go to another URL:  actions.redirect('thank_you.html');
          const transaction =
            orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
            orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
          resultMessage(
            `Transaction ${transaction.status}: ${transaction.id}<br><br>See console for all available details`,
          );
          console.log(
            "Capture result",
            orderData,
            JSON.stringify(orderData, null, 2),
          );
        }
      } catch (error) {
        console.error(error);
        resultMessage(
          `Sorry, your transaction could not be processed...<br><br>${error}`,
        );
      }
    },
    onShippingChange(data) {
      // data.selected_shipping_option contains the selected shipping option
      console.log("SELECTED_OPTION", data.selected_shipping_option);
    },
  })
  .render("#paypal-button-container");

// Example function to show a result to the user. Your site's UI library can be used instead.
function resultMessage(message) {
  const container = document.querySelector("#result-message");
  container.innerHTML = message;
}

// Event Listeners
const productBtns = document.querySelectorAll(".product-btn");
productBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const productId = e.target.dataset.productId;
    const quantityId = e.target.dataset.quantityId;
    addToCart(productId, quantityId);
  });
});

// clear cart
document.getElementById("clear-cart").addEventListener("click", () => {
  // clear cart items, without reassigning the array
  cartItems.length = 0;
  cartTotal = 0;
  updateCart(cartItems);
});
