import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import useAxios from "../utils/useAxios";
import UserData from "../views/plugin/UserData";
import moment from "moment";
import Toast from "../views/plugin/Toast";

function Coupon() {
  const [show, setShow] = useState(false);
  const [showAddCoupon, setShowAddCoupon] = useState(false);

  const handleClose = () => setShow(false);

  // made changes here to handle the update. Cause I am working with a modal
  const[selectedCoupon, setSelectedCoupon] = useState([])
  const handleShow = (coupon) => {
    setShow(true)
    setSelectedCoupon(coupon)
  }

  const handleAddCouponClose = () => setShowAddCoupon(false);
  const handleAddCouponShow = () => setShowAddCoupon(true);

  const [createdCoupon, setCreatedCoupon] = useState({
    code: "",
    discount: 0,
  });

  const [holdCouponUpdate, setHoldCouponUpdate] = useState({
    code:"",
    discount: 0
  })

  // Fetch the coupon
  const [coupons, setCoupons] = useState([]);

  const fetchCoupons = async () => {
    const res = await useAxios().get(
      `teacher/list-coupons/${UserData()?.teacher_id}/`
    );
    setCoupons(res.data);
    setHoldCouponUpdate(res.data)
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Create new coupon
  

  const handleCreateCouponOnChange = (e) => {
    setCreatedCoupon({
      ...createdCoupon,
      [e.target.name]: e.target.value,
    });
  };

  const createCoupon = async (e) => {
    e.preventDefault();
    const formdata = new FormData();

    formdata.append("teacher", UserData()?.teacher_id);
    formdata.append("code", createdCoupon.code);
    formdata.append("discount", createdCoupon.discount);

    try {
      const res = await useAxios().post(
        `teacher/list-coupons/${UserData()?.teacher_id}/`,
        formdata
      );
      Toast().fire({
        title: "Coupon created Successfully",
        icon: "success",
        timer: 3000,
        timerProgressBar: true,
      });
      fetchCoupons();
    } catch (error) {
      console.log(error);
    }
  };

  // Update Coupon

  

  const updateCouponOnChange = (e) => {
    setHoldCouponUpdate({
      ...holdCouponUpdate,
      [e.target.name]: e.target.value,
    });
  };

  const updateCoupon = async (coupon_id) => {

    const formdata = new FormData()
    formdata.append("teacher", UserData()?.teacher_id)
    formdata.append("code", holdCouponUpdate.code || selectedCoupon?.code)
    formdata.append("discount", holdCouponUpdate.discount || selectedCoupon?.discount)

    try {
      const res = await useAxios().patch(
        `teacher/coupon-detail/${UserData()?.teacher_id}/${coupon_id}/`, formdata
      );
      Toast().fire({
        title: "Coupon updated Successfully",
        icon: "success",
        timer: 3000,
        timerProgressBar: true,
      });
      fetchCoupons();
    } catch (error) {
      console.log(error)
    }
  };

  // delete coupon

  const deleteCoupon = async (coupon_id)=>{
    const res = await useAxios().delete(`teacher/coupon-detail/${UserData()?.teacher_id}/${coupon_id}/`)
    Toast().fire({
      title: "Coupon updated Successfully",
      icon: "success",
      timer: 3000,
      timerProgressBar: true,
    });
    fetchCoupons();
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
                    <h3 className="mb-0">Coupons</h3>
                    <span>Manage all your coupons from here</span>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddCouponShow}
                  >
                    Add Coupon
                  </button>
                </div>
                {/* Card body */}
                <div className="card-body">
                  {/* List group */}
                  <ul className="list-group list-group-flush">
                    {/* List group item */}
                    {coupons?.map((c, i) => (
                      <li
                        className="list-group-item p-4 shadow rounded-3"
                        key={i}
                      >
                        <div className="d-flex">
                          <div className="ms-3 mt-2">
                            <div className="d-flex align-items-center justify-content-between">
                              <div>
                                <h4 className="mb-0">{c.code}</h4>
                                <span>{c.used_by.length} Student(s)</span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="mt-2">
                                <span className="me-2 fw-bold">
                                  Discount:{" "}
                                  <span className="fw-light">
                                    {c.discount}% Discount
                                  </span>
                                </span>
                              </p>
                              <p className="mt-1">
                                <span className="me-2 fw-bold">
                                  Date Created:{" "}
                                  <span className="fw-light">
                                    {moment(c.date).format("DD-MMM-YYYY")}
                                  </span>
                                </span>
                              </p>
                              <p>
                                <button
                                  class="btn btn-outline-secondary"
                                  type="button"
                                  onClick={()=>handleShow(c)}
                                >
                                  Update Coupon
                                </button>

                                <button
                                  class="btn btn-danger ms-2"
                                  type="button"
                                  onClick={()=>deleteCoupon(c.id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

  <Modal show={show} onHide={handleClose}>
  <Modal.Header closeButton>
    <Modal.Title>
      Update Coupon - <span className="fw-bold">{selectedCoupon.code}</span>
    </Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <div >
      <div class="mb-3">
        <label for="exampleInputEmail1" class="form-label">
          Code
        </label>
        <input
          type="text"
          defaultValue={selectedCoupon.code}
          className="form-control"
          name="code"
          id=""
          onChange={updateCouponOnChange}
        />
        <label for="exampleInputEmail1" class="form-label mt-3">
          Discount
        </label>
        <input
          type="text"
          defaultValue={selectedCoupon.discount}
          className="form-control"
          name="discount"
          id=""
          onChange={updateCouponOnChange}
        />
      </div>

      <button type="submit" class="btn btn-primary" onClick={() => updateCoupon(selectedCoupon.id)}>
        Update Coupon <i className="fas fa-check-circle"> </i>
      </button>

      <Button className="ms-2" variant="secondary" onClick={handleClose}>
        Close
      </Button>
    </div>
  </Modal.Body>
</Modal>

      

      <Modal show={showAddCoupon} onHide={handleAddCouponClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Coupon</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={createCoupon}>
            <div class="mb-3">
              <label for="exampleInputEmail1" class="form-label">
                Code
              </label>
              <input
                type="text"
                placeholder="Code"
                value={createdCoupon.code}
                className="form-control"
                name="code"
                id=""
                onChange={handleCreateCouponOnChange}
              />
              <label for="exampleInputEmail1" class="form-label mt-3">
                Discount
              </label>
              <input
                type="text"
                placeholder="Discount"
                value={createdCoupon.discount}
                className="form-control"
                name="discount"
                id=""
                onChange={handleCreateCouponOnChange}
              />
            </div>

            <button type="submit" class="btn btn-primary">
              Create Coupon <i className="fas fa-plus"> </i>
            </button>

            <Button
              className="ms-2"
              variant="secondary"
              onClick={handleAddCouponClose}
            >
              Close
            </Button>
          </form>
        </Modal.Body>
      </Modal>

      <BaseFooter />
    </>
  );
}

export default Coupon;
