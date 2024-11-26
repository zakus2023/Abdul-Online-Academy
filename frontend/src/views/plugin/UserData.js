import Cookie from "js-cookie";
import jwtDecode from "jwt-decode";

const UserData = () => {
  try {
    // Get tokens from cookies
    const access_token = Cookie.get("access_token");
    const refresh_token = Cookie.get("refresh_token");

    // Decode the access token to get user data
    if (access_token) {
      const decodedAccessToken = jwtDecode(access_token);
      // console.log("Decoded Access Token:", decodedAccessToken);
      return decodedAccessToken;
    }

    // Optionally, decode the refresh token if needed
    if (refresh_token) {
      const decodedRefreshToken = jwtDecode(refresh_token);
      // console.log("Decoded Refresh Token:", decodedRefreshToken);
      return decodedRefreshToken;
    }

    // Return null if no tokens are found
    return null;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

export default UserData;

