class CardWidget {
  stripe = null;
  card = null;
  style = {
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

  constructor(stripe) {
    this.stripe = stripe;
  }

  mount() {

    const elements = this.stripe.elements()

    // pass argument to see what kind of widget we want for ex. 'card'
    this.card = elements.create('card', { style: this.style, hidePostalCode: true })

    // The element.mount method attaches your Element to the DOM. element.mount accepts either a CSS Selector (e.g., '#card-element') or a DOM element.
    // You need to create a container DOM element to mount an Element.If the container DOM element has a label, the Element is automatically focused when its label is clicked.There are two ways to do this:
    // if (document.getElementById('card-element')) {
    this.card.mount("#card-element");
    // }

  }

  destroy() {
    this.card.destroy();
  }

  async createToken() {

    //verify card details
    const result = await this.stripe.createToken(this.card);
    return result.token;
    
    // .then((result) => {
    //   // console.log(result)
    //   formObject.stripeToken = result.token.id
    //   console.log('token.id - ', result.token.id)
    //   placeOrder(formObject);
    // })
    // .catch((error) => {
    //   console.log(error)
    // })
  }
}

export default CardWidget;