import { loadStripe } from '@stripe/stripe-js';
import placeOrder from './apiService';
import CardWidget from './StripeWidget';

async function initStripe() {

  //The loadStripe function asynchronously loads the Stripe.js script and initializes a Stripe object.Pass the returned Promise to Elements.
  const stripe = await loadStripe('pk_test_51Ol887SGEuxa69uO2xAlSkWbhzNFlLJ97HVIpnBnsoqKQNtd5SAvsJrakScwss71bKRVKfEHZGP1aoSTxQO25emG00jurEBcK8');

  // What is the difference between Stripe checkout and Stripe elements?
  // Payment Element allows you to collect any information you need during checkout and design the experience you want.On the other hand, Stripe Checkout is our fully hosted payment page that also makes it easy to offer LPMs(25 +) which your site would redirect to, but comes with limited styling options(color / logo).


  /*
   
  Elements features include:
  
    Automatic input formatting as customers type
    Complete UI translations to match your customer’s preferred language
    Responsive design to fit seamlessly on any screen size
    Custom styling rules so you can match the look and feel of your site
    One-click checkout with Link
    
  */
  let card = null;

  function mountWidget() {

    let style = {
      base: {
        color: '#32325d',
        // fontWeight: '500',
        fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
        fontSize: '16px',
        fontSmoothing: 'antialiased',
        ':-webkit-autofill': {
          color: '#fce883',
        },
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        iconColor: '#fa755a',
        color: '#fa755a',
      }
    }

    const elements = stripe.elements()
    // pass argument to see what kind of widget we want for ex. 'card'
    card = elements.create('card', { style: style, hidePostalCode: true })
    // The element.mount method attaches your Element to the DOM. element.mount accepts either a CSS Selector (e.g., '#card-element') or a DOM element.
    // You need to create a container DOM element to mount an Element.If the container DOM element has a label, the Element is automatically focused when its label is clicked.There are two ways to do this:
    // if (document.getElementById('card-element')) {
    card.mount("#card-element");
    // }

  }


  const paymentMethod = document.getElementById("payment_type");

  if (!paymentMethod) {
    console.log(paymentMethod)
    return
  }

  paymentMethod.addEventListener('change', (e) => {
    console.log(e.currentTarget.value);
    if (e.target.value === "CRD") {
      // console.log("CRD");
      // mountWidget()
      card = new CardWidget(stripe);
      card.mount()
    } else {
      // console.log("COD")
      card.destroy();
    }
  })



  // Ajax for payment-form in cart.ejs
  const paymentForm = document.getElementById("payment_form");
  if (paymentForm) {
    paymentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      // console.log(e.srcElement[0].value);
      console.log(e);
      let formData = new FormData(paymentForm);
      let formObject = {}

      // console.log(formData.entries());

      for (let [key, value] of formData.entries()) {
        console.log(key, value);
        formObject[key] = value;

      }

      if (!card) {
        console.log('COD - ', formObject)
        placeOrder(formObject);
        // return;
      }

      //verify card details

      const token = await card.createToken();
      formObject.stripeToken = token.id
      placeOrder(formObject);


      // stripe.createToken(card)
      //   .then((result) => {
      //     // console.log(result)
      //     formObject.stripeToken = result.token.id
      //     console.log('token.id - ', result.token.id)
      //     placeOrder(formObject);
      //   })
      //   .catch((error) => {
      //     console.log(error)
      //   })


    })
  }

}

export default initStripe;