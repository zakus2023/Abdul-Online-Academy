import { useAuthStore } from "../store/auth";
import apiInstance from "./axios";
import jwtDecode from "jwt-decode";
import Cookie from "js-cookie";
import Swal from "sweetalert2";
import axios from "axios";
import Toast from "../views/plugin/Toast";

// Login Function
export const login = async (email, password) => {
  try {
    const { data, status } = await apiInstance.post("user/token/", {
      email,
      password,
    });

    if (status === 200) {
      setAuthUser(data.access, data.refresh);
    }
    return { data, error: null };
  } catch (error) {
    console.log(error);
    if (error.response?.data?.detail) {
      Swal.fire({
        title: "Oops...",
        text: error.response.data.detail,
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
    return {
      data: null,
      error: error.response?.data?.detail || "Something went wrong",
    };
  }
};

// Register Function
export const register = async (full_name, email, password, confirm_password) => {
  try {
    const { data } = await apiInstance.post("user/register/", {
      full_name,
      email,
      password,
      confirm_password,
    });

    // Optionally, log the user in after registration
    // await login(email, password);

    return { data, error: null };
  } catch (error) {
    console.log(error);
    const errorMsg =
      error.response?.data?.password || error.response?.data?.email;
    if (errorMsg) {
      Swal.fire({
        title: "Oops...",
        text: errorMsg,
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
    return {
      data: null,
      error: error.response?.data?.detail || "Something went wrong",
    };
  }
};

// Logout Function
export const logout = () => {
  Cookie.remove("access_token");
  Cookie.remove("refresh_token");
  useAuthStore.getState().setUser(null);
};

// Function to Set Auth User
export const setAuthUser = (access_token, refresh_token) => {
  Cookie.set("access_token", access_token, { expires: 1, secure: true });
  Cookie.set("refresh_token", refresh_token, { expires: 7, secure: true });

  const user = jwtDecode(access_token) ?? null;

  if (user) {
    useAuthStore.getState().setUser(user);
  } else {
    useAuthStore.getState().setLoading(false);
  }
};

// Get a New Access Token Using Refresh Token
export const getRefreshToken = async () => {
  const refresh_token = Cookie.get("refresh_token");
  if (!refresh_token) {
    logout();
    return null;
  }
  try {
    const { data } = await apiInstance.post("user/token/refresh/", {
      refresh: refresh_token,
    });
    return data;
  } catch (error) {
    console.log("Failed to refresh token:", error);
    logout();
    return null;
  }
};

// Check if Access Token is Expired
export const isAccessTokenExpired = (access_token) => {
  try {
    const decodedToken = jwtDecode(access_token);
    return decodedToken.exp < Date.now() / 1000;
  } catch (error) {
    console.log("Token decode error:", error);
    return true;
  }
};

// Set User from Token (Auto-Login)
export const setUser = async () => {
  const access_token = Cookie.get("access_token");
  const refresh_token = Cookie.get("refresh_token");

  if (!access_token || !refresh_token) {
    return;
  }

  if (isAccessTokenExpired(access_token)) {
    const response = await getRefreshToken();
    if (response) {
      setAuthUser(response.access, response.refresh);
    }
  } else {
    setAuthUser(access_token, refresh_token);
  }
};

// // ==================================
// // Importing necessary modules and libraries
// import { useAuthStore } from "../store/auth"; 
// // We use `useAuthStore` to manage authentication state throughout the app.
// // This helps in keeping track of whether a user is logged in and their user details.

// import apiInstance from "./axios"; 
// // `apiInstance` is a pre-configured Axios instance for making HTTP requests to our backend.
// // It includes settings like base URL and headers, making our API calls cleaner and more consistent.

// import jwtDecode from "jwt-decode"; 
// // We use `jwtDecode` to extract user information from the access token.
// // This allows us to decode the token and get details like user ID, email, etc.

// import Cookie from "js-cookie"; 
// // The `js-cookie` library helps in handling browser cookies (setting, getting, and deleting them).
// // We use cookies to store tokens, so they persist even if the user refreshes the page.

// import Swal from "sweetalert2"; 
// // `SweetAlert2` is a library for displaying beautiful alert pop-ups.
// // We use it for showing error messages and notifications in a user-friendly way.

// import axios from "axios"; 
// // We import Axios (though it's also imported as `apiInstance`) in case we need to make additional HTTP requests.

// import Toast from "../views/plugin/Toast"; 
// // This is a custom Toast notification component.
// // It's used for brief notifications that appear and disappear quickly, giving feedback to users.

// // Login Function
// export const login = async (email, password) => {
//   try {
//     // Send a POST request to the server with user's email and password
//     const { data, status } = await apiInstance.post("user/token/", {
//       email, // User's email address
//       password, // User's password
//     });

//     // If the login is successful (status code 200), we get access and refresh tokens
//     if (status === 200) {
//       setAuthUser(data.access, data.refresh);
//       // We call `setAuthUser` to save the tokens and set user details in state.
//       // This ensures the user is marked as logged in throughout the app.
//     }
//     return { data, error: null }; // Return the data if login is successful
//   } catch (error) {
//     console.log(error); // Log the error to the console for debugging

//     // If there's a specific error from the server (like invalid credentials)
//     if (error.response?.data?.detail) {
//       Swal.fire({
//         title: "Oops...", // Pop-up title
//         text: error.response.data.detail, // Show specific error message from server
//         icon: "error", // Display an error icon
//         confirmButtonText: "Try Again", // Button label
//       });
//     }

//     // Return null data and a meaningful error message if something goes wrong
//     return {
//       data: null,
//       error: error.response?.data?.detail || "Something went wrong",
//     };
//   }
// };

// // Register Function
// export const register = async (full_name, email, password, confirm_password) => {
//   try {
//     // Send a POST request to register a new user with their details
//     const { data } = await apiInstance.post("user/register/", {
//       full_name, // The user's full name
//       email, // User's email address
//       password, // User's chosen password
//       confirm_password, // Confirm password to ensure they match
//     });

//     // Optionally, we could automatically log the user in after registration by calling `login`
//     // await login(email, password);

//     return { data, error: null }; // Return registration data if successful
//   } catch (error) {
//     console.log(error); // Log error for debugging

//     // Check if there's a specific error related to password or email
//     const errorMsg = error.response?.data?.password || error.response?.data?.email;
//     if (errorMsg) {
//       Swal.fire({
//         title: "Oops...", // Pop-up title
//         text: errorMsg, // Display the specific error message
//         icon: "error", // Error icon
//         confirmButtonText: "Try Again", // Button label
//       });
//     }

//     // Return error details if registration fails
//     return {
//       data: null,
//       error: error.response?.data?.detail || "Something went wrong",
//     };
//   }
// };

// // Logout Function
// export const logout = () => {
//   // Remove access and refresh tokens from cookies to log the user out
//   Cookie.remove("access_token");
//   Cookie.remove("refresh_token");

//   // Reset user information in the global auth store
//   useAuthStore.getState().setUser(null);
//   // This clears the user data from state, ensuring the user is logged out across the app.
// };

// // Function to Set Authenticated User Information
// export const setAuthUser = (access_token, refresh_token) => {
//   // Store tokens in cookies for persistent login (even after refreshing the browser)
//   Cookie.set("access_token", access_token, { expires: 1, secure: true });
//   Cookie.set("refresh_token", refresh_token, { expires: 7, secure: true });
//   // Access token expires in 1 day, refresh token in 7 days

//   // Decode the access token to extract user information
//   const user = jwtDecode(access_token) ?? null;

//   if (user) {
//     useAuthStore.getState().setUser(user);
//     // Set the user in the global auth store, marking them as logged in
//   } else {
//     useAuthStore.getState().setLoading(false);
//     // If token decoding fails, stop the loading state
//   }
// };

// // Function to Get a New Access Token Using Refresh Token
// export const getRefreshToken = async () => {
//   const refresh_token = Cookie.get("refresh_token");
//   // Get the refresh token from cookies, which is used to get a new access token

//   if (!refresh_token) {
//     logout(); // If no refresh token, log the user out
//     return null;
//   }

//   try {
//     // Request a new access token from the server using the refresh token
//     const { data } = await apiInstance.post("user/token/refresh/", {
//       refresh: refresh_token,
//     });

//     return data; // Return the new token if successful
//   } catch (error) {
//     console.log("Failed to refresh token:", error);
//     logout(); // Log out if token refresh fails
//     return null;
//   }
// };

// // Function to Check if the Access Token is Expired
// export const isAccessTokenExpired = (access_token) => {
//   try {
//     const decodedToken = jwtDecode(access_token);
//     // Decode the token to access its expiration time

//     return decodedToken.exp < Date.now() / 1000; 
//     // If the token's expiration time is less than the current time, it's expired
//   } catch (error) {
//     console.log("Token decode error:", error);
//     return true; // If there's an error decoding, treat the token as expired
//   }
// };

// // Auto-Login Function to Set User from Existing Tokens
// export const setUser = async () => {
//   const access_token = Cookie.get("access_token");
//   const refresh_token = Cookie.get("refresh_token");
//   // Get tokens from cookies

//   if (!access_token || !refresh_token) {
//     return; // If tokens are missing, exit early
//   }

//   if (isAccessTokenExpired(access_token)) {
//     // If access token is expired, get a new one using the refresh token
//     const response = await getRefreshToken();
//     if (response) {
//       setAuthUser(response.access, response.refresh);
//     }
//   } else {
//     setAuthUser(access_token, refresh_token);
//     // If access token is still valid, set user info directly
//   }
// };
