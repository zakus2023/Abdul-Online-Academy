import React, { useContext, useEffect, useState } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import { Link } from "react-router-dom";
import apiInstance from "../utils/axios";
import useAxios from "../utils/useAxios";

// for the stars we must import the following. make sure you install react-rater: npm install react-rater
import Rater from "react-rater";
import "react-rater/lib/react-rater.css";
import { CartContext } from "../views/plugin/Context";
import CartId from "../views/plugin/CartId";
import GetCurrentAddress from "../views/plugin/UserCountry";
import UserData from "../views/plugin/UserData";
import Toast from "../views/plugin/Toast";

function Search() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [cartCount, setCartCount] = useContext(CartContext);

  const country = GetCurrentAddress().country; // This also means you are calling address.country since the function is returning adddress
  const user_id = UserData()?.user_id; // This also means you are calling decoded.country since the function is returning decoded

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

  const fetchCourse = async () => {
    setIsLoading(true);
    try {
      const res = await useAxios().get(`/course/course-list/`);

      setCourses(res.data); // Update course state with the fetched data
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false); // Ensure loading state is turned off regardless of success or failure
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  // Function to search items here

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();

    setSearchQuery(query);

    if (query === "") {
      fetchCourse();
    } else {
      const course = courses.filter((course) => {
        return course.title.toLowerCase().includes(query);
      });
      setCourses(course);
    }
  };

  // function for pagination here

  // define the items per page

  // Number of items to display per page
  const itemsPerPage = 2;

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
  const currentItems = courses.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate the total number of pages by dividing the total number of items by itemsPerPage
  // Use Math.ceil() to round up to account for any remainder
  // e.g., if courses.length = 5 and itemsPerPage = 2, totalPages will be 3
  const totalPages = Math.ceil(courses.length / itemsPerPage);

  // Create an array with page numbers from 1 up to totalPages
  // Array.from() generates an array of specified length (totalPages), then maps each element to its index + 1
  // This array is used to display page numbers for navigation
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  return (
    <>
      <BaseHeader />

      <section className="mb-5" style={{ marginTop: "100px" }}>
        <div className="container mb-lg-8 ">
          <div className="row mb-5 mt-3">
            {/* col */}
            <div className="col-12">
              <div className="mb-6">
                <h2 className="mb-1 h1">
                  Showing results for "{searchQuery || "No search query"}"
                </h2>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <input
                  type="text"
                  className="form-control lg mt-3"
                  placeholder="Search Courses..."
                  name=""
                  id=""
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                {currentItems?.map((course, index) => (
                  <div className="col">
                    {/* Card */}
                    <div className="card card-hover">
                      <Link to={`/course-detail/${course.slug}/`}>
                        <img
                          src={course.image}
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
                              {course.level}
                            </span>
                            <span className="badge bg-success ms-2">
                              {course.language}
                            </span>
                          </div>
                          <a href="#" className="fs-5">
                            <i className="fas fa-heart text-danger align-middle" />
                          </a>
                        </div>
                        <h4 className="mb-2 text-truncate-line-2 ">
                          <Link
                            to={`/course-detail/${course.slug}/`}
                            className="text-inherit text-decoration-none text-dark fs-5"
                          >
                            {course.title}
                          </Link>
                        </h4>
                        <small>By: {course.teacher.full_name}</small> <br />
                        <small>
                          {course.students.length} Student
                          {course.students?.length > 1 && "s"}
                        </small>{" "}
                        <br />
                        <div className="lh-1 mt-3 d-flex">
                          <span className="align-text-top">
                            <span className="fs-6">
                              {/* for the stars we must import the Rater and 'react-rater/lib/react-rater.css'. make sure you install react-rater: npm install react-rater */}
                              <Rater
                                total={5}
                                rating={course.average_rating || 0}
                              />
                            </span>
                          </span>
                          <span className="text-warning">
                            {course.rating_count}
                          </span>
                          <span className="fs-6 ms-2">
                            {course.reviews?.length} Review
                            {course.reviews?.length > 1 && "s"}
                          </span>
                        </div>
                      </div>
                      {/* Card Footer */}
                      <div className="card-footer">
                        <div className="row align-items-center g-0">
                          <div className="col">
                            <h5 className="mb-0">${course.price}</h5>
                          </div>
                          <div className="col-auto">
                            <button
                              type="button"
                              className="text-inherit text-decoration-none btn btn-primary me-2"
                              onClick={() =>
                                addToCart(
                                  course.course_id,
                                  user_id,
                                  course.price,
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
            </div>
          </div>
        </div>
      </section>

      <section className="my-8 py-lg-8">
        {/* container */}
        <div className="container">
          {/* row */}
          <div className="row align-items-center bg-primary gx-0 rounded-3 mt-5">
            {/* col */}
            <div className="col-lg-6 col-12 d-none d-lg-block">
              <div className="d-flex justify-content-center pt-4">
                {/* img */}
                <div className="position-relative">
                  <img
                    src="https://geeksui.codescandy.com/geeks/assets/images/png/cta-instructor-1.png"
                    alt="image"
                    className="img-fluid mt-n8"
                  />
                  <div className="ms-n8 position-absolute bottom-0 start-0 mb-6">
                    <img
                      src="https://geeksui.codescandy.com/geeks/assets/images/svg/dollor.svg"
                      alt="dollor"
                    />
                  </div>
                  {/* img */}
                  <div className="me-n4 position-absolute top-0 end-0">
                    <img
                      src="https://geeksui.codescandy.com/geeks/assets/images/svg/graph.svg"
                      alt="graph"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5 col-12">
              <div className="text-white p-5 p-lg-0">
                {/* text */}
                <h2 className="h1 text-white">Become an instructor today</h2>
                <p className="mb-0">
                  Instructors from around the world teach millions of students
                  on Geeks. We provide the tools and skills to teach what you
                  love.
                </p>
                <a href="#" className="btn bg-white text-dark fw-bold mt-4">
                  Start Teaching Today <i className="fas fa-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BaseFooter />
    </>
  );
}

export default Search;
