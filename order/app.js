const express = require('express');
const client = require('prom-client');
const app = express();
const router = express.Router();
client.collectDefaultMetrics();

const PORT_CONSTANT = 8080;
const PRODUCT_URL_CONSTANT = process.env.PRODUCT_URL || 'http://127.0.0.1:9000'
const INVENTORY_URL_CONSTANT = process.env.INVENTORY_URL || 'http://127.0.0.1:8010'
const PRICE_URL_CONSTANT = process.env.PRICE_URL || 'http://127.0.0.1:8000'

router.use(function (req, res, next) {
  res.set('Content-Type', 'application/json')
  console.log("New request receiveid")
  next();
});

router.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  const output = await client.register.metrics()
  return res.status(200).json(output);
});

router.get('/health', async (req, res) => {
  return res.status(200).json({ status: 'UP', message: 'Order service is up and running', deployColor: `I'm a ${process.env.DEPLOYMENT_COLOR} color` });
})

router.get('/fullfilment/:id', async (req, res) => {
  const [productResponse, inventoryResponse, priceResponse] = await Promise.all([
    fetch(`${PRODUCT_URL_CONSTANT}/products/${req.params.id}`, {
      method: "get",
      headers: { "Content-Type": "application/json" },
    }),
    fetch(`${INVENTORY_URL_CONSTANT}/products/${req.params.id}`, {
      method: "get",
      headers: { "Content-Type": "application/json" },
    }),
    fetch(`${PRICE_URL_CONSTANT}/products/${req.params.id}`, {
      method: "get",
      headers: { "Content-Type": "application/json" },
    }),
  ]);
  if (!productResponse.ok && inventoryResponse.ok && priceResponse.ok) return res.status(404).json({ offers: [] })
  const [{ product }, { prices: { de, por } }, { inventory: { inventory } }] = await Promise.all([productResponse.json(), priceResponse.json(), inventoryResponse.json()])
  return res.status(process.env.ERROR ? 500 : 200).json({
    ...product,
    quantity: inventory,
    maxPrice: de,
    minPrice: por
  })
});


app.use(router)
app.listen(PORT_CONSTANT, function () {
  console.log(`Example app listening on port ${PORT_CONSTANT}!`)
})
