import React, { useEffect, useState } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import apiInstance from "../utils/axios";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

function CreateNewPassword() {
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const location = useLocation(); // Get current location (URL)

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (confirm_password !== password) {
      Swal.fire({
        title: "Oops...",
        text: "Passwords do not match",
        icon: "info",
        confirmButtonText: "Try Again",
      });
      return;
    } else {
      const searchParam = new URLSearchParams(location.search);
      // Get the OTP, refreshToken and uuidb64 from the URL
      const otp = searchParam.get("otp");
      const uuidb64 = searchParam.get("uuidb64");
      const refresh_token = searchParam.get("refresh_token");

      // create a variable called formdata and store otp, refreshToken, password and uuidb64 int it
      const formdata = new FormData();

      formdata.append("otp", otp);
      formdata.append("uuidb64", uuidb64);
      formdata.append("refresh_token", refresh_token);
      formdata.append("password", password);

      // call the change password api and pass the formdata to it
      try {
        setIsLoading(true);
        await apiInstance
          .post("user/change-password/", formdata)
          .then((res) => {
            Swal.fire({
              title: "Congratulations!!!",
              text: "Password Changed Successfully",
              icon: "success",
              timer: 3000,
              timerProgressBar: true,
            });
          });
        navigate("/login/");
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <BaseHeader />

      <section
        className="container d-flex flex-column vh-100"
        style={{ marginTop: "150px" }}
      >
        <div className="row align-items-center justify-content-center g-0 h-lg-100 py-8">
          <div className="col-lg-5 col-md-8 py-8 py-xl-0">
            <div className="card shadow">
              <div className="card-body p-6">
                <div className="mb-4">
                  <h1 className="mb-1 fw-bold">Create New Password</h1>
                  <span>Choose a new password for your account</span>
                </div>
                <form
                  className="needs-validation"
                  noValidate=""
                  onSubmit={handleSubmit}
                >
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Enter New Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      name="password"
                      placeholder="**************"
                      required=""
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="invalid-feedback">
                      Please enter valid password.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      name="password"
                      placeholder="**************"
                      required=""
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <div className="invalid-feedback">
                      Please enter valid password.
                    </div>
                  </div>

                  <div>
                    <div className="d-grid">
                      {isLoading ? (
                        <button type="submit" className="btn btn-primary">
                          Processing <i className="fas fa-spinner fa-spin"></i>
                        </button>
                      ) : (
                        <button type="submit" className="btn btn-primary">
                          Save New Password{" "}
                          <i className="fas fa-check-circle"></i>
                        </button>
                      )}
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

export default CreateNewPassword;
