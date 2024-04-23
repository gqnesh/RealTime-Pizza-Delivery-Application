const OrderModel = require("../../../models/orderModel");

class adminController {
  static getAllOrders = async (req, res) => {
    try {

      const orders = await OrderModel.find({
        status: { $ne: "completed" }
      },
        null,
        { sort: { "createdAt": -1 } }
      ).populate("customerID", "-password").exec();
      // so populate method is used to populate the specific path or field of orderModel or collection  i.e. customerID which is used to create relationship with UserModel or collection. So, instead of getting customer's id it will get whole document of that user id. 

      // if (!orders) {
      //   res.redirect("/home/orders");
      // }

      if (req.xhr) {
        return res.json(orders)
      } else {

        return res.render('admin/orders')
      }



    } catch (error) {
      console.log("error.name - ", error.name);
      console.log("error.message - ", error.message);
      console.log("error.message - ", error);
      res.status(500).send({
        success: false,
        message: "Error in Admin panel",
        errorName: error.name,
        errorMsg: error.message
      })
    }
  }

  //admin/order/status
  static updateOrderStatus = async (req, res) => {
    try {
      const updateStatus = await OrderModel.updateOne({ _id: req.body.orderId }, { status: req.body.status });
      if (!updateStatus) {
        return res.redirect("/home/admin/orders");
      }

      // emit event
      const eventEmitter = req.app.get("eventEmitter");

      eventEmitter.emit("orderUpdated", { id: req.body.orderId, status: req.body.status });
      // eventEmitter.on('orderUpdated', { id: req.body.orderId, status: req.body.status })
      return res.redirect("/home/admin/orders");

    } catch (error) {
      console.log("error.name - ", error.name);
      console.log("error.message - ", error.message);
      console.log("error.message - ", error);
      res.status(500).send({
        success: false,
        message: "Error in Order status controller",
        errorName: error.name,
        errorMsg: error.message
      })
    }
  }

}


module.exports = adminController;;