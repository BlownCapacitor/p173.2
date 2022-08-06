var userId = null;
AFRAME.registerComponent("markerhandler", {
  init: async function () {
    if (tableNumber === null) {
      this.askUserId();
    }
    var toys = await this.getToys();
    this.el.addEventListener("markerFound", () => {
      if (tableNumber !== null) {
        var markerId = this.el.id;
        this.handleMarkerFound(toys, markerId);
      }
    });
    this.el.addEventListener("markerLost", () => {;
      this.handleMarkerLost();
    });
  },
  askUserId: function () {
    swal({
      title: "AR toystore",
      icon: info,
      content: {
        element: "input",
        attributes: {
          placeholder: "Your User ID",
          type: "number",
        }
      },
      closeOnClickOutside: false,
    }).then(inputValue => {
      userId = inputValue;
    });
  },

  handleMarkerFound: function (toys, markerId) {
    var toy = toys.filter(toy => toy.id === markerId)[0];
    var model = document.querySelector(`#model-${toy.id}`);
    model.setAttribute("position", toy.model_geometry.position);
    model.setAttribute("rotation", toy.model_geometry.rotation);
    model.setAttribute("scale", toy.model_geometry.scale);
    model.setAttribute("visible", true);

    var ingredientsContainer = document.querySelector(`#main-plane-${toy.id}`);
      ingredientsContainer.setAttribute("visible", true);

      var priceplane = document.querySelector(`#price-plane-${toy.id}`);
      priceplane.setAttribute("visible", true)

      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";

    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "flex";

    var buttonRate = document.getElementById("rating-button");
    var buttonOrder = document.getElementById("order-button");
    var orderSummaryButtton = document.getElementById("order-summary-button");
    var paybutton = document.getElementById("pay-button");
    
    buttonRate.addEventListener("click", () => {
      swal({
        icon: warning,
        title: "Order Summary",
        text: "In Development. Will Be featured in the next version",
      })
    });
    
    buttonOrder.addEventListener("click", () => {
      var UID;
      userId <= 9 ? (UID = `U0${userId}`) : `U${userId}`;
      this.handleOrder(UID, toy);

      swal({
        icon: success,
        title: "Thanks For Order !",
        text: "We hope you enjoy the toy!",
        timer: 2000
      });
    });

    orderSummaryButtton.addEventListener("click", () =>
      this.handleOrderSummary()
    );

    paybutton.addEventListener("click",()=> this.handlePayment())
  },
   
  handleOrder: function (UID, toy) {
   
    firebase
      .firestore()
      .collection("users")
      .doc(UID)
      .get()
      .then(doc => {
        var details = doc.data();
        if (details["current_orders"][toy.id]) {
          details["current_orders"][toy.id]["quantity"] += 1;
          var currentQuantity = details["current_orders"][toy.id]["quantity"];
          details["current_orders"][toy.id]["subtotal"] =
            currentQuantity * toy.price;
        } else {
          details["current_orders"][toy.id] = {
            item: toy.dish_name,
            price: toy.price,
            quantity: 1,
            subtotal: toy.price * 1
          };
        }

        details.total_bill += toy.price;
        firebase
          .firestore()
          .collection("users")
          .doc(doc.id)
          .update(details);
      });
  },
  getOrderSummary: async function (UID) {
    return await firebase
      .firestore()
      .collection("users")
      .doc(UID)
      .get()
      .then(doc => doc.data());
  },
  handleOrderSummary: async function () {
    var UID;
    userId <= 9 ? (UID = `U0${userId}`) : `U${userId}`;

    var orderSummary = await this.getOrderSummary(UID);

    var modalDiv = document.getElementById("modal-div");
    modalDiv.style.display = "flex";

    var tableBodyTag = document.getElementById("bill-table-body");

  tableBodyTag.innerHTML = "";
    var currentOrders = Object.keys(orderSummary.current_orders);

    currentOrders.map(i => {

      var tr = document.createElement("tr");

      var item = document.createElement("td");
      var price = document.createElement("td");
      var quantity = document.createElement("td");
      var subtotal = document.createElement("td");

      item.innerHTML = orderSummary.current_orders[i].item;

      price.innerHTML = "$" + orderSummary.current_orders[i].price;
      price.setAttribute("class", "text-center");

      quantity.innerHTML = orderSummary.current_orders[i].quantity;
      quantity.setAttribute("class", "text-center");

      subtotal.innerHTML = "$" + orderSummary.current_orders[i].subtotal;
      subtotal.setAttribute("class", "text-center");

      tr.appendChild(item);
      tr.appendChild(price);
      tr.appendChild(quantity);
      tr.appendChild(subtotal);

   tableBodyTag.appendChild(tr);
    });

    var totalTr = document.createElement("tr");
    var td1 = document.createElement("td");
    td1.setAttribute("class", "no-line");
    var td2 = document.createElement("td");
    td2.setAttribute("class", "no-line");
    var td3 = document.createElement("td");
    td3.setAttribute("class", "no-line text-center");
    var td4 = document.createElement("td");
    td4.setAttribute("class", "no-line text-center");

    var strongTag = document.createElement("strong");
    strongTag.innerHTML = "total";
    td3.appendChild(strongTag);

    td4.innerHTML = "$"+orderSummary.total_bilwl;

    totalTr.appendChild(td1);
    totalTr.appendChild(td2);
    totalTr.appendChild(td3);
    totalTr.appendChild(td4);

    tableBodyTag.appendChild(totalTr);
  },
  handlePayment: function () {
    document.getElementById("modal-div").style.display = "none";
    var UID;
    userId <= 9 ? (UID = `U0${userId}`) : `U${userId}`;
     firebase
     .firestore()
     .collection("users")
     .doc(UID)
     .update({
       current_orders: {},
       total_bill :0
     }).then(()=>{
       swal({
         icon: success,
         title: "Thanks for paying"
       })
     })
 
   },

   handleRatings: async function (toy) {
    var UID;
    userId <= 9 ? (UID = `U0${userId}`) : `U${userId}`;
    var orderSummary = await this.getOrderSummary(UID);

    var currentOrders = Object.keys(orderSummary.current_orders);    

    if (currentOrders.length > 0 && currentOrders==toy.id) {
     document.getElementById("rating-div").style.display = "flex";
     document.getElementById("rating-input").value = 0;
     document.getElementById("feedback-input").value = "";

     var ratingButtonId = document.getElementById("save-rating-button");
     ratingButtonId.addEventListener("click", ()=>{
      document.getElementById("rating-div").style.display = "none";
      var starCount = document.getElementById("rating-input").value;
      var feedbackMesage = document.getElementById("feedback-input").value;

      firebase
      .firestore()
      .collection("toys")
      .doc(toy.id)
      .update({
        last_review: feedbackMesage,
        last_rating: starCount
      }).then(()=>{
        swal({
          icon: "success",
          title: "Rating Successful",
          text: "Thank you for rating!",
          timer: 2500,
          buttons: true

        })
      })

     });
    }
    else{
      swal({
        icon : "warning",
        title: "Invalid",
        text: "Please place order before rating",
        timer: 2500
      })

    }
  },
  handleMarkerLost: function () {
    var buttonSelect = document.getElementById("button-div");
    buttonSelect.style.display = "none";
  },
  getToys: async function () {
    return await firebase
      .firestore()
      .collection("toys")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  }

});