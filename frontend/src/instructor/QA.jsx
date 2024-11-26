import React, { useEffect, useRef, useState } from "react";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import Modal from "react-bootstrap/Modal";

import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import { Link } from "react-router-dom";
import useAxios from "../utils/useAxios";
import UserData from "../views/plugin/UserData";
import moment from "moment/moment";

function TeacherQA() {

   // fetch the questions
   const [questions, setQuestions] = useState([]);
   const fetchQA = async () => {
     const res = await useAxios().get(
       `teacher/question-answer/${UserData()?.teacher_id}/`
     );
     setQuestions(res.data);
   };
   useEffect(() => {
     fetchQA();
   }, []);


  const lastElementRef = useRef();

  // Ask Question Modal/Answer Question
  const [createMessage, setCreateMessage] = useState({
    title: "",
    message: "",
  });
  const handleAskQuestionOnchange = (e) => {
    setCreateMessage({
      ...createMessage,
      [e.target.name]: e.target.value,
    });
  };

  // Conversation Accrodion
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [ConversationShow, setConversationShow] = useState(false);
  const handleConversationClose = () => setConversationShow(false);
  const handleConversationShow = (conversation) => {
    setConversationShow(true);
    setSelectedConversation(conversation);
  };

  const replyMessage = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("course_id", selectedConversation?.course);
    formData.append("user_id", UserData()?.user_id);
    formData.append("message", createMessage.message);
    formData.append("qa_id", selectedConversation?.qa_id);

    const res = await useAxios().post(
      `student/question-answer-message-send/`,
      formData
    );
    setSelectedConversation(res.data.question);
  };

  // Scroll to currentReply automatically
  const currentReplyRef = useRef();

  useEffect(() => {
    if (currentReplyRef.current) {
      currentReplyRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConversation]);

  // search questions

    const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();

    if (query === "") {
      fetchQA();
    } else {
      const question = questions?.filter((question) => {
        return question.title.toLowerCase().includes(query);
      });
      setQuestions(question);
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
              <h4 className="mb-0 mb-1">
                {" "}
                <i className="fas fa-envelope"></i> Question and Answer
              </h4>

              <div className="card">
                {/* Card header */}
                <div className="card-header border-bottom p-0 pb-3">
                  {/* Title */}
                  <h4 className="mb-3 p-3">Discussion</h4>
                  <form className="row g-4 p-3">
                    {/* Search */}
                    <div className="col-sm-12 col-lg-12">
                      <div className="position-relative">
                        <input
                          className="form-control pe-5 bg-transparent"
                          type="search"
                          placeholder="Search Questions"
                          aria-label="Search"
                          onChange={handleSearch}
                        />
                      </div>
                    </div>
                  </form>
                </div>
                {/* Card body */}
                {questions?.map((question, index) => (
                  <div className="card-body p-0 pt-3" key={index}>
                    <div className="vstack gap-3 p-3">
                      {/* Question item START */}
                      <div className="shadow rounded-3 p-3" key={1}>
                        <div className="d-sm-flex justify-content-sm-between mb-3">
                          <div className="d-flex align-items-center">
                            <div className="avatar avatar-sm flex-shrink-0">
                              <img
                                src={question.profile.image}
                                className="avatar-img rounded-circle"
                                alt="avatar"
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                            <div className="ms-2">
                              <h6 className="mb-0">
                                <a
                                  href="#"
                                  className="text-decoration-none text-dark"
                                >
                                  {question.profile.full_name} 
                                  
                                </a>
                              </h6>
                              <small>
                                {moment(question.date).format("DD-MMM-YYYY")}
                              </small>
                            </div>
                          </div>
                        </div>
                        <h5>
                          {question.title} {""}
                          <span className="badge bg-success">
                            {question.messages?.length}
                          </span>
                        </h5>

                        <button
                          className="btn btn-primary btn-sm mb-3 mt-3"
                          onClick={() => handleConversationShow(question)}
                        >
                          Join Conversation{" "}
                          <i className="fas fa-arrow-right"></i>
                        </button>
                      </div>

                      {/* {questions?.length < 1 && <p>No Questions</p>} */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conversations Modal */}
      <Modal show={ConversationShow} size="lg" onHide={handleConversationClose}>
        <Modal.Header closeButton>
          <Modal.Title>Lesson: {selectedConversation?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="border p-2 p-sm-4 rounded-3">
            <ul
              className="list-unstyled mb-0"
              style={{ overflowY: "scroll", height: "500px" }}
            >
              {selectedConversation?.messages?.map((message, i) => (
                <li className="comment-item mb-3">
                  <div className="d-flex">
                    <div className="avatar avatar-sm flex-shrink-0">
                      <a href="#">
                        <img
                          className="avatar-img rounded-circle"
                          src={
                            message.profile.image?.startsWith(
                              "http://127.0.0.1:8000"
                            )
                              ? message.profile.image
                              : `http://127.0.0.1:8000${message.profile.image}`
                          }
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                          alt="womans image"
                        />
                      </a>
                    </div>
                    <div className="ms-2">
                      {/* Comment by */}
                      <div className="bg-light p-3 rounded w-100">
                        <div className="d-flex w-100 justify-content-center">
                          <div className="me-2 ">
                            <h6 className="mb-1 lead fw-bold">
                              <a
                                href="#!"
                                className="text-decoration-none text-dark"
                              >
                                {" "}
                                {message.profile.full_name}{" "}
                                
                              </a>
                              <br />
                              <span style={{ fontSize: "12px", color: "gray" }}>
                                {moment(message.date).format("DD MMM YYYY")}
                              </span>
                            </h6>
                            <p className="mb-0 mt-3  ">{message.message}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}

              <div ref={currentReplyRef}></div>
            </ul>

            <form class="w-100" onSubmit={replyMessage}>
              <textarea
                name="message"
                class="one form-control pe-4 mb-2 bg-light"
                id="autoheighttextarea"
                rows="5"
                placeholder="Reply"
                onChange={handleAskQuestionOnchange}
              ></textarea>
              <button class="btn btn-primary mb-0 w-25" type="submit">
                Post <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </Modal.Body>
      </Modal>

      <BaseFooter />
    </>
  );
}

export default TeacherQA;
