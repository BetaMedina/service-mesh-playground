const express = require('express');
const PRODUCTS_DB = require('./products.json')
const client = require('prom-client');
const PORT_CONSTANT = 9000;

const app = express();
const router = express.Router();
client.collectDefaultMetrics();


router.use(function (req, res, next) {
  res.set('Content-Type', 'application/json');
  console.log("New request receiveid on products api")
  next();
});

router.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  const output = await client.register.metrics()
  res.json(output);
});

router.get('/products/:id', async (req, res) => {
  const product = PRODUCTS_DB.find(res => +res.id === +req.params.id)
  return res.status(200).json({ product })
});
app.use(router)
app.listen(PORT_CONSTANT, function () {
  console.log(`Example app listening on port ${PORT_CONSTANT}!`)
})
