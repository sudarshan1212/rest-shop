const express = require("express");
const app = express();
const dotenv = require("dotenv").config();

const morgan = require("morgan");
const bodyParser = require("body-parser");
// const mongoose = require('mongoose');

const productRouter = require("./api/routes/products");
const orderRouter = require("./api/routes/order");
const userRoutes=require('./api/routes/users')

const dbConnection = require("./config/dbConnection");
dbConnection();
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
// app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Orgin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Orgin,X-Requested-With,Content-Type,Accept,Authorization"
  );
  if (req.method == "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT,PATCH,POST,DELETE,GET");
    return res.status(200).json({});
  }
  next();
});

//ROutes which should handle the req
app.use("/orders", orderRouter);
app.use("/products", productRouter);
app.use("/user",userRoutes)

app.use((req, res, next) => {
  const error = new Error("not found");
  error.status = 400;
  next(error);
});
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
    },
  });
});

module.exports = app;
