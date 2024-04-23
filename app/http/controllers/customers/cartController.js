const cartController = async (req, res) => {
  try {

    res.render("customers/cart");

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Cart controller",
      errorName: error.name,
      errorMsg: error.message
    })
  }
};

const updateCart = async (req, res) => {
  try {
    // let cart = {
    //   items: {
    //     pizzaId: { item: pizzaObject, qty: 0 },
    //     totalQty: 0,
    //     totalPrice: 0
    //   }
    // }

    //for first time creating cart and adding basic object structure

    if (!req.session.cart) {
      req.session.cart = {
        items: {
          pizzaId: {},
        },
        totalQty: 0,
        totalPrice: 0
      }
    }

    const cart = req.session.cart;

    if (!cart.items[req.body._id]) {
      cart.items[req.body._id] = {
        item: req.body,
        qty: 1
      },
        cart.totalQty = cart.totalQty + 1,
        cart.totalPrice = cart.totalPrice + req.body.price

    } else {
      cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1;
      cart.totalQty = cart.totalQty + 1;
      cart.totalPrice = cart.totalPrice + req.body.price
    }

    console.log('session created - ', req.session.cart);


    delete cart.items['pizzaId'];
    // console.log(cart);
    // for (let pizza of Object.values(cart.items)) {
    //   console.log(typeof (pizza));
    //   if (pizza.item!==undefined) {
    //     console.log(pizza.item);
    //     console.log(pizza.item.image);
    //   } else {
    //     continue
    //   }
    // }

    return res.json({
      totalQty: req.session.cart.totalQty,
      data: cart,
    })

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update cart",
      errorName: error.name,
      errorMsg: error.message
    })
  }
}

//cancel order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const orderData = req.session.cart;

    const PizzaPrice = req.session.cart.items[id].item.price;
    const PizzaQty = req.session.cart.items[id].qty;

    orderData.totalPrice = orderData.totalPrice - (PizzaPrice * PizzaQty);
    orderData.totalQty = orderData.totalQty - PizzaQty;

    delete orderData.items[id];

    if (orderData.totalPrice === orderData.totalQty) {
      delete req.session.cart;
    }

    res.redirect('/home/cart')

  } catch (error) {
    console.log('error.name - ', error.name);
    console.log('error.message - ', error.message);
    res.status(500).send({
      success: false,
      message: "Error in showOrderStatus API"
    })
  }
}

module.exports = { cartController, updateCart, cancelOrder };