const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/webp" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

const Product = require("../models/product");
const checkAuth = require("../middleware/check-auth");

//GET
router.get("/", checkAuth, (req, res, next) => {
  Product.find()
    .select("name price _id productImage")
    .exec()
    .then((result) => {
      console.log(result);
      const response = {
        count: result.length,
        product: result.map((doc) => {
          return {
            name: doc.name,
            price: doc.price,
            _id: doc._id,
            productImage: doc.productImage,
            request: {
              type: "GET",
              URL: "localhost/3000" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
    });
});

//POST
router.post("/", checkAuth, upload.single("productImage"), (req, res, next) => {
  // console.log(req.file);
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path,
  });
  product
    .save()
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });
  res.status(200).json({ message: "i am post", createproducts: product });
});

//GET BY ID
router.get("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .select("name price _id productImage")
    .exec()
    .then((doc) => {
      console.log(doc);
      if (doc) {
        res.status(200).json({
          product: doc,
          requested: {
            type: "GET",
            URL: "localhost:3000",
          },
        });
      } else {
        res.status(404).json({ messgae: "no valid ID" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ error: err });
    });
});

//PATHCH
router.patch("/:id", checkAuth, async (req, res, next) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json({ message: updatedProduct });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

//DELTE
router.delete("/:productId", checkAuth, (req, res, next) => {
  Product.deleteOne({ _id: req.params.productId })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({ message: "FIle deleted successfully" });
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});

module.exports = router;
