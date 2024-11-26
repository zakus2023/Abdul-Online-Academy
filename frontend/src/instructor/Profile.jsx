import React, { useContext, useEffect, useState } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../utils/useAxios";
import UserData from "../views/plugin/UserData";
import Toast from "../views/plugin/Toast";
import { ProfileContext } from "../views/plugin/Context";

function TeacherProfile() {
    const [profile, setProfile] = useContext(ProfileContext) // added this after creating the ProfileContext
  
    // start with
    const [profileData, setProfileData] = useState({
      image: "",
      full_name: "",
      about: "",
      country: "",
    });
    const [imagePreview, setImagePreview] = useState("");
  
    const fetchProfile = async () => {
      const res = await useAxios().get(`user/profile/${UserData()?.user_id}/`);
      setProfileData(res.data);
      setImagePreview(res.data.image);
    };
  
    useEffect(() => {
      fetchProfile();
    }, []);
  
    // -----------------------
  
    // Secondly
  
    const handleOnchange = (e) => {
      setProfileData({
        ...profileData,
        [e.target.name]: e.target.value,
      });
    };
  
    // get the selected image and add it to the profileData
    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      setProfileData({
        ...profileData,
        [e.target.name]: selectedFile,
      });
  
      // Preview the file before it gets loaded
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
  
      if (selectedFile) {
        reader.readAsDataURL(selectedFile);
      }
    };
  
    // thridly: update the profile
  
    const updateUserProfile = async (e) => {
      e.preventDefault();
  
      // Initialize FormData before the GET request
      const formData = new FormData();
  
      // Fetch existing user profile data
      const existingData = await useAxios().get(`user/profile/${UserData().user_id}/`);
  
      // Append form fields only if there's a change
      if (profileData.image && profileData.image !== existingData.data.image) {
          formData.append("image", profileData.image);
      }
      formData.append("full_name", profileData.full_name);
      formData.append("about", profileData.about);
      formData.append("country", profileData.country);
  
      try {
          // Update user profile with PATCH request
          const response = await useAxios().patch(
              `user/profile/${UserData().user_id}/`,
              formData,
              {
                  headers: {
                      "Content-Type": "multipart/form-data",
                  },
              }
          );
          fetchProfile()
          setProfile(response.data) // added this after creating the ProfileContext
          
          Toast().fire({
              title: "Profile updated successfully",
              icon: "success",
              timer: 3000,
              timerProgressBar: true,
          });
      } catch (error) {
          console.error("Error updating profile:", error);
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
                {/* Card */}
                <div className="card">
                  {/* Card header */}
                  <div className="card-header">
                    <h3 className="mb-0">Profile Details</h3>
                    <p className="mb-0">
                      You have full control to manage your own account setting.
                    </p>
                  </div>
                  {/* Card body */}
                  <form className="card-body" onSubmit={updateUserProfile}>
                    <div className="d-lg-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center mb-4 mb-lg-0">
                        <img
                          src={imagePreview}
                          id="img-uploaded"
                          className="avatar-xl rounded-circle"
                          alt="avatar"
                          style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        <div className="ms-3">
                          <h4 className="mb-0">Your avatar</h4>
                          <p className="mb-0">
                            PNG or JPG no bigger than 800 x 800 pixels
                          </p>
                          <input
                            type="file"
                            className="form-control mt-3"
                            id=""
                            name="image"
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>
                    </div>
                    <hr className="my-5" />
                    <div>
                      <h4 className="mb-0">Personal Details</h4>
                      <p className="mb-4">
                        Edit your personal information and address.
                      </p>
                      {/* Form */}
                      <div className="row gx-3">
                        {/* First name */}
                        <div className="mb-3 col-12 col-md-12">
                          <label className="form-label" htmlFor="fname">
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="full_name"
                            className="form-control"
                            placeholder="First Name"
                            required=""
                            value={profileData.full_name}
                            onChange={handleOnchange}
                            name="full_name"
                          />
                          <div className="invalid-feedback">
                            Please enter first name.
                          </div>
                        </div>
                        {/* Last name */}
                        <div className="mb-3 col-12 col-md-12">
                          <label className="form-label" htmlFor="lname">
                            About Me
                          </label>
                          <textarea
                            name="about"
                            id=""
                            cols="30"
                            rows="5"
                            className="form-control"
                            value={profileData.about}
                            onChange={handleOnchange}
                          ></textarea>
                          <div className="invalid-feedback">
                            Please enter last name.
                          </div>
                        </div>
  
                        {/* Country */}
                        <div className="mb-3 col-12 col-md-12">
                          <label className="form-label" htmlFor="editCountry">
                            Country
                          </label>
                          <input
                            type="text"
                            id="country"
                            className="form-control"
                            placeholder="Country"
                            required=""
                            value={profileData.country}
                            onChange={handleOnchange}
                            name="country"
                          />
                          <div className="invalid-feedback">
                            Please choose country.
                          </div>
                        </div>
                        <div className="col-12">
                          {/* Button */}
                          <button className="btn btn-primary" type="submit">
                            Update Profile <i className="fas fa-check-circle"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
  
        <BaseFooter />
      </>
    );
}

export default TeacherProfile;
