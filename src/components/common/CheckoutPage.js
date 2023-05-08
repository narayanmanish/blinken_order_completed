import { getAuth } from "firebase/auth";
import { getDatabase, ref, push } from "firebase/database";
import { Box, Button, Center, Flex, Heading, Text } from "@chakra-ui/react";
import React, { useState, useContext } from "react";
import { calculateTotal, displayMoney } from "../../helpers/utils";
import { useNavigate } from "react-router-dom";
import "./CheckoutPage.css";
import man from "./Man.png";
import cartContext from "../../contexts/cart/cartContext";
import axios from "axios";
import useActive from '../../hooks/useActive';

const CheckoutPage = () => {
  const { active, handleActive, activeClass } = useActive(false);
  const [shippingData, setData] = useState({
    fullname: "",
    mobile: "",
    pincode: "",
    city: "",
    state: "",
    street: "",
  });
  const [isPaid, setIsPaid] = useState(false);
  const navigate = useNavigate();
  const [toggle, setToggle] = useState(true);
  const { cartItems } = useContext(cartContext);

  const handleToken = (token) => {
    // Send the token to your server to process the payment
    console.log(token);
    setIsPaid(true);
  };

  const cartTotal = cartItems.map((item) => {
    return item.originalPrice * item.quantity;
  });

  const calculateCartTotal = calculateTotal(cartTotal);
  //const displayCartTotal = displayMoney(calculateCartTotal);

  // total discount
  const cartDiscount = cartItems.map((item) => {
    return (item.originalPrice - item.finalPrice) * item.quantity;
  });

  const calculateCartDiscount = calculateTotal(cartDiscount);
  //const displayCartDiscount = displayMoney(calculateCartDiscount);

  // final total amount
  const totalAmount = calculateCartTotal - calculateCartDiscount;
  const displayTotalAmount = displayMoney(totalAmount);
  //console.log(displayTotalAmount)
  // const [total, setName] = useState(displayTotalAmount);

  const handleTotal = (event) => {
    event.preventDefault();

    axios
      .post("http://localhost:5000/payment/orders", { displayTotalAmount })
      .then((res) => {
        console.log(res.data);
      });
  };

  //console.log()

  //   function loadScript(src) {
  //     return new Promise((resolve) => {
  //       const script = document.createElement("script");
  //       script.src = src;
  //         script.onload = () => {
  //             resolve(true);
  //         };
  //         script.onerror = () => {
  //             resolve(false);
  //         };
  //         document.body.appendChild(script);
  //     });
  // }

  // const displayRazorpay = async () => {
  //     const res = await loadScript(
  //         "https://checkout.razorpay.com/v1/checkout.js"
  //     );

  //     if (!res) {
  //         alert("Razorpay SDK failed to load. Are you online?");
  //         return;
  //     }

  //     const result = await axios.post("http://localhost:5000/payment/orders");

  //     if (!result) {
  //         alert("Server error. Are you online?");
  //         return;
  //     }

  //     const { amount, id: order_id, currency } = result.data;
  //       //S console.log(result.data);
  //     const options = {
  //         key: "rzp_test_Au0EiglH164uQD", // Enter the Key ID generated from the Dashboard
  //         amount: amount,
  //         currency: currency,
  //         name: "Tech Team",
  //         description: "Test Transaction",
  //         image: {  },
  //         order_id: order_id,
  //         handler: async function (response) {
  //             const data = {
  //                 orderCreationId: order_id,
  //                 razorpayPaymentId: response.razorpay_payment_id,
  //                 razorpayOrderId: response.razorpay_order_id,
  //                 razorpaySignature: response.razorpay_signature,
  //             };

  //             const result = await axios.post("http://localhost:5000/payment/success", data);

  //             alert(result.data.msg);
  //         },
  //         prefill: {
  //             name: "Tech Team",
  //             email: "SoumyaDey@example.com",
  //             contact: "8707542956",
  //         },
  //         notes: {
  //             address: "Soumya Dey Corporate Office",
  //         },
  //         theme: {
  //             color: "#61dafb",
  //         },
  //     };
  // //console.log(options)
  //     const paymentObject = new window.Razorpay(options);
  //     paymentObject.open();
  // }

 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...shippingData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(shippingData);
      const auth = getAuth();
        const userId = auth.currentUser.uid;
        const database = getDatabase();
        //console.log(userId)
        const itemRef = ref(database, `users/${userId}/address`);
        push(itemRef, shippingData);

        setTimeout(() => {
            handleActive(false);
        }, 3000);
    setToggle(!toggle);
  };

  const getPincodeData = async (e) => {
    if (e.target.value.length === 6) {
      const resp = await fetch(
        `https://api.postalpincode.in/pincode/${e.target.value}`
      );
      const pinData = await resp.json();

      if (pinData[0].Status === "Success") {
        setData({
          ...shippingData,
          state: pinData[0].PostOffice[0].State,
          city: pinData[0].PostOffice[0].District,
          pincode: e.target.value,
        });
      } else if (pinData[0].Status !== "Success") {
        alert("Enter Correct PinCode");
        setData({
          ...shippingData,
          state: "",
          city: "",
          pincode: "",
        });
      }
    }
  };

  const handleOpenRazorpay = (data) => {
    const options = {
      key: "rzp_test_Au0EiglH164uQD",
      amount: data.amount,
      currency: data.currency,
      name: "BLINKEN",
      description: "XYZ",
      order_id: data.id,
      handler: function (response) {
        console.log(response, "34");
        axios
          .post("http://localhost:5000/payment/success", { response : response })
          .then((res) => {
            console.log(res, "37");
            if (res.status==200) {
              //after sucess payment

       // handleActive(id);

        const auth = getAuth();
        const userId = auth.currentUser.uid;
        const database = getDatabase();
        //console.log(userId)
        const itemRef = ref(database, `users/${userId}/cartItems`);
        push(itemRef, cartItems);

        setTimeout(() => {
            handleActive(false);
        }, 3000);
    // Redirect the user to the thank you page after payment is completed
    navigate("/ThankYouPage");
    return null;
  }
          })
          .catch((err) => {
            console.log(err);
          });
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePayment = (amount) => {
    const _data = { amount: amount };
    axios
      .post("http://localhost:5000/payment/orders", _data)
      .then((res) => {
        console.log(res.data, "29");
        handleOpenRazorpay(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <div className="maincheckdiv"></div>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          padding={"15px"}
          width={"70%"}
          marginTop={{ base: "60px", md: "90px", lg: "56px" }}
        >
          <Box>
            <Heading
              style={{ marginBottom: "50px", marginTop: "-60px" }}
              fontSize={{ base: "22px", md: "40px", lg: "30px" }}
            >
              {toggle ? "" : "Payment"}
            </Heading>
            <Text
              // borderBottom="1px solid green"
              width="fit-content"
              fontSize={{ base: "22px", md: "40px", lg: "30px" }}
              fontWeight={{ base: "600", md: "40px", lg: "56px" }}
              onClick={handleSubmit}
              cursor="pointer"
            >
              {toggle ? "" : "Edit Address"}
            </Text>
          </Box>
          <Box
            fontWeight={{ base: "600", md: "40px", lg: "56px" }}
            fontSize={{ base: "16", md: "26", lg: "26px" }}
          >
            {/* <Text>
            {toggle
              ? "Home Delivery"
              : `${shippingData.fullname},${shippingData.street} ${shippingData.city},${shippingData.state},${shippingData.pincode}`}
          </Text>
          <Text>
            {toggle
              ? "Get your product delivered to your Home"
              : `Mobile Number: +91${shippingData.mobile}`}
          </Text> */}
          </Box>
          <Box
            fontWeight={{ base: "600", md: "40px", lg: "56px" }}
            fontSize={{ base: "16", md: "26", lg: "26px" }}
          >
            <Text>
              {toggle
                ? ""
                : `${shippingData.fullname}, ${shippingData.street}, ${shippingData.city}, ${shippingData.state}, ${shippingData.pincode}`}
            </Text>
            <Text style={{ marginBottom: "50px" }}>
              {toggle ? "" : `Mobile Number: +91${shippingData.mobile}`}
            </Text>
          </Box>
          <Box
            display={{ base: "block", md: "flex", lg: "flex" }}
            width={"95%"}
            justifyContent={"space-between"}
            margin={"auto"}
          >
            {toggle ? (
              <Box width={{ base: "95%", md: "50%", lg: "60%" }}>
                {/* <Text
          textAlign={'center'}
                fontSize={{ base: "16", md: "26", lg: "25" }}
                //borderBottom="1px solid green"
                fontWeight={700}
              >
                Add new address
              </Text> */}

                <div className="Parent">
                  <div className="ImageDiv">
                    <img src={man}></img>
                  </div>
                  {cartItems.map((item) => (
                    <div className="product__detail" key={item.id}>
                      {item.quantity}
                      {item.title}
                      {item.finalPrice}
                    </div>
                  ))}
                  ;{console.log(cartItems)}
                  <div className="form-container">
                    <form onSubmit={handleSubmit}>
                      <div className="form-group">
                        <div className="form-field">
                          <input
                            type="text"
                            id="fullname"
                            name="fullname"
                            placeholder="Enter Your Name"
                            value={shippingData.fullname}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="form-field">
                          <input
                            type="number"
                            id="mobile"
                            name="mobile"
                            placeholder="Enter mobile Number"
                            value={shippingData.mobile}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="form-field">
                          <input
                            type="number"
                            id="pincode"
                            name="pincode"
                            placeholder="Enter Your Pincode"
                            disabled={false}
                            onChange={getPincodeData}
                            required
                          />
                        </div>
                        <div className="form-field">
                          <input
                            type="text"
                            id="city"
                            name="city"
                            placeholder="City"
                            readOnly
                            value={shippingData.city}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="form-field">
                          <input
                            type="text"
                            id="state"
                            name="state"
                            placeholder="State"
                            readOnly
                            value={shippingData.state}
                            required
                          />
                        </div>
                        <div className="form-field">
                          <input
                            type="text"
                            id="street"
                            name="street"
                            placeholder="Enter your Street Details"
                            onChange={handleChange}
                            value={shippingData.street}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <input
                          type="submit"
                          value="Continue"
                          className="submit-btn"
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </Box>
            ) : (
              <button
                className="App-link"
                onClick={() => handlePayment(displayTotalAmount)}
              >
                Pay Now <b>{displayTotalAmount}</b>
              </button>
            )}
          </Box>
        </Box>
      </div>
    </>
  );
};

export default CheckoutPage;
