const express = require('express');
const { homeController, searchPizza } = require('../app/http/controllers/homeController.js');
const { register, login, registerPage, loginPage, logoutController } = require('../app/http/controllers/authController.js');
const { cartController, updateCart, cancelOrder } = require('../app/http/controllers/customers/cartController.js');
const passportInit = require('../app/config/passport.js');
const OrderController = require('../app/http/controllers/customers/orderController.js');
const adminController = require('../app/http/controllers/admin/adminController.js');
const router = express.Router();
//middlewares

const guest = require('../app/http/middlewares/guest.js');
const admin = require('../app/http/middlewares/admin.js');
const auth = require('../app/http/middlewares/auth.js');
const passport = require('passport');

//public Routes

//home page
router.get('/', homeController);

//search pizza
router.post('/search', searchPizza);

//cart
router.get('/cart', cartController);
router.post('/update-cart', updateCart)

//regitser
router.get('/register', guest, registerPage);
router.post('/register', register)

//login
router.get('/login', guest, loginPage);
router.post('/login', login);


// private Routes

//orders
router.post('/orders', auth, OrderController.store);
router.get('/orders', auth, OrderController.getOrders);
router.get('/orders/:id', auth, OrderController.showOrderStatus);
router.post('/order/:id', auth, cancelOrder);



//logout
router.post('/logout', auth, logoutController);

//admin route
router.get('/admin/orders', admin, adminController.getAllOrders);
router.post('/admin/order/status', admin, adminController.updateOrderStatus);


module.exports = router;