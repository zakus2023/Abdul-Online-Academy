import React, { useEffect, useState } from "react";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import useAxios from "../utils/useAxios";
import UserData from "../views/plugin/UserData";
import moment from "moment/moment";
import Toast from "../views/plugin/Toast";

function Review() {
  const [reviews, setReviews] = useState([]);
  const [reply, setReply] = useState("");
  const [filteredReviews, setFilteredReviews] = useState([]);

  //   fetch reviews
  const fetchReviews = async () => {
    const res = await useAxios().get(
      `teacher/review-list/${UserData()?.teacher_id}/`
    );
    setReviews(res.data);
    setFilteredReviews(res.data);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  //   send reply

  const sendReply = async (review_id) => {
    const formdata = new FormData();
    formdata.append("reply", reply);
    try {
      const response = await useAxios().patch(
        `teacher/review-detail/${UserData()?.teacher_id}/${review_id}/`,
        formdata
      );
      console.log(response.data);
      Toast().fire({
        title: "Reply sent",
        icon: "success",
        timer: 3000,
        timerProgressBar: true,
      });
      fetchReviews();
      setReply("");
    } catch (error) {
      console.log(error);
    }
  };

  //   filter reviews based on rating

  const filterByRatingOnChange = (e) => {
    const rating = parseInt(e.target.value);

    if (rating === 0) {
      fetchReviews();
    } else {
      const filtered = reviews.filter((review) => review.rating === rating);
      setFilteredReviews(filtered);
    }
  };

//   filter based on date or created

const filterByDateOnChange = (e)=>{
    const createdAt = e.target.value
    let sortedReviews = [...filteredReviews]
    if(createdAt === "Newest"){
        sortedReviews.sort((a, b)=> new Date(b.date)-new Date(a.date))
    }else{
        sortedReviews.sort((a, b)=> new date(b.date)-new Date(a.date))
    }
    setFilteredReviews(sortedReviews)
}

// filter by course
const searchByCourseOnChange = (e)=>{
    const query = e.target.value.toLowerCase()
    if(query === ""){
        fetchReviews()
    }else{
        const filtered = reviews.filter((review)=>{
            return review.course.title.toLowerCase().includes(query)
        })
        setFilteredReviews(filtered)
    }
}


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
              {/* Card */}
              <div className="card mb-4">
                {/* Card header */}
                <div className="card-header d-lg-flex align-items-center justify-content-between">
                  <div className="mb-3 mb-lg-0">
                    <h3 className="mb-0">Reviews</h3>
                    <span>
                      You have full control to manage your own account setting.
                    </span>
                  </div>
                </div>
                {/* Card body */}
                <div className="card-body">
                  {/* Form */}
                  <form className="row mb-4 gx-2">
                    <div className="col-xl-7 col-lg-6 col-md-4 col-12 mb-2 mb-lg-0">
                      <input type="text" className="form-control" placeholder="Search by Course" onChange={searchByCourseOnChange}/>
                    </div>
                    <div className="col-xl-2 col-lg-2 col-md-4 col-12 mb-2 mb-lg-0">
                      {/* Custom select */}
                      <select
                        className="form-select"
                        onChange={filterByRatingOnChange}
                      >
                        <option value={0}>Rating</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                      </select>
                    </div>
                    <div className="col-xl-3 col-lg-3 col-md-4 col-12 mb-2 mb-lg-0">
                      {/* Custom select */}
                      <select className="form-select" onChange={filterByDateOnChange}>
                        <option value="">Sort by</option>
                        <option value="Newest">Newest</option>
                        <option value="Oldest">Oldest</option>
                      </select>
                    </div>
                  </form>
                  {/* List group */}
                  <ul className="list-group list-group-flush">
                    {/* List group item */}
                    {filteredReviews?.map((review, index) => (
                      <li
                        className="list-group-item p-4 shadow rounded-3"
                        key={index}
                      >
                        <div className="d-flex">
                          <img
                            src={review.profile.image}
                            alt="avatar"
                            className="rounded-circle avatar-lg"
                            style={{
                              width: "70px",
                              height: "70px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                          <div className="ms-3 mt-2">
                            <div className="d-flex align-items-center justify-content-between">
                              <div>
                                <h4 className="mb-0">
                                  {review.profile.full_name}
                                </h4>
                                <span>
                                  {moment(review.date).format("DD MM YYYY")}
                                </span>
                              </div>
                              <div>
                                <a
                                  href="#"
                                  data-bs-toggle="tooltip"
                                  data-placement="top"
                                  title="Report Abuse"
                                >
                                  <i className="fe fe-flag" />
                                </a>
                              </div>
                            </div>
                            <div className="mt-2">
                              {[...Array(5)].map((_, index) => (
                                <span
                                  className="fs-6 me-1 align-top"
                                  key={index}
                                >
                                  <i
                                    className={
                                      index < review.rating
                                        ? "fas fa-star text-warning"
                                        : "far fa-star text-warning"
                                    }
                                  />
                                </span>
                              ))}

                              <span className="me-1">for</span>
                              <span className="h5">{review.course.title}</span>
                              <p className="mt-2">
                                <span className="fw-bold me-2">
                                  Review <i className="fas fa-arrow-right"></i>
                                </span>
                                {review.review}
                              </p>
                              <p className="mt-2">
                                <span className="fw-bold me-2">
                                  Response{" "}
                                  <i className="fas fa-arrow-right"></i>
                                </span>
                                {review.reply || "No reply"}
                              </p>
                              <p>
                                <button
                                  class="btn btn-outline-secondary"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target={`#collapse${review.id}`}
                                  aria-expanded="false"
                                  aria-controls={`collapse${review.id}`}
                                >
                                  Send Response
                                </button>
                              </p>
                              <div class="collapse" id={`collapse${review.id}`}>
                                <div class="card card-body">
                                  <div>
                                    <div class="mb-3">
                                      <label
                                        for="exampleInputEmail1"
                                        class="form-label"
                                      >
                                        Write Response
                                      </label>
                                      <textarea
                                        name=""
                                        id=""
                                        cols="30"
                                        className="form-control"
                                        rows="4"
                                        onChange={(e) =>
                                          setReply(e.target.value)
                                        }
                                        value={reply}
                                      ></textarea>
                                    </div>

                                    <button
                                      type="submit"
                                      class="btn btn-primary"
                                      onClick={() => sendReply(review.id)}
                                    >
                                      Send Response{" "}
                                      <i className="fas fa-paper-plane"> </i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                    {filteredReviews < 1 && "You have no reviews"}
                    <p className="ms-4"></p>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BaseFooter />
    </>
  );
}

export default Review;
