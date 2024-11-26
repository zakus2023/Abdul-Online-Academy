import React from "react";
import { useAuthStore } from "../store/auth";
import { Navigate } from "react-router-dom";

const PrivateRoutes = ({ children }) => {
  const loggedIn = useAuthStore((state) => state.isLoggedIn)();
  return loggedIn ? <>{children}</> : <Navigate to="/login/"></Navigate>;
};

export default PrivateRoutes;
