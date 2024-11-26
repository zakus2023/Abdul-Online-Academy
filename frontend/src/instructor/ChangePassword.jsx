import React, { useState } from 'react'
import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import Sidebar from './Partials/Sidebar'
import Header from './Partials/Header'
import Toast from '../views/plugin/Toast'
import useAxios from '../utils/useAxios'
import UserData from '../views/plugin/UserData'
import { useNavigate } from 'react-router-dom'
import { logout } from '../utils/auth'


function TeacherChangePassword() {

    const navigate = useNavigate()

    const [passwordData, setPasswordData] = useState({
        old_password: "",
        new_password: "",
        confirm_new_password: ""
    })
    

    const passwordOnChnage = (e) =>{
        setPasswordData({
            ...passwordData,
            [e.target.name]:e.target.value
        })
    }

    const changePassword = async (e)=>{
        e.preventDefault()
        if(passwordData.new_password !== passwordData.confirm_new_password){
            Toast().fire({
                title: "Passwords do not match",
                icon: "warning",
                timer: 5000,
                timerProgressBar: true,
            });
        }else{
            const formData = new FormData()
            formData.append("user_id", UserData()?.user_id)
            formData.append("old_password", passwordData.old_password)
            formData.append("new_password", passwordData.new_password)
            try {
                const res = await useAxios().post(`user/password-change/`, formData)
                logout()
                navigate('/login/')
                Toast().fire({
                    title: res.data.message,
                    icon: res.data.icon,
                    timer: 3000,
                    timerProgressBar: true,
                });
                console.log(res.data)
            } catch (error) {
                console.log(error)
            }
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
                            <div className="card">
                                {/* Card header */}
                                <div className="card-header">
                                    <h3 className="mb-0">Change Password</h3>
                                </div>
                                {/* Card body */}
                                <div className="card-body">
                                    <div>
                                        <form className="row gx-3 needs-validation" noValidate="" onSubmit={changePassword}>
                                            {/* Old password */}
                                            <div className="mb-3 col-12 col-md-12">
                                                <label className="form-label" htmlFor="fname">
                                                    Old Password
                                                </label>
                                                <input
                                                    type="password"
                                                    id="password"
                                                    className="form-control"
                                                    placeholder="**************"
                                                    required=""
                                                    onChange={passwordOnChnage}
                                                    name='old_password'
                                                />
                                            </div>
                                            {/* New Password */}
                                            <div className="mb-3 col-12 col-md-12">
                                                <label className="form-label" htmlFor="lname">
                                                    New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    id="password"
                                                    className="form-control"
                                                    placeholder="**************"
                                                    required=""
                                                    onChange={passwordOnChnage}
                                                    name='new_password'
                                                />
                                            </div>

                                            {/* Confirm new password */}
                                            <div className="mb-3 col-12 col-md-12">
                                                <label className="form-label" htmlFor="editCountry">
                                                    Confirm New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    id="password"
                                                    className="form-control"
                                                    placeholder="**************"
                                                    required=""
                                                    onChange={passwordOnChnage}
                                                    name='confirm_new_password'
                                                />
                                                <div className="invalid-feedback">Passwords do not match</div>
                                            </div>
                                            <div className="col-12">
                                                {/* Button */}
                                                <button className="btn btn-primary" type="submit">
                                                    Save New Password <i className='fas fa-check-circle'></i>
                                                </button>
                                            </div>
                                        </form>
                                    </div>
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

export default TeacherChangePassword