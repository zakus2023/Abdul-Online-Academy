import React, { useState } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import { Link } from "react-router-dom";
import { register } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Register() {
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
 

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await register(full_name, email, password, confirm_password);
    if (!res.error) {
      navigate("/login/");

      Swal.fire({
        title: "Congratulations!!!",
        text: "Registration Successful",
        icon: "success",
        timer: 3000,
        timerProgressBar: true,
      });
      setIsLoading(false);
    } 
      setIsLoading(false);
    
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
                  <h1 className="mb-1 fw-bold">Sign up</h1>
                  <span>
                    Already have an account?
                    <Link to="/login/" className="ms-1">
                      Sign In
                    </Link>
                  </span>
                </div>
                {/* Form */}
                <form
                  className="needs-validation"
                  noValidate=""
                  onSubmit={handleSubmit}
                >
                  {/* Username */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      className="form-control"
                      name="full_name"
                      placeholder="John Doe"
                      required=""
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      name="email"
                      placeholder="johndoe@gmail.com"
                      required=""
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password
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
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Confirm Password
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
                  </div>
                  <div>
                    <div className="d-grid">
                      {isLoading ? (
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled
                        >
                          Processing <i className="fas fa-spinner fa-spin"></i>
                        </button>
                      ) : (
                        <button type="submit" className="btn btn-primary">
                          Sign Up <i className="fas fa-user-plus"></i>
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

export default Register;
