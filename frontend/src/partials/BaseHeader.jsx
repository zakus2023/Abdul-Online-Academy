import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/image/logo.png";

import { CartContext, TeacherNotificationContext } from "../views/plugin/Context";
import { useContext } from "react";
import { useAuthStore } from "../store/auth";
import Swal from "sweetalert2";
import UserData from "../views/plugin/UserData";
import useAxios from "../utils/useAxios";

function BaseHeader() {

  // I added this here after working on the notification.jsx
  const [hasUnreadNoti, setHasUnreadNoti] = useContext(TeacherNotificationContext);
 

  const fetchNotifications = async () => {
    const res = await useAxios().get(
      `teacher/list-notifications/${UserData()?.teacher_id}/`
    );
   
    setHasUnreadNoti(res.data)
  };

  useEffect(() => {
    fetchNotifications();
  }, []);


  // =========================================================

  const [cartCount, setCartCount] = useContext(CartContext);
  // ========================================================
  const [isLoggedIn, user] = useAuthStore((state) => [
    state.isLoggedIn,
    state.user,
  ]);

  const loggedIn = isLoggedIn();
  const currentUser = user();

  // ========================

  const navigate = useNavigate()

  const tryLogOut = () => {
    Swal.fire({
      title: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout!",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/logout/')
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Toast().fire({
          title: "You are still logged in",
          icon: "info",
          timer: 3000,
          timerProgressBar: true,
        });
      }
    });
  };

  return (
    <div>
      <nav
        className="navbar navbar-expand-lg bg-body-tertiary"
        data-bs-theme="dark"
      >
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img src={logo} alt="" width="90px" />
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/pages/contact-us/">
                  {" "}
                  <i className="fas fa-phone"></i> Contact Us
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/pages/about-us/">
                  <i className="fas fa-address-card"></i> About Us
                </Link>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fas fa-chalkboard-user"></i> Instructor
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      className="dropdown-item"
                      to={`/instructor/dashboard/`}
                    >
                      <i className="bi bi-grid-fill"></i> Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to={`/instructor/courses/`}>
                      <i className="fas fa-shopping-cart"></i> My Courses
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to={`/instructor/create-course/`}
                    >
                      <i className="fas fa-plus"></i> Create Course
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to={`/instructor/reviews/`}>
                      <i className="fas fa-star"></i> Reviews{" "}
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to={`/instructor/question-answer/`}
                    >
                      <i className="fas fa-envelope"></i> Q/A{" "}
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to={`/instructor/students/`}
                    >
                      <i className="fas fa-users"></i> Students{" "}
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to={`/instructor/earning/`}>
                      <i className="fas fa-dollar-sign"></i> Earning{" "}
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to={`/instructor/profile/`}>
                      <i className="fas fa-gear"></i> Settings & Profile{" "}
                    </Link>
                  </li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fas fa-graduation-cap"></i> Student
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to={`/student/dashboard/`}>
                      {" "}
                      <i className="bi bi-grid-fill"></i> Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to={`/student/courses/`}>
                      {" "}
                      <i className="fas fa-shopping-cart"></i>My Courses
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to={`/student/wishlist/`}>
                      {" "}
                      <i className="fas fa-heart"></i> Wishlist{" "}
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to={`/student/question-answer/`}
                    >
                      {" "}
                      <i className="fas fa-envelope"></i> Q/A{" "}
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to={`/student/profile/`}>
                      {" "}
                      <i className="fas fa-gear"></i> Profile & Settings
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
            <form className="d-flex" role="search">
              <input
                className="form-control me-2 w-100"
                type="search"
                placeholder="Search Courses"
                aria-label="Search Courses"
              />
              <button className="btn btn-outline-success w-50" type="submit">
                Search <i className="fas fa-search"></i>
              </button>
            </form>
            {loggedIn ? (
              <>
              {/* changed this to button and added a function above to confirm checkout */}
                <button
                  onClick={tryLogOut}
                  className="btn btn-primary ms-2"
                  type="submit"
                >
                  Logout <i className="fas fa-sign-in-alt"></i>
                </button>

                <Link className="btn btn-success ms-2" to="/cart/">
                  Cart ({cartCount}) <i className="fas fa-shopping-cart"> </i>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login/"
                  className="btn btn-primary ms-2"
                  type="submit"
                >
                  Login <i className="fas fa-sign-in-alt"></i>
                </Link>
                <Link
                  to="/register/"
                  className="btn btn-primary ms-2"
                  type="submit"
                >
                  Register <i className="fas fa-user-plus"> </i>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default BaseHeader;
