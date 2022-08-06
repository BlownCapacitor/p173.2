AFRAME.registerComponent("create-button",{
  init:function(){
   var button1 = document.createElement("button");
   button1.innerHTML = "Order Summary";
   button1.setAttribute("id","summary-button");
   button1.setAttribute("class","btn btn-warning")

   var button2 = document.createElement("button");
   button2.innerHTML = "Order";
   button2.setAttribute("id","order-button");
   button2.setAttribute("class", "btn btn-warning");

   var buttonDisplay = document.getElementById("button-div");
   buttonDisplay.appendChild(button1);
   buttonDisplay.appendChild(button2);
  }
})