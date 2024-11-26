import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import { useContext, useEffect, useState } from "react";
import useAxios from "../utils/useAxios";
import UserData from "../views/plugin/UserData";
import moment from "moment";
import Toast from "../views/plugin/Toast";
import { TeacherNotificationContext } from "../views/plugin/Context";

function TeacherNotification() {
  const [hasUnreadNoti, setHasUnreadNoti] = useContext(TeacherNotificationContext);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    const res = await useAxios().get(
      `teacher/list-notifications/${UserData()?.teacher_id}/`
    );
    setNotifications(res.data);
    setHasUnreadNoti(res.data)
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark notification as seen
  const markNotiAsSeen = async (notificationId) => {
    const formdata = new FormData();
    formdata.append("teacher", UserData()?.teacher_id);
    formdata.append("pk", notificationId);
    formdata.append("seen", true);

    const res = await useAxios().patch(
      `teacher/notification-detail/${UserData()?.teacher_id}/${notificationId}/`,
      formdata
    );
    
    Toast().fire({
      title: "Notification has been marked as seen",
      icon: "success",
      timer: 3000,
      timerProgressBar: true,
    });
    fetchNotifications();
    
    console.log(res.data);
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
              <div className="card mb-4">
                {/* Card header */}
                <div className="card-header d-lg-flex align-items-center justify-content-between">
                  <div className="mb-3 mb-lg-0">
                    <h3 className="mb-0">Notifications</h3>
                    <span>Manage all your notifications from here</span>
                  </div>
                </div>
                {/* Card body */}
                <div className="card-body">
                  {/* List group */}
                  <ul className="list-group list-group-flush">
                    {/* List group item */}
                    {notifications?.map((notification, index) => (
                      <li className="list-group-item p-4 shadow rounded-3" key={index}>
                        <div className="d-flex">
                          <div className="ms-3 mt-2">
                            <div className="d-flex align-items-center justify-content-between">
                              <div>
                                <h4 className="mb-0">{notification.type}</h4>
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="mt-1">
                                <span className="me-2 fw-bold">
                                  Date:{" "}
                                  <span className="fw-light">
                                    {moment(notification.date).format(
                                      "DD-MMM-YYYY"
                                    )}
                                  </span>
                                </span>
                              </p>
                              <p>
                                {notification?.seen ? (
                                  <button
                                  class="btn btn-outline-secondary"
                                  type="button"
                                  disabled
                                >
                                  Seen <i className="fas fa-check"></i>
                                </button>
                                ):(
                                  <button
                                  class="btn btn-outline-secondary"
                                  type="button"
                                  onClick={() =>
                                    markNotiAsSeen(notification.id)
                                  }
                                >
                                  Mark as Seen <i className="fas fa-check"></i>
                                </button>
                                )}
                                
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                    {notifications?.length < 1 && (
                      <p>You have no unread notifications.</p>
                    )}
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

export default TeacherNotification;
