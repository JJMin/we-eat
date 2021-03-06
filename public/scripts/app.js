
$(document).ready(function() {

  // Creates a DOM element for cart items
  function createCartItems(item) {
    return `
      <div class="row d-flex justify-content-between" id="${item.id}" data-quantity-type="${item.qty}">
        <div class="item-name" data-toggle="popover" data-placement="left" data-html="true" title="Change quantity below:" data-content='
        <div id="${item.id}">
          <button class="decrease-quantity">
            <i class="fal fa-minus"></i>
          </button>
          <input type="text" class="cart-quantity-value col-3 text-center" value="${item.qty}" data-value="${item.qty}"></input>
          <button class="increase-cart-quantity">
            <i class="fal fa-plus"></i>
          </button>
          <button class="quantity-change-btn">Save changes</button>
        </div>
        '>
          ${item.qty} x
          ${item.name}
          <p>${item.description}</p>
        </div>
        <div class="item-price pt-2">
          $${item.lineTotal}
          <button class="pl-2 remove-item-btn"><i class="fal fa-times"></i></button>
        </div>
      </div>
    `;
  }

  // Creates a DOM element for a dish
  function createDish(dish) {
    return `
      <a href="#" id="${
        dish.id
      }" class="food-item list-group-flush list-group-item-action menu-item border-top d-flex justify-content-between" data-toggle="modal" data-target="#menu-item-modal">
        <div class="item-name">
          ${dish.name}
          <p>${dish.description}</p>
        </div>
        <div class="item-price pt-2">
          $${dish.price}
          <i class="fa fa-plus-square fa-lg pl-2"></i>
        </div>
      </a>
    `;
  }

  // Creates a DOM element for a single dish in modal
  function createDishModal(dish) {
    return `
      <div id="dish" class="modal-content" data-origin="${dish.id}">
          <div class="modal-header">
            <h5 class="modal-title">
              ${dish.name}
            </h5>
            <a class="close" data-dismiss="modal" aria-label="Close">
              <i class="fal fa-times-circle"></i>
            </a>
          </div>
          <div class="modal-body">
            ${dish.description}
          </div>
          <div class="modal-footer d-flex justify-content-between">
            <div>
              <button class="decrease-quantity">
                <i class="fal fa-minus"></i>
              </button>
              <input type="text" class="quantity-value text-center" value="1" data-value="1"></input>
              <button class="increase-quantity">
                <i class="fal fa-plus"></i>
              </button>
            </div>
            <button type="button" class="btn btn-primary" id="add-to-cart" data-dismiss="modal">ADD TO CART
            </button>
          </div>
        </div>
    `;
  }

  // Shopping cart
  let cart = [];

  // Object for Food Category (/url and #id)
  const foodCategoryObj = {
    "/appetizers": "#coldapp",
    "/soups": "#soups",
    "/teriyaki": "#teriyaki"
  };

  // Ajax query to get a list of food category
  const loadFoodCategory = (url, elementResult) => {
    $.ajax({
      method: "GET",
      url: url
    }).then(results => {
      renderFoodCategory(results, elementResult);
    });
  };

  // For In Loop to Print Out the Food Category to HTML
  for (let foodCategoryEl in foodCategoryObj) {
    loadFoodCategory(foodCategoryEl, foodCategoryObj[foodCategoryEl]);
  }

  // Renders dishes into index.html
  const renderFoodCategory = (foodArr, elementCategory) => {
    for (let foodItem of foodArr) {
      $(elementCategory).append(createDish(foodItem));
    }
  };

  // Renders a single dish into index.html
  const renderSingleDishModal = foodArr => {
    for (let foodItem of foodArr) {
      $("#menu-item-modal-container").empty();
      $("#menu-item-modal-container").append(createDishModal(foodItem));
    }
  };

  // Renders menu items for cart modal into index.html
  const renderCartItems = cartArr => {
    let subTotal = 0,
      serviceFee = 2.99,
      total = 0;

    cartArr.forEach(item => {
      subTotal += parseFloat(item.lineTotal);
      $("#cart-items").append(createCartItems(item));
    });

    // Enables popover to edit cart item quantity
    $('[data-toggle="popover"]').popover();

    // Change quantity of selected item then re-render
    // cart item modal to re-calculate prices
    $(document).on("click", ".quantity-change-btn", function(event) {
      const quantityValue = Number($(".quantity-value").data("value"));
      if (!(quantityValue <= 0)) {
        cart.forEach(item => {
          if (item.id == $(this).parent().attr("id")) {
            item.qty = quantityValue;
            item.lineTotal = (quantityValue * parseFloat(item.price)).toFixed(2);
          }
        });
      }

      // Updates cart button icon to show total number of
      // items in cart currently
      let itemsInCart = 0;
      cart.forEach(item => {
        itemsInCart += item.qty;
      });
      $("#cart-btn").empty();
      $("#cart-btn").append(
        `<i class="fal fa-shopping-cart"></i> Cart (${itemsInCart})`
      );

      $(".item-name").popover("hide");
      $("#cart-items").empty();
      renderCartItems(cart);
    });

    // Ensures that only one quantity popover is shown at once
    $(document).on("click", ".item-name", function(event) {
      $(".item-name").not(this).popover("hide");
    });

    if (cartArr.length === 0) {
      total = 0;
    } else {
      total = subTotal * 1.15 + serviceFee;
    }

    $("#subtotal-amount").text(subTotal.toFixed(2));
    $("#total-amount").text(total.toFixed(2));

    $(".remove-item-btn").click(function() {
      const removedItemID = $(this)
        .parent()
        .parent()
        .attr("id");
      cart.forEach(item => {
        if (item.id == removedItemID) {
          cart.splice(cart.indexOf(item), 1);
          subTotal -= item.lineTotal;
          if (cart.length === 0) {
            total = 0;
          } else {
            total = subTotal * 1.15 + serviceFee;
          }
          $("#subtotal-amount").text(subTotal.toFixed(2));
          $("#total-amount").text(total.toFixed(2));
        }
      });
      $(this)
        .parent()
        .parent()
        .remove();

      // Updates cart button icon to show total number of items
      // in cart currently when items are deleted from cart
      let itemsInCart = 0;
      cart.forEach(item => {
        itemsInCart += item.qty;
      });
      $("#cart-btn").empty();
      if (itemsInCart === 0) {
        $("#cart-btn").append(`<i class="fal fa-shopping-cart"></i> Cart`);
      } else {
        $("#cart-btn").append(
          `<i class="fal fa-shopping-cart"></i> Cart (${itemsInCart})`
        );
      }
    });

    // Removes "empty cart" alert on modal
    $(".alert-danger").remove();
  };

  // Places the order from the cart
  $(".modal-footer").on("click", "#checkout-btn", function(event) {
    if ($(".phone-number").val() == "") {
      $(".phone-number").addClass("is-invalid");
      $(".invalid-feedback").empty();
      $(".phone-number-container").append(() => {
        return `
        <div class="invalid-feedback">
          A telephone number is required, please enter your telephone number.
        </div>
        `;
      });
    }
    if (!($(".phone-number").val() == "")) {
      $(".phone-number").removeClass("is-invalid");
      $(".invalid-feedback").remove();
    }
    if (cart.length === 0) {
      $(".alert-danger").remove();
      $(".modal-footer").prepend(() => {
        return `
        <div class="alert alert-danger" role="alert">
          Cannot process empty order, please add items to your cart.
        </div>
        `;
      });
    } else if (cart.length !== 0 && !($(".phone-number").val() == "")) {
      $(".phone-number").removeClass("is-invalid");
      $(".invalid-feedback").remove();
      let obj = {
        cart: cart,
        subTotal: $("#subtotal-amount").html(),
        serviceFee: 2.99,
        total: $("#total-amount").html(),
        telephone: `+1${$(".phone-number").val()}`
      };
      console.log(obj.telephone)

    // Sends the order out
    $.ajax({
      method: "POST",
      url: "/order",
      data: obj
    })
      .done(results => {
        console.log(results);
      })
      .catch(err => {
        console.log(err);
      });

      // After menu items have been ordered, everything is reset
      cart = [];
      obj = {};
      $(".phone-number").val("");
      $("#cart-btn").empty();
      $("#cart-btn").append(`<i class="fal fa-shopping-cart"></i> Cart`);
      $("#checkout-modal").modal("hide");
      $("#post-order-message-modal").modal("show");
    }
  });

  // Gets the dish object by its id when clicked
  $("#menu-container").on("click", ".food-item", function(event) {
    $.ajax({
      method: "GET",
      url: `/dish/${this.id}`
    })
      .done(results => {
        renderSingleDishModal(results);
      })
      .catch(err => {
        console.log(err);
      });
  });

  // Increases qty of single dish on modal
  $(document).on("click", ".increase-quantity", function(event) {
    let quantity = Number($(".quantity-value").data("value"));

    if (quantity >= 0) {
      $(".decrease-quantity").removeAttr("disabled");
    }

    quantity++;

    $(this)
      .siblings("input")
      .val(quantity);
    $(".quantity-value").data("value", quantity);
  });

  // Increases qty of single dish on modal
  $(document).on("click", ".increase-cart-quantity", function (event) {
    let quantity = Number($("#cart-items #" + $(this).parent().attr("id")).attr("data-quantity-type"));

    if (quantity >= 0) {
      $(".decrease-quantity").removeAttr("disabled");
    }

    quantity++;

    $("#cart-items #" + $(this).parent().attr("id")).attr("data-quantity-type", quantity)

    $(this)
      .siblings("input")
      .val(quantity);
    $(".quantity-value").data("value", quantity);
  });

  // Decreases qty of single dish on modal
  $(document).on("click", ".decrease-quantity", function(event) {
    let quantity = Number($(".quantity-value").data("value"));

    if (quantity <= 0) {
      $(".decrease-quantity").attr("disabled", "disabled");
    } else {
      quantity--;
    }

    $(this)
      .siblings("input")
      .val(quantity);
    $(".quantity-value").data("value", quantity);
  });

  // Decreases qty of single dish on modal
  $(document).on("click", ".decrease-quantity", function (event) {
    let quantity = Number($("#cart-items #" + $(this).parent().attr("id")).attr("data-quantity-type"));

    if (quantity <= 0) {
      $(".decrease-cart-quantity").attr("disabled", "disabled");
    } else {
      quantity--;
    }

    $("#cart-items #" + $(this).parent().attr("id")).attr("data-quantity-type", quantity)

    $(this)
      .siblings("input")
      .val(quantity);
    $(".cart-quantity-value").data("value", quantity);
  });

  // Adds an item to the cart
  $(".modal-dialog").on("click", "#add-to-cart", function(event) {
    const dishId = $("#dish").data("origin");
    $.ajax({
      method: "GET",
      url: `/dish/${dishId}`
    })
      .done(results => {
        if ($(".quantity-value").data("value") >= 1) {
          const lineTotal =
            $(".quantity-value").data("value") * parseFloat(results[0].price);
          const obj = {
            id: results[0].id,
            name: results[0].name,
            description: results[0].description,
            price: results[0].price,
            image_url: results[0].image_url,
            qty: parseInt($(".quantity-value").data("value")),
            lineTotal: lineTotal.toFixed(2)
          };
          cart.push(obj);

          // Updates cart button icon to show total number of items in cart currently
          let itemsInCart = 0;
          cart.forEach(item => {
            itemsInCart += item.qty;
          });
          $("#cart-btn").empty();
          $("#cart-btn").append(
            `<i class="fal fa-shopping-cart"></i> Cart (${itemsInCart})`
          );
        }
      })
      .catch(err => {
        console.log(err);
      });
  });

  // On cart button click, render cart items dynamically
  $("#cart-btn").click(() => {
    $("#cart-items").empty();
    renderCartItems(cart);
  });

  // Enforces quantity value to be greater than
  // or equal to 1 and sets the data value to the user input value
  $(document).on("change keyup", ".quantity-value", function(event) {
    if ($(".quantity-value").data("value") <= 0) {
      $(".quantity-value").data("value", "1");
      $(this).val(1);
    } else {
      $(".quantity-value").data("value", $(this).val());
    }
  });

  // Smooth scrolling with links
  $("a[href*=\\#]").on("click", function(event) {
    event.preventDefault();
    $("html,body").animate({ scrollTop: $(this.hash).offset().top - 80 }, 700);
  });

});
