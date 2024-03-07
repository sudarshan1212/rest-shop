const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Order = require("../models/model");
const Product = require("../models/product");
const checkAuth = require("../middleware/check-auth");

router.get("/", checkAuth, (req, res, next) => {
  Order.find()
    .select("product quantity _id")
    .populate("product", "name")
    .exec()
    .then((result) => {
      res.status(200).json({
        count: result.length,
        orders: result.map((result) => {
          return {
            _id: result._id,
            productId: result.product,
            quantity: result.quantity,
            request: {
              type: "GET",
              url: "http://localhost:3000/orders/" + result._id,
            },
          };
        }),
      });
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});

router.post("/", checkAuth, (req, res, next) => {
  Product.findById(req.body.productId)
    .then((result) => {
      if (!result) {
        res.status(400).json({ messgae: "product not found" });
      }
      const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId,
      });
      return order.save();
    })
    .then((result) => {
      console.log(result);
      res.status(200).json({
        createorder: {
          _id: result._id,
          productId: result.product,
          quantity: result.quantity,
        },
        request: {
          type: "GET",
          url: "http://localhost:3000/orders/" + result._id,
        },
      });
    })
    .catch((err) => {});
});

router.get("/:orderId", checkAuth, (req, res, next) => {
  Order.findById(req.params.orderId)
    .populate("product")
    .exec()
    .then((result) => {
      res.status(200).json({
        order: result,
        requested: {
          TYPE: "GET",
          URL: "localhost/3000/" + req.params.orderId,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});
router.delete("/:orderId", checkAuth, (req, res, next) => {
  Order.deleteOne({ _id: req.params.orderId })
    .exec()
    .then((result) => {
      res.status(200).json({
        messgage: "order deleted" + req.params.orderId,
        requested: {
          TYPE: "GET",
          URL: "localhost/3000/" + req.params.orderId,
        },
      });
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});

module.exports = router;
