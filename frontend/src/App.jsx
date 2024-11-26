import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainWrapper from "./layouts/MainWrapper";
import PrivateRoutes from "./layouts/PrivateRoutes";
import Register from "./views/Register";
import Login from "./views/Login";
import Logout from "./views/Logout";
import ForgotPassword from "./views/ForgotPassword";
import CreateNewPassword from "./views/CreateNewPassword";
import Index from "./base/Index";
import StudentCourseDetail from "./student/CourseDetail";
import CourseDetail from "./base/CourseDetail";
import Cart from "./base/Cart";
import Checkout from "./base/Checkout";

import {
  CartContext,
  ProfileContext,
  TeacherNotificationContext,
} from "./views/plugin/Context";
import { useContext, useEffect, useState } from "react";
import apiInstance from "./utils/axios";
import CartId from "./views/plugin/CartId";
import Success from "./base/Success";
import Search from "./base/Search";
import Dashboard from "./student/Dashboard";
import Courses from "./student/Courses";
import Wishlist from "./student/Wishlist";
import Profile from "./student/Profile";
import useAxios from "./utils/useAxios";
import UserData from "./views/plugin/UserData";
import ChangePassword from "./student/ChangePassword";
import QA from "./student/QA";
import QADetail from "./student/QADetail";
import Review from "./instructor/Review";
import Students from "./instructor/Students";
import CourseCreate from "./instructor/CourseCreate";
import TeacherCourses from "./instructor/Courses";
import TeacherDashboard from "./instructor/Dashboard";
import Earning from "./instructor/Earning";
import TeacherOrders from "./instructor/Orders";
import TeacherQA from "./instructor/QA";
import Coupon from "./instructor/Coupon";
import TeacherNotification from "./instructor/TeacherNotification";
import TeacherProfile from "./instructor/Profile";
import TeacherChangePassword from "./instructor/ChangePassword";
import CourseEdit from "./instructor/CourseEdit";

function App() {
  // fetch the teacher Notification

  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    const res = await useAxios().get(
      `teacher/list-notifications/${UserData()?.teacher_id}/`
    );
    setNotifications(res.data);
  };

  // Fetch the profile of a user
  // get the cart profile here so that you can dispaly it anywhere in the app. After this wrap the routes with the profileContext as below

  const [profile, setProfile] = useState({});

  const fetchProfile = async () => {
    const res = await useAxios().get(`user/profile/${UserData()?.user_id}/`);
    setProfile(res.data);
  };

  // get the cart count here so that you can dispaly it anywhere in the app. After this wrap the routes with the cartContext as below
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    apiInstance.get(`course/cart-list/${CartId()}/`).then((res) => {
      setCartCount(res.data?.length);
    });
    fetchProfile();
    fetchNotifications();
  }, []);

  return (
    <CartContext.Provider value={[cartCount, setCartCount]}>
      <ProfileContext.Provider value={[profile, setProfile]}>
        <TeacherNotificationContext.Provider value={[notifications, setNotifications]}>
          <BrowserRouter>
            <MainWrapper>
              <Routes>
                {/* Auth Routes */}
                <Route path="/register/" element={<Register />} />
                <Route path="/login/" element={<Login />} />
                <Route path="/logout/" element={<Logout />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/create-new-password/"
                  element={<CreateNewPassword />}
                />
                <Route path="/course-detail/:slug" element={<CourseDetail />} />

                {/* Base Routes */}

                <Route path="/" element={<Index />} />
                <Route path="/cart/" element={<Cart />} />
                <Route path="/checkout/:order_id/" element={<Checkout />} />
                <Route
                  path="/payment-success/:order_id"
                  element={<Success />}
                />
                <Route path="/search/" element={<Search />} />

                {/* Student Routes */}
                <Route path="/student/dashboard/" element={<Dashboard />} />
                <Route path="/student/courses/" element={<Courses />} />
                <Route
                  path="/student/courses/:enrollment_id/"
                  element={<StudentCourseDetail />}
                />
                <Route path="/student/wishlist/" element={<Wishlist />} />
                <Route path="/student/profile/" element={<Profile />} />
                <Route
                  path="/student/change-password/"
                  element={<ChangePassword />}
                />
                <Route path="/student/question-answer/" element={<QA />} />
                <Route
                  path="/student/question-answer/:enrollment_id/"
                  element={<QADetail />}
                />

                {/* Instructor Routes */}

                <Route path="/instructor/reviews/" element={<Review />} />
                <Route path="/instructor/students/" element={<Students />} />
                <Route
                  path="/instructor/create-course/"
                  element={<CourseCreate />}
                />
                <Route
                  path="/instructor/courses/"
                  element={<TeacherCourses />}
                />
                <Route
                  path="/instructor/dashboard/"
                  element={<TeacherDashboard />}
                />
                <Route path="/instructor/earning/" element={<Earning />} />
                <Route path="/instructor/orders/" element={<TeacherOrders />} />
                <Route
                  path="/instructor/question-answer/"
                  element={<TeacherQA />}
                />
                <Route path="/instructor/coupon/" element={<Coupon />} />
                <Route
                  path="/instructor/notifications/"
                  element={<TeacherNotification />}
                />
                <Route path="/instructor/profile/" element={<TeacherProfile/>}/>
                <Route path="/instructor/change-password/" element={<TeacherChangePassword/>}/>
                <Route path="/teacher-course-edit/:course_id" element={<CourseEdit/>}/>
              </Routes>
            </MainWrapper>
          </BrowserRouter>
        </TeacherNotificationContext.Provider>
      </ProfileContext.Provider>
    </CartContext.Provider>
  );
}

export default App;
