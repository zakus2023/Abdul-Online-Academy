import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import apiInstance from "../utils/axios";

import { CartContext } from "../views/plugin/Context";
import CartId from "../views/plugin/CartId";

import paid from '../assets/image/paid.gif'

function Success() {
  const [order, setOrder] = useState([]);
  const [orderMessage, setOrderMessage] = useState("");
  console.log(orderMessage);

  const param = useParams(); // this will be used to grab the param (/order_id)

  const queryString = new URLSearchParams(window.location.search); // This will be used to grab the query string (/?session_id and other paypal info)

  const session_id = queryString.get("session_id"); // get the stripe session id from the query string (fro stripe)

  const paypalOrderId = queryString.get("paypal_order_id"); //get the paypal order id from the query string for paypal

  const [cartCount, setCartCount] = useContext(CartContext);

  useEffect(() => {
    // Use this to fetch the cart items so that we reset the cart count after payment success
    const fetchCartItems = async () => {
      const res = await apiInstance.get(`course/cart-list/${CartId()}/`);
      setCartCount(res.data?.length);
    };

    const processPayment = async () => {
      const formData = new FormData();
      formData.append("order_id", param.order_id);
      formData.append("session_id", session_id);
      formData.append("paypal_order_id", paypalOrderId);

      try {
        setOrderMessage("Processing Payment");
        const res = await apiInstance.post(
          `payment/payment-success/`,
          formData
        );

        // call the function to reset the cart count after payment success
        fetchCartItems();
        // Remove __paypal_storage__ and randomString from local storage
        if (res.data.message === "Payment successfull") {
          setOrderMessage(res.data.message);
          console.log(res.data.message);
          // Payment was successful, so clear specific local storage items
          localStorage.removeItem("__paypal_storage__");
          localStorage.removeItem("randomString");

          // Optionally, you can clear the entire local storage if needed
          // localStorage.clear();
        } else {
          //   pass
        }
        setOrderMessage(res.data.message);
      } catch (error) {
        console.log(error);
        setOrderMessage(res.data.message);
      }
    };

    processPayment();
  }, [param.order_id, session_id, paypalOrderId]);

  return (
    <>
      <BaseHeader />

      <section className="pt-0  position-relative overflow-hidden my-auto">
        <div className="container position-relative">
          <div className="row g-5 align-items-center justify-content-center">
            {orderMessage === "Payment successful" && (
              <>
                {/* Payment successfull */}
                <div className="col-lg-5">
                  <h1 className="text-success">Payment Successful!</h1>
                  <p>
                    {" "}
                    Hey there, your enrollment was successful, visit your{" "}
                    <a href="">My Courses</a> page, to view the courses now.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary mb-0 rounded-2"
                  >
                    View Enrolled Courses <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
                <div className="col-lg-7 text-center">
                  <img
                    src={paid}
                    className="h-300px h-sm-400px h-md-500px h-xl-700px"
                    alt=""
                  />
                </div>
              </>
            )}

            {orderMessage ===
              "You have already made the payment. Thank you!" && (
              <>
                {/* Payment successfull */}
                <div className="col-lg-5">
                  <h1 className="text-success">You have paid already!</h1>
                  <p>
                    {" "}
                    Hey there, your enrollment was successful, visit your{" "}
                    <a href="">My Courses</a> page, to view the courses now.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary mb-0 rounded-2"
                  >
                    View Enrolled Courses <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
                <div className="col-lg-7 text-center">
                  <img
                    src={paid}
                    className="h-300px h-sm-400px h-md-500px h-xl-700px"
                    alt=""
                  />
                </div>
              </>
            )}

            {/* Processing */}
            {orderMessage === "Processing Payment" && (
              <>
                <div className="col-lg-5">
                  <h1 className="text-warning">
                    Processing Payment{" "}
                    <i className="fas fa-spinner fa-spin"></i>
                  </h1>
                  <p>
                    {" "}
                    Hey there, hold on while we process your payment, please do
                    not leave the page.
                  </p>
                </div>
                <div className="col-lg-7 text-center">
                  <img
                    sty
                    src="https://www.icegif.com/wp-content/uploads/2023/07/icegif-1259.gif"
                    className="h-300px h-sm-400px h-md-500px h-xl-700px"
                    alt=""
                  />
                </div>
              </>
            )}

            {/* Failed */}
            {orderMessage === "Payment could not be completed" && (
              <>
                <div className="col-lg-5">
                  <h1 className="text-danger">Payment Failed 😔</h1>
                  <p>
                    Unfortunately, phew! Your payment did not go through. <br />{" "}
                    Please try again.
                  </p>
                  <button
                    type="button"
                    className="btn btn-danger mb-0 rounded-2"
                  >
                    Try again <i className="fas fa-repeat"></i>
                  </button>
                </div>
                <div className="col-lg-7 text-center">
                  <img
                    sty
                    src="https://media3.giphy.com/media/h4OGa0npayrJX2NRPT/giphy.gif?cid=790b76117pc6298jypyph0liy6xlp3lzb7b2y405ixesujeu&ep=v1_stickers_search&rid=giphy.gif&ct=e"
                    className="h-300px h-sm-400px h-md-500px h-xl-700px"
                    alt=""
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <BaseFooter />
    </>
  );
}

export default Success;
