const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/user");
const jwt = require("jsonwebtoken");
const user = require("../models/user");

router.post("/signup", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((result) => {
      if (result.length >= 1) {
        res.status(409).json({ message: "eamil already login" });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            res.status(400).json({ error: err });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
            });
            user
              .save()
              .then((result) => {
                res.status(201).json(result);
              })
              .catch((err) => {
                res.status(400).json({ error: err });
              });
          }
        });
      }
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});

router.post("/login", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((result) => {
      if (result.length < 1) {
        res.status(400).json({ message: "auth failed" });
      }
      bcrypt.compare(req.body.password, result[0].password, (err, users) => {
        if (err) {
          console.log(err);
          return res.status(400).json({ message: "auth failed" });
        }
        if (users) {
          const token = jwt.sign(
            {
              email: result[0].email,
              userId: result[0]._id,
            },
            process.env.ACCESS_TOKEN_SERVER,
            {
              expiresIn: "1hr",
            }
          );
          return res.status(200).json({ message: "auth sucess",token:token });
        } else {
          res.status(400).json({ message: "Auth failed" });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ error: err });
    });
});

router.delete("/:userId", (req, res, next) => {
  User.deleteOne({ _id: req.params.userId })
    .exec()
    .then((result) => {
      res.status(200).json({ message: "FIle deleted successfully" });
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});

module.exports = router;
