const express = require('express');
const PRICES_DB = require('./prices.json')
const client = require('prom-client');
const PORT_CONSTANT = 8000;

const app = express();
const router = express.Router();
client.collectDefaultMetrics();


router.use(function (req, res, next) {
  res.set('Content-Type', 'application/json');
  console.log("New request receiveid on price api")
  next();
});

router.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  const output = await client.register.metrics()
  res.json(output);
});

router.get('/health', async (req, res) => {
  return res.status(200).json({ status: 'UP', message: 'Order service is up and running', deployColor: `I'm a ${process.env.DEPLOYMENT_COLOR} color` });
})

router.get('/products/:id', async (req, res) => {
  const response = PRICES_DB.find(res => +res.skuId === +req.params.id)
  return res.status(200).json({ prices: response })
});
app.use(router)
app.listen(PORT_CONSTANT, function () {
  console.log(`Example app listening on port ${PORT_CONSTANT}!`)
})
