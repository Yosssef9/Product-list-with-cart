let cards = document.querySelector(".cards");

fetch("./data.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    return response.json();
  })
  .then((data) => {
    console.log(data);
    data.forEach((element) => {
      let card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        
          <div class="img-container">
              <img data-thumbnail="${element.image.thumbnail}" src="./${
        element.image.desktop
      }" alt="" />
              <div class="addToCart">
                <img
                  class="cart-icon"
                  src="./assets/images/icon-add-to-cart.svg"
                  alt=""
                />
                <h4>Add to Cart</h4>
              </div>
            </div>
            <div class="description">
              <h5 class="type">${element.category}</h5>
              <h2 class="name">${element.name}</h2>
              <h2 class="price">$${element.price.toFixed(2)}</h2>
            </div>`;
      cards.appendChild(card);
    });
  })
  .catch((error) => {
    console.error("Error fetching JSON:", error);
  });
let cart = document.querySelector(".cart");
cards.addEventListener("click", (e) => {
  const addToCart = e.target.closest(".addToCart");
  if (!addToCart) return;

  // لو أول مرة، فعّل الزرار
  if (!addToCart.classList.contains("active")) {
    addToCart.classList.add("active");
    const card = addToCart.closest(".card");
    const productName = card.querySelector(".name").textContent; // اسم المنتج
    const productImg = addToCart.parentElement.querySelector("img");
    const thumbnail = productImg.dataset.thumbnail;
    const productPrice = parseFloat(
      card.querySelector(".price").textContent.replace("$", "")
    ); // سعر المنتج
    productImg.style.border = "3px solid hsl(14, 86%, 42%)";
    addToCart.innerHTML = `
      <div class="decrement-box plus-minus-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
          <path fill="white" d="M5 11h14v2H5z"/>
        </svg>
      </div>
      <span class="quantity">1</span>
      <div class="increment-box plus-minus-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
          <path fill="white" d="M11 5h2v14h-2z"/>
          <path fill="white" d="M5 11h14v2H5z"/>
        </svg>
      </div>
    `;

    const productId = productName;
    cartItems[productId] = {
      name: productName,
      price: productPrice,
      img: productImg.src,
      thumbnail: thumbnail,
      quantity: 1,
    };

    console.log(cartItems);
    renderCartitems();
    return; // انتهى الحدث الأول
  }

  // دلوقتي لو الضغط على + أو -
  if (e.target.closest(".increment-box")) {
    const card = addToCart.closest(".card");
    const productName = card.querySelector(".name").textContent;
    const quantity = addToCart.querySelector(".quantity");
    let newQuantity = (cartItems[productName].quantity += 1);
    quantity.textContent = parseInt(newQuantity);
    renderCartitems();
  }

  if (e.target.closest(".decrement-box")) {
    const card = addToCart.closest(".card");
    const productName = card.querySelector(".name").textContent;
    const quantity = addToCart.querySelector(".quantity");
    console.log(quantity);
    if (quantity.textContent == 1) {
      if (cartItems[productName]) {
        delete cartItems[productName];
        addToCart.classList.remove("active");
        const productImg = addToCart.parentElement.querySelector("img");

        productImg.style.border = "none";
        addToCart.innerHTML = `
                <img
                  class="cart-icon"
                  src="./assets/images/icon-add-to-cart.svg"
                  alt=""
                />
                <h4>Add to Cart</h4>
    `;
        renderCartitems();
      }
    } else {
      cartItems[productName].quantity -= 1;
      let newQuantity = cartItems[productName].quantity;

      quantity.textContent = parseInt(newQuantity);
      renderCartitems();
    }
  }
});

function renderCartitems() {
  if (Object.keys(cartItems).length === 0) {
    cart.innerHTML = `
     <div class="text">
          <h1>Your Cart</h1>
          <span>(0)</span>
        </div>

        <div class="cart-img-container">
          <img src="./assets/images/illustration-empty-cart.svg" alt="" />
          <p>Your added items will appear here</p>
        </div>
      </div>
    `;
  } else {
    cart.innerHTML = `
     <div class="text">
          <h1>Your Cart</h1>
          <span>(${Object.keys(cartItems).length})</span>
        </div>
    <div class="cart-items-container">
        </div>

        <div class="order-total-container">
          <h2>Order Total</h2>
          <div class="order-total-price">$${returnCartTotalPrice(
            cartItems
          )}</div>
        </div>
        <div class="carbon-neutral">
          <img src="./assets/images/icon-carbon-neutral.svg" alt="" />
          <p>This is a <span>carbon-neutral</span> delivery</p>
        </div>
        <div class="confirm-order-btn">Confirm Order</div>
    `;
    // add confirmed order Event Listener
    let overlay = document.querySelector(".overlay");
    let orderConfirmedContainer = document.querySelector(
      ".order-confirmed-container"
    );
    let orderConfirmedTotalPrice = document.querySelector(
      ".order-confirmed-total-container span"
    );
    let confirmOrderBtn = document.querySelector(".confirm-order-btn");

    confirmOrderBtn.addEventListener("click", () => {
      let orderConfirmedProductsContainer = document.querySelector(
        ".order-confirmed-products-container"
      );
      Object.values(cartItems).forEach((product) => {
        let orderConfirmedProduct = document.createElement("div");
        orderConfirmedProduct.classList.add("order-confirmed-product");
        orderConfirmedProduct.innerHTML = ` 
              <div class="imgAndOrder-confirmed-info">
                  <img
                    src="./${product.thumbnail}"
                    alt=""
                  />
                  <div class="order-confirmed-info">
                    <h4>${product.name}</h4>
                    <span class="order-confirmed-info-quantity">${
                      product.quantity
                    }x</span>
                    <span class="order-confirmed-info-price">@$${product.price.toFixed(
                      2
                    )}</span>
                  </div>
                </div>
                <div class="order-confirmed-product-totalPrice">$${(
                  product.price * product.quantity
                ).toFixed(2)}</div>
   `;
        orderConfirmedProductsContainer.appendChild(orderConfirmedProduct);
      });
      orderConfirmedTotalPrice.textContent = `$${returnCartTotalPrice(
        cartItems
      )}`;
      orderConfirmedContainer.style.display = "block";
      overlay.style.display = "block";
    });

    let cartItemsContainer = document.querySelector(".cart-items-container");

    Object.values(cartItems).forEach((product) => {
      let cartItem = document.createElement("div");
      cartItem.classList.add("cart-item");
      cartItem.innerHTML = `
        <div class="info">
              <h2>${product.name}</h2>
              <div class="info-price-container">
                <div class="info-price-quantity">${product.quantity}x</div>
                <div class="info-price">
                  <div class="info-price-orignal">@$${product.price}</div>
                  <div class="info-price-total">$${
                    product.price * product.quantity
                  }  </div>
                </div>
              </div>
            </div>
            <div class="remove-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                fill="none"
                viewBox="0 0 10 10"
              >
                <path
                  fill="#CAAFA7"
                  d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"
                />
              </svg>
            </div>
    `;

      let line = document.createElement("div");
      line.classList.add("line");
      cartItemsContainer.appendChild(cartItem);
      cartItemsContainer.appendChild(line);
    });
    cartItemsContainer.addEventListener("click", (e) => {
      const removeBtn = e.target.closest(".remove-btn");
      console.log(removeBtn);
      const cartItem = removeBtn.closest(".cart-item");
      console.log(cartItem);
      let productName = cartItem.querySelector("h2").textContent;
      console.log(productName);
      console.log("Removing:", productName);

      if (cartItems[productName]) {
        delete cartItems[productName];
      }

      renderCartitems();
      const allCards = document.querySelectorAll(".card");
      allCards.forEach((card) => {
        const cardName = card.querySelector(".name");
        if (cardName && cardName.textContent === productName) {
          let addToCart = card.querySelector(".addToCart");
          let img = card.querySelector("img");
          img.style.border = "none";
          addToCart.classList.remove("active");
          addToCart.innerHTML = `
           <img
                  class="cart-icon"
                  src="./assets/images/icon-add-to-cart.svg"
                  alt=""
                />
                <h4>Add to Cart</h4>
              </div>
          `;
        }
      });
      if (!removeBtn) return;
    });
  }
}

function returnCartTotalPrice(cartItems) {
  let totalPrice = 0;
  Object.values(cartItems).forEach((product) => {
    totalPrice += product.price * product.quantity;
  });
  return totalPrice.toFixed(2);
}

// close the orderConfirmedContainer when click outside it
let overlay = document.querySelector(".overlay");
let orderConfirmedContainer = document.querySelector(
  ".order-confirmed-container"
);
overlay.addEventListener("click", (e) => {
  if (e.target.closest(".order-confirmed-container")) return;

  console.log("Clicked outside!");
  overlay.style.display = "none";
  orderConfirmedContainer.style.display = "none";
});

let cartItems = {};
renderCartitems();
