import axios from 'axios';
import { Notyf } from 'notyf';
import { initAdmin } from './admin.js';
import moment from 'moment';
import initStripe from './stripe.js'

let addToCart = document.querySelectorAll(".add-to-cart");
let cartCounter = document.querySelector("#cartCounter");
let search = document.getElementById("search");
let searchResults = document.getElementById("searchResults");
// let cancelOrder = document.getElementById("cancelOrder");

const notyf = new Notyf({
  duration: 1000,
  position: {
    x: 'right',
    y: 'top',
  }
});

// search pizza

function sendData(e) {
  let match = e.value.match(/\s*/);
  console.log(match);

  if (match[0] === e.value) {
    searchResults.innerHTML = '';
    return;
  }

  fetch("search", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({
      payload: e.value
    })
  })
    .then((response) => { return response.json() })
    .then((json) => {
      let data = json.data;
      searchResults.innerHTML = '';
      if (data.length < 1) {

        searchResults.innerHTML = '<p>Nothing Found !</p>';
        return;
      }

      data.forEach((value, index) => {
        if (index > 0) {
          searchResults.innerHTML += "<hr>";
        }
        searchResults.innerHTML += `<a href="/home" class="text-decoration-none">${value.name}</a>`
      })
      return;
    })
}

if (search !== null) {
  search.addEventListener("keyup", function () {
    sendData(this);
  })
}

function updateCart(pizza) {
  axios.post('/home/update-cart',
    // Your data to be sent in the request body
    pizza
  )
    .then(res => {
      console.log("axios.post() response - ", res);
      cartCounter.innerText = res.data.totalQty;

      // Display notification notyfy.type[success]
      notyf.open({
        type: 'success',
        message: 'item added to the cart'
      });
    })
    .catch((err) => {
      // Display notification notyfy.type[error]
      notyf.open({
        type: 'error',
        message: 'something went wrong'
      });
    })
}


addToCart.forEach((btn) => {
  console.log(btn);
  btn.addEventListener("click", (e) => {
    let pizza = JSON.parse(btn.dataset.pizza);
    // console.log(pizza);
    updateCart(pizza)
  })
});

//to remove notification of order placed in orders.ejs
const alertMsg = document.getElementById("success-alert");
if (alertMsg) {
  setTimeout(() => {
    alertMsg.remove();
  }, 2000);
};


const allStatus = document.querySelectorAll(".status_line");
const hiddenInput = document.querySelector('#hiddenInput');
let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order);
let time = document.createElement('small');

function updateStatus(order) {

  allStatus.forEach((status) => {
    status.classList.remove("step-completed");
    status.classList.remove("current");
  })

  let stepCompleted = true;

  allStatus.forEach((status) => {
    let orderStatus = status.dataset.status;

    if (stepCompleted) {
      status.classList.add('step-completed');
    }

    // console.log(orderStatus);
    if (orderStatus === order.status) {
      stepCompleted = false;
      time.innerText = moment(order.updatedAt).format("hh:mm A")
      status.appendChild(time);
      if (status.nextElementSibling) {
        status.nextElementSibling.classList.add('current');
      }
    }
  });

}

updateStatus(order)

initStripe()


//socket io
let socket = io();


//Join
if (order) {
  socket.emit("join", `order_${order._id}`);
  console.log("room joined - ", order._id);

}

let adminAreaPath = window.location.pathname;
if (adminAreaPath.includes("admin")) {
  initAdmin(socket);
  socket.emit("join", 'adminRoom')
}


//socket
socket.on("orderUpdated", (data) => {
  const updatedOrder = { ...order };
  updatedOrder.updatedAt = moment().format();
  updatedOrder.status = data.status;
  updateStatus(updatedOrder);

  notyf.open({
    type: 'success',
    message: 'Status updated !'
  });
})