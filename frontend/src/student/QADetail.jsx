import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import Sidebar from './Partials/Sidebar'
import Header from './Partials/Header'
import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import useAxios from '../utils/useAxios'
import UserData from '../views/plugin/UserData'
import moment from 'moment'

function QADetail() {

    const param = useParams()
    
    const [questionAnswer, setQuestionAnswer] = useState([])
    const [course, setCourse] = useState({})

    const fetchEnrolledCourse = async ()=>{
        const res = await useAxios().get(`student/course-detail/${UserData()?.user_id}/${param.enrollment_id}/`)
        console.log(res.data)
        setCourse(res.data)
    }

    useEffect(()=>{
        fetchEnrolledCourse()
    },[])
    
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
                            <h4 className="mb-0 mb-4"> <i className='fas fa-envelope'></i> Q/A - {course?.course?.title}</h4>

                            <div className="card mb-4">
                                <div className="card-header">
                                    <span>Course: <b>{course?.course?.title}</b></span> <br />
                                    <span>Number of Questions: <b> {course?.question_answer?.length}</b></span>
                                </div>
                                <div className="p-2 p-sm-4">
                                
                                    <ul className="list-unstyled mb-0" style={{ overflowY: "scroll", height: "500px" }}>
                                    {course?.question_answer?.map((qa, i)=>(
                                        <>
                                          <div className="d-flex">
                                                    <div className="avatar avatar-sm flex-shrink-0">
                                                        <a href="#">
                                                            <img className="avatar-img rounded-circle" src={qa.profile.image} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} alt="womans image" />
                                                        </a>
                                                    </div>
                                                    <div className="ms-2">
                                                        {/* Comment by */}
                                                        <div className="bg-light p-3 rounded w-100">
                                                            <div className="d-flex w-100 justify-content-center">
                                                                <div className="me-2 ">
                                                                    <h6 className="mb-1 lead fw-bold">
                                                                        <a href="#!" className='text-decoration-none text-dark'> {qa.profile.full_name} </a><br />
                                                                        <span style={{ fontSize: "12px", color: "gray" }}>{moment(qa.date).format("DD MM YYYY")}</span>
                                                                    </h6>
                                                                    <p className="mb-0 mt-3  ">{qa.title}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
    
                                                    </div>
                                                </div>
                                            <li className="comment-item mb-3">
                                                {qa?.messages?.map((mes, i)=>(
                                                    <div className="d-flex">
                                                    <div className="avatar avatar-sm flex-shrink-0">
                                                        <a href="#">
                                                            <img className="avatar-img rounded-circle" src={mes.profile.image} style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover" }} alt="womans image" />
                                                        </a>
                                                    </div>
                                                    <div className="ms-2">
                                                        {/* Comment by */}
                                                        <div className="bg-light p-3 rounded w-100">
                                                            <div className="d-flex w-100 justify-content-center">
                                                                <div className="me-2 ">
                                                                    <h6 className="mb-1 lead fw-bold">
                                                                        <a href="#!" className='text-decoration-none text-dark'> <h6>{mes.profile.full_name}</h6> </a><br />
                                                                        <span style={{ fontSize: "12px", color: "gray" }}>{moment(mes.date).format("DD MM YYYY")}</span>
                                                                    </h6>
                                                                    <p className="mb-0 mt-3  ">{mes.message}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
    
                                                    </div>
                                                </div>
                                                ))}
                                            
                                        </li>
                                        <hr />
                                        </>
                                        
                                        ))}
                                    </ul>
                                    

                                    <form class="w-100 row">
                                        <div className="col-lg-10">
                                            <textarea class="one form-control pe-4 bg-light w-100" id="autoheighttextarea" rows="2" placeholder="Write a message..."></textarea>
                                        </div>
                                        <div className="col-lg-2">
                                            <button class="btn btn-primary ms-2 mb-0 w-100" type="button">Post <i className='fas fa-paper-plane'></i></button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <BaseFooter />
        </>
    )
}

export default QADetail