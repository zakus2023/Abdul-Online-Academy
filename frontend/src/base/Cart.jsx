import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";

import apiInstance from "../utils/axios";
import CartId from "../views/plugin/CartId";
import Toast from "../views/plugin/Toast";

import { CartContext } from "../views/plugin/Context";
import GetCurrentAddress from "../views/plugin/UserCountry";
import UserData from "../views/plugin/UserData";

function Cart() {
  const [cart, setcart] = useState([]);
  const [cartStats, setCartStats] = useState([]);

  const [cartCount, setCartCount] = useContext(CartContext);

  const country = GetCurrentAddress().country; // This also means you are calling address.country since the function is returning adddress
  const user_id = UserData()?.user_id; // This also means you are calling decoded.country since the function is returning decoded

  const navigate = useNavigate();

  const [bioData, setBioData] = useState({
    full_name: "",
    email: "",
    country: "",
  });

  const handleBioDataChange = (e) => {
    setBioData({
      ...bioData,
      [e.target.name]: e.target.value,
    });
  };

  const createOrder = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("full_name", bioData.full_name);
    formData.append("email", bioData.email);
    formData.append("country", country);
    formData.append("cart_id", CartId());
    formData.append("user_id", user_id);

    await apiInstance.post(`order/create-order/`, formData).then((res) => {
      
      navigate(`/checkout/${res.data.order_id}`);
    });

    Toast().fire({
      title: "Thank you",
      text: "Order created Successfully",
      icon: "success",
      timer: 3000,
      timerProgressBar: true,
    });
  };

  const fetchcartItems = async () => {
    await apiInstance.get(`course/cart-list/${CartId()}/`).then((res) => {
      setcart(res.data);
    });

    await apiInstance.get(`cart/stats/${CartId()}/`).then((res) => {
      setCartStats(res.data);
    });
  };

  useEffect(() => {
    fetchcartItems();
  }, []);

  const cartItemDelete = async (item_id) => {
    await apiInstance
      .delete(`course/delete-cart-item/${CartId()}/${item_id}/`)
      .then((res) => {
      
        fetchcartItems();
        Toast().fire({
          title: "Item Deleted Successfully",
          icon: "success",
          timer: 3000,
          timerProgressBar: true,
        });

        // set cart count as soon as you delete the cart item

        apiInstance.get(`course/cart-list/${CartId()}/`).then((res) => {
          setCartCount(res.data?.length);
        });
      });
  };

  return (
    <>
      <BaseHeader />

      <section className="py-0">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="bg-light p-4 text-center rounded-3">
                <h1 className="m-0">My cart</h1>
                {/* Breadcrumb */}
                <div className="d-flex justify-content-center">
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb breadcrumb-dots mb-0">
                      <li className="breadcrumb-item">
                        <a href="#" className="text-decoration-none text-dark">
                          Home
                        </a>
                      </li>
                      <li className="breadcrumb-item">
                        <a href="#" className="text-decoration-none text-dark">
                          Courses
                        </a>
                      </li>
                      <li
                        className="breadcrumb-item active"
                        aria-current="page"
                      >
                        Cart
                      </li>
                    </ol>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-5">
        <div className="container">
          <form onSubmit={createOrder}>
            <div className="row g-4 g-sm-5">
              {/* Main content START */}
              <div className="col-lg-8 mb-4 mb-sm-0">
                <div className="p-4 shadow rounded-3">
                  <h5 className="mb-0 mb-3">Cart Items ({cart?.length})</h5>

                  <div className="table-responsive border-0 rounded-3">
                    <table className="table align-middle p-4 mb-0">
                      <tbody className="border-top-2">
                        {cart.length > 0 ? (
                          <>
                            {cart &&
                              cart.map((cartitem, index) => (
                                <tr>
                                  <td>
                                    <div className="d-lg-flex align-items-center">
                                      <div className="w-100px w-md-80px mb-2 mb-md-0">
                                        <img
                                          src={cartitem.course.image}
                                          style={{
                                            width: "100px",
                                            height: "70px",
                                            objectFit: "cover",
                                          }}
                                          className="rounded"
                                          alt=""
                                        />
                                      </div>
                                      <h6 className="mb-0 ms-lg-3 mt-2 mt-lg-0">
                                        <a
                                          href="#"
                                          className="text-decoration-none text-dark"
                                        >
                                          {cartitem.course.title}
                                        </a>
                                      </h6>
                                    </div>
                                  </td>
                                  <td className="text-center">
                                    <h5 className="text-success mb-0">
                                      {cartitem.course.price}
                                    </h5>
                                  </td>
                                  <td>
                                    <button
                                      className="btn btn-sm btn-danger px-2 mb-0"
                                      onClick={() =>
                                        cartItemDelete(cartitem.id)
                                      }
                                      type="button"
                                    >
                                      <i className="fas fa-fw fa-times" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </>
                        ) : (
                          <>
                            <tr>
                              <td>
                                <div className="d-lg-flex align-items-center">
                                  <h6 className="mb-0 ms-lg-3 mt-2 mt-lg-0">
                                    <a
                                      href="#"
                                      className="text-decoration-none text-dark"
                                    >
                                      Sorry you have no items in your cart this
                                      time
                                    </a>
                                  </h6>
                                </div>
                              </td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Personal info START */}
                <div className="shadow p-4 rounded-3 mt-5">
                  {/* Title */}
                  <h5 className="mb-0">Personal Details</h5>
                  {/* Form START */}
                  <div className="row g-3 mt-0">
                    {/* Name */}
                    <div className="col-md-12 bg-light-input">
                      <label htmlFor="yourName" className="form-label">
                        Your name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="yourName"
                        placeholder="Name"
                        name="full_name"
                        onChange={handleBioDataChange}
                        value={bioData.full_name}
                      />
                    </div>
                    {/* Email */}
                    <div className="col-md-12 bg-light-input">
                      <label htmlFor="emailInput" className="form-label">
                        Email address *
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="emailInput"
                        placeholder="Email"
                        name="email"
                        onChange={handleBioDataChange}
                        value={bioData.email}
                      />
                    </div>

                    {/* Country option */}
                    <div className="col-md-12 bg-light-input">
                      <label htmlFor="mobileNumber" className="form-label">
                        Select country *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="mobileNumber"
                        placeholder="Country"
                        name="country"
                        onChange={handleBioDataChange}
                        value={country}
                      />
                    </div>
                  </div>
                  {/* Form END */}
                </div>
              </div>

              <div className="col-lg-4">
                <div className="p-4 shadow rounded-3">
                  <h4 className="mb-3">Cart Total</h4>
                  <ul class="list-group mb-3">
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      Sub Total
                      <span>
                        $
                        {cartStats && cartStats.price !== undefined
                          ? cartStats.price.toFixed(2)
                          : "0.00"}
                      </span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      Tax
                      <span>
                        $
                        {cartStats && cartStats.tax !== undefined
                          ? cartStats.tax.toFixed(2)
                          : "0.00"}
                      </span>
                    </li>
                    <li class="list-group-item d-flex fw-bold justify-content-between align-items-center">
                      Total
                      <span className="fw-bold">
                        $
                        {cartStats && cartStats.total !== undefined
                          ? cartStats.total.toFixed(2)
                          : "0.00"}
                      </span>
                    </li>
                  </ul>
                  <div className="d-grid">
                    <button type="submit" className="btn btn-lg btn-success">
                      Proceed to Checkout
                    </button>
                  </div>
                  <p className="small mb-0 mt-2 text-center">
                    By proceeding to checkout, you agree to these{" "}
                    <a href="#">
                      {" "}
                      <strong>Terms of Service</strong>
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      <BaseFooter />
    </>
  );
}

export default Cart;
