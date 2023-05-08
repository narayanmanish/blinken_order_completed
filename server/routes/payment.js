require("dotenv").config();
var crypto = require("crypto");
const express = require("express");
const Razorpay = require("razorpay");

const router = express.Router();

router.post("/orders", async (req, res) => {
  try {
    let instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    // var total = req.body.total;
    // const num = parseInt(total.toString().replace(/[^\d.-]/g, ''));

    //const total = req.body.displayTotalAmount;
    // const amountInPaise = Math.round(total * 100);
    //const total=100;
    //total = req.body.displayTotalAmount;
    var options = {
      amount: req.body.amount * 100, // amount in smallest currency unit
      currency: "INR",
    };

    //console.log(total);

    const order = await instance.orders.create(options, function (err, order) {
      if (err) {
        return res.send({ code: 500, message: "Server Err." });
      }
      return res.send({ code: 200, message: "order created", data: order });
    });

    //     console.log(order)
    //     if (!order) return res.status(500).send("Some error occured");

    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/success", async (req, res) => {
  let body = req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;

  var expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === req.body.response.razorpay_signature){
    res.send({ code: 200 , message: 'Sign Valid'});
  }
  else{
    res.send({ code: 200 , message: 'Sign Invalid'});
  }
});

module.exports = router;
