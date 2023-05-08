const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());

// middlewares
app.use(express.json({ extended: false }));

// route included
const paymentRouter = require('./routes/payment');
app.use('/payment', paymentRouter);

/*app.post("/submit-form", (req, res) => {
  const total = req.body.total;
  const num = parseInt(total.toString().replace(/[^\d.-]/g, ''));
  console.log(num);
});
*/
app.listen(port, () => console.log(`server started on port ${port}`));
