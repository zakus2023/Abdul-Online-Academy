import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../utils/useAxios";
import UserData from "../views/plugin/UserData";
import CartId from "../views/plugin/CartId";
import Toast from "../views/plugin/Toast";
import { CartContext } from "../views/plugin/Context";
import Rater from "react-rater";
import GetCurrentAddress from "../views/plugin/UserCountry";

function Wishlist() {
  const [wishList, setWishList] = useState([]);
  const [cartCount, setCartCount] = useContext(CartContext);
  const country = GetCurrentAddress().country;
  const user_id = UserData()?.user_id;


  // function for pagination here

  // define the items per page

  // Number of items to display per page
  const itemsPerPage = 3;

  // State to keep track of the current page number, initialized to 1
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate the index of the last item on the current page
  // e.g., if itemsPerPage = 2 and currentPage = 1, indexOfLastItem = 2
  const indexOfLastItem = currentPage * itemsPerPage;

  // Calculate the index of the first item on the current page
  // e.g., if itemsPerPage = 2 and indexOfLastItem = 2, indexOfFirstItem = 0
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Get the current items to display on the page by slicing the 'courses' array
  // The slice() method extracts items from indexOfFirstItem up to (but not including) indexOfLastItem
  // This gives the items for the current page
  const currentItems = wishList.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate the total number of pages by dividing the total number of items by itemsPerPage
  // Use Math.ceil() to round up to account for any remainder
  // e.g., if courses.length = 5 and itemsPerPage = 2, totalPages will be 3
  const totalPages = Math.ceil(wishList.length / itemsPerPage);

  // Create an array with page numbers from 1 up to totalPages
  // Array.from() generates an array of specified length (totalPages), then maps each element to its index + 1
  // This array is used to display page numbers for navigation
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  // add to wishlist function

  const addToWishList = async (course_id) => {
    const formData = new FormData();
    formData.append("course_id", course_id);
    formData.append("user_id", UserData()?.user_id);

    const res = await useAxios().post(
      `student/wishlist/${UserData()?.user_id}/`,
      formData
    );
    fetchWishList();
    Toast().fire({
      title: res.data.message,
      icon: "success",
      timer: 3000,
      timerProgressBar: true,
    });
    console.log(res.data);
  };

  // Fetch wishlist

  const fetchWishList = async () => {
    const res = await useAxios().get(
      `student/wishlist/${UserData()?.user_id}/`
    );
    setWishList(res.data);
  };

  useEffect(() => {
    fetchWishList();
  }, [UserData()?.user_id]);


// add to cart
  
  const addToCart = async (course_id, user_id, price, country, cart_id) => {
    const formData = new FormData();
    formData.append("course_id", course_id);
    formData.append("user_id", user_id);
    formData.append("price", price);
    formData.append("country_name", country);
    formData.append("cart_id", cart_id);

    try {
      await useAxios()
        .post(`course/cart/`, formData)
        .then((res) => {});

        // Add this to delete the wish list whenever you add it to the cart
        addToWishList(course_id)

      Toast().fire({
        title: "Thank you",
        text: "Item added to cart",
        icon: "success",
        timer: 3000,
        timerProgressBar: true,
      });

      //   set cart count after adding to cart

      useAxios()
        .get(`course/cart-list/${CartId()}/`)
        .then((res) => {
          setCartCount(res.data?.length);
        });
    } catch (error) {
      console.log(error);
    }
  };




  return (
    <>
      <BaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          {/* Header Here */}
          <Header />
          <div className="row mt-0 mt-md-4">
            {/* Sidebar Here */}
            <Sidebar />

            <div className="col-lg-9 col-md-8 col-12">
              <h4 className="mb-0 mb-4">
                {" "}
                <i className="fas fa-heart"></i> Wishlist{" "}
              </h4>
              {wishList?.length > 0 ? (
                <div className="row">
                  <div className="col-md-12">
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                      {wishList?.map((w, index) => (
                        <div className="col col-lg-4" key={index}>
                          {/* Card */}
                          <div className="card card-hover">
                            <Link to={`/course-detail/${w.course.slug}/`}>
                              <img
                                src={w.course.image}
                                alt="course"
                                className="card-img-top"
                                style={{
                                  width: "100%",
                                  height: "200px",
                                  objectFit: "cover",
                                }}
                              />
                            </Link>
                            {/* Card Body */}
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                  <span className="badge bg-info">
                                    {w.course.level}
                                  </span>
                                  <span className="badge bg-success ms-2">
                                    {w.course.language}
                                  </span>
                                </div>
                                <button
                                  className="fs-5 "
                                  onClick={() =>
                                    addToWishList(w.course.course_id)
                                  }
                                >
                                  <i className="fas fa-heart text-danger align-middle" />
                                </button>
                              </div>
                              <h4 className="mb-2 text-truncate-line-2 ">
                                <Link
                                  to={`/course-detail/${w.course.slug}/`}
                                  className="text-inherit text-decoration-none text-dark fs-5"
                                >
                                  {w.course.title}
                                </Link>
                              </h4>
                              <small>By: {w.course.teacher.full_name}</small>{" "}
                              <br />
                              <small>
                                {w.course.students?.length} Student
                                {w.course.students?.length > 1 && "s"}
                              </small>{" "}
                              <br />
                              <div className="lh-1 mt-3 d-flex">
                                <span className="align-text-top">
                                  <span className="fs-6">
                                    {/* for the stars we must import the Rater and 'react-rater/lib/react-rater.css'. make sure you install react-rater: npm install react-rater */}
                                    <Rater
                                      total={5}
                                      rating={w.course.average_rating || 0}
                                    />
                                  </span>
                                </span>
                                <span className="text-warning">
                                  {w.course.rating_count}
                                </span>
                                <span className="fs-6 ms-2">
                                  {w.course.reviews?.length} Review
                                  {w.course.reviews?.length > 1 && "s"}
                                </span>
                              </div>
                            </div>
                            {/* Card Footer */}
                            <div className="card-footer">
                              <div className="row align-items-center g-0">
                                <div className="col">
                                  <h5 className="mb-0">${w.course.price}</h5>
                                </div>
                                <div className="col-auto">
                                  <button
                                    type="button"
                                    className="text-inherit text-decoration-none btn btn-primary me-2"
                                    onClick={() =>
                                      addToCart(
                                        w.course.course_id,
                                        user_id,
                                        w.course.price,
                                        country,
                                        CartId()
                                      )
                                    }
                                  >
                                    <i className="fas fa-shopping-cart text-primary text-white" />
                                  </button>
                                  <Link
                                    to={""}
                                    className="text-inherit text-decoration-none btn btn-primary"
                                  >
                                    Enroll Now{" "}
                                    <i className="fas fa-arrow-right text-primary align-middle me-2 text-white" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="ms-5">You have no items in your wishlist</p>
              )}

              {/* Pagination buttons */}
              {wishList?.length > 1 && (
                <nav className="d-flex mt-5">
                  <ul className="pagination">
                    <li
                      className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link me-1 "
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        <i className="ci-arrow-left me-2" />
                        Previous
                      </button>
                    </li>
                  </ul>
                  <ul className="pagination">
                    {pageNumbers?.map((number) => (
                      <li
                        key={number}
                        className={`page-item ${currentPage === number ? "active" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(number)}
                        >
                          {number}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <ul className="pagination">
                    <li
                      className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link ms-1"
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                        <i className="ci-arrow-right ms-3" />
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </section>

      <BaseFooter />
    </>
  );
}

export default Wishlist;
