const OrderModel = require("../../../models/orderModel");
const moment = require('moment');
const UserModel = require("../../../models/userModel");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

class OrderController {

  //stores order in OrderModel
  static store = async (req, res) => {
    try {
      // Validate request
      const { phoneNumber, address, stripeToken, paymentType } = req.body
      if (!phoneNumber || !address || !paymentType) {
        return res.status(422).json({ message: 'All fields are required' });
      }

      const order = new OrderModel({
        customerID: req.user._id,
        items: req.session.cart.items,
        phoneNumber,
        address,
        paymentType
      })

      // let orderRecevied = await order.save();
      // console.log('orderRecevied - ', orderRecevied)

      let orderRecevied = '';

      if (paymentType !== 'Choose Option' && phoneNumber && address) {
        console.log(paymentType, phoneNumber, address)
        orderRecevied = await order.save();
        console.log('orderRecevied - ', orderRecevied)
      } else {
        return res.status(422).json({ message: 'All fields are required' });
      }

      if (!orderRecevied) {
        console.log("1.order.save error - ", orderRecevied);
        return res.status(500).json({ message: 'Something went wrong' });
      }

      let orderPopulate = await order.populate({ path: "customerID" });
      if (!orderPopulate) {
        console.log("2.order.populate error - ", orderPopulate);
        return res.json(500).json({ message: "Something went wrong" });
      }

      // Stripe payment
      if (paymentType === "CRD") {

        const cartOrder = req.session.cart.items

        let orderData = ""

        for (let key in cartOrder) {
          orderData += `${cartOrder[key].item.name} =`
        }

        //getting user data
        const customerData = await UserModel.findOne({ _id: req.user._id })


        const stripeCustomer = await stripe.customers.create({
          name: `${customerData.firstname} ${customerData.lastname}`,
          address: {
            line1: '510 Townsend St',
            postal_code: '98140',
            city: 'San Francisco',
            state: 'CA',
            country: 'US',
          }
        });

        const makePayment = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          customer: stripeCustomer.id,
          line_items: [{
            price_data: {
              currency: "inr",
              product_data: {
                name: orderData,
                description: `Order ID ${orderPopulate._id}`
              },
              unit_amount: req.session.cart.totalPrice * 100,
            },
            quantity: req.session.cart.totalQty,
          }],
          mode: "payment",
          success_url: "http://localhost:3000/home/orders",
          cancel_url: "http://localhost:3000/home"
        })



        if (!makePayment) {
          orderRecevied.paymentStatus = false;
          console.log("payment method failed")
          return res.json({ message: "Transaction: failed, Pay on delivery !" });
        }

        orderRecevied.paymentStatus = true;
        let orderComplete = await orderRecevied.save();

        if (!orderComplete) {
          delete req.session.cart;
          res.json({ message: "Payment failed, pay on delivery !" });
        }

        const eventEmitter = req.app.get('eventEmitter');
        eventEmitter.emit("orderPlaced", orderComplete);

        delete req.session.cart;
        return res.json({ message: "Payment Successful !", url: makePayment.url })
      }

      delete req.session.cart;
      return res.json({ message: "COD - Order Successful !" })


    } catch (error) {
      res.status(500).json({ message: "Something went wrong" })
    }
  }

  //get all orders from OrderModel
  static getOrders = async (req, res) => {
    try {

      const orders = await OrderModel.find({ customerID: req.user._id },
        null,
        { sort: { "createdAt": -1 } }
      );

      res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')

      // console.log(orders);


      res.render("customers/orders", { orders: orders, moment: moment });

    } catch (error) {
      console.log('error.name - ', error.name);
      console.log('error.message - ', error.message);
      res.status(500).send({
        success: false,
        message: "Error in getOrders API"
      })
    }
  }

  //show order status
  static showOrderStatus = async (req, res) => {
    try {

      const { id } = req.params;
      const order = await OrderModel.findById({ _id: id });

      //authorize user first, bcuz only authenticated user could access his order status not others
      if (req.user._id.toString() === order.customerID.toString()) {
        return res.render("customers/singleOrder", { order })
      }
      res.redirect("/home")

    } catch (error) {
      console.log('error.name - ', error.name);
      console.log('error.message - ', error.message);
      res.status(500).send({
        success: false,
        message: "Error in showOrderStatus API"
      })
    }
  }



}

module.exports = OrderController;