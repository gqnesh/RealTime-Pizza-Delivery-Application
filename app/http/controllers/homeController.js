const Menu = require("../../models/pizzaModel");

const homeController = async (req, res) => {
  const pizza = await Menu.find();

  // console.log(pizza);
  // console.log(req.session.count);
  const info = {
    data: pizza
  }
  res.render("home", info);
}

const searchPizza = async (req, res) => {
  const { payload } = req.body;

  let searchFood = await Menu.find({ name: { $regex: new RegExp('^' + payload + '.*', 'i') } });

  data = searchFood.slice(0, 10);

  res.status(200).json({
    data: data
  })

}

module.exports = { homeController, searchPizza };