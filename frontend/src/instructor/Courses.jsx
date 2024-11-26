import React, { useEffect, useState } from "react";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import { Link } from "react-router-dom";
import useAxios from "../utils/useAxios";
import UserData from "../views/plugin/UserData";
import moment from "moment";

function TeacherCourses() {
  const [courses, setCourses] = useState([]);

  const fetchCourses = async () => {
    const res = await useAxios().get(
      `teacher/course-list/${UserData()?.teacher_id}/`
    );
    setCourses(res.data);
    
  };

  useEffect(() => {
    fetchCourses();
  }, [UserData()?.teacher_id]);

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
              <div className="row mb-4">
                <h4 className="mb-0 mb-2 mt-4">
                  {" "}
                  <i className="bi bi-grid-fill"></i> Courses
                </h4>
              </div>
              <div className="card mb-4">
                <div className="card-header">
                  <span>
                    Manage your courses from here, earch, view, edit or delete
                    courses.
                  </span>
                </div>
                <div className="card-body">
                  <form className="row gx-3">
                    <div className="col-lg-12 col-md-12 col-12 mb-lg-0 mb-2">
                      <input
                        type="search"
                        className="form-control"
                        placeholder="Search Your Courses"
                      />
                    </div>
                  </form>
                </div>
                <div className="table-responsive overflow-y-hidden">
                  <table className="table mb-0 text-nowrap table-hover table-centered text-nowrap">
                    <thead className="table-light">
                      <tr>
                        <th>Courses</th>
                        <th>Enrolled</th>
                        <th>Level</th>
                        <th>Status</th>
                        <th>Platform Status</th>
                        <th>Action</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {courses?.map((course, index) => (
                        <tr>
                          <td>
                            <div className="d-flex align-items-center">
                              <div>
                                <a href="#">
                                  <img
                                    src={course.image}
                                    alt="course"
                                    className="rounded img-4by3-lg"
                                    style={{
                                      width: "100px",
                                      height: "70px",
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                    }}
                                  />
                                </a>
                              </div>
                              <div className="ms-3">
                                <h4 className="mb-1 h6">
                                  <a
                                    href="#"
                                    className="text-inherit text-decoration-none text-dark"
                                  >
                                    {course.title}
                                  </a>
                                </h4>
                                <ul className="list-inline fs-6 mb-0">
                                  <li className="list-inline-item">
                                    <small>
                                      <i className="bi bi-clock-history"></i>
                                      <span className="ms-1">
                                        {moment(course.date).format(
                                          "DD-MM-YYYY"
                                        )}
                                      </span>
                                    </small>
                                  </li>
                                  <li className="list-inline-item">
                                    <small>
                                      <i className="bi bi-reception-4"></i>
                                      <span className="ms-1">
                                        {course.language}
                                      </span>
                                    </small>
                                  </li>
                                  <li className="list-inline-item">
                                    <small>
                                      <i className="fas fa-dollar-sign"></i>
                                      <span>{course.price}</span>
                                    </small>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </td>
                          <td>
                            <p className="mt-3">{course.students.length}</p>
                          </td>
                          <td>
                            <p className="mt-3 badge bg-success">
                              {course.level}
                            </p>
                          </td>
                          <td>
                            <p className="mt-3 badge bg-warning text-dark">
                              {course.teacher_course_status}
                            </p>
                          </td>
                          <td>
                            <p className="mt-3 badge bg-warning text-dark">
                              {course.platform_course_status}
                            </p>
                          </td>
                          <td>
                            <Link
                              to={`/teacher-course-edit/${course.course_id}`}
                            >
                              <button className="btn btn-primary btn-sm mt-3 me-1">
                                <i className="fas fa-edit"></i>
                              </button>
                            </Link>
                            <Link>
                              <button className="btn btn-danger btn-sm mt-3 me-1">
                                <i className="fas fa-trash"></i>
                              </button>
                            </Link>
                            <Link>
                              <button className="btn btn-secondary btn-sm mt-3 me-1">
                                <i className="fas fa-eye"></i>
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

export default TeacherCourses;
