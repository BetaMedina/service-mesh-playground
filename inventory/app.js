const express = require('express');
const INVENTORY_DB = require('./inventory.json')
const client = require('prom-client');
const PORT_CONSTANT = 8010;

const app = express();
const router = express.Router();
client.collectDefaultMetrics();


router.use(function (req, res, next) {
  res.set('Content-Type', 'application/json');
  console.log("New request receiveid on inventory api")
  next();
});

router.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  const output = await client.register.metrics()
  res.json(output);
});

router.get('/products/:id', async (req, res) => {
  const inventory = INVENTORY_DB.find(res => +res.skuId === +req.params.id)
  return res.status(200).json({ inventory })
});
app.use(router)
app.listen(PORT_CONSTANT, function () {
  console.log(`Example app listening on port ${PORT_CONSTANT}!`)
})
