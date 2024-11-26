import { useEffect, useState } from "react";

const GetCurrentAddress = () => {
  const [address, setAddress] = useState({}); // Initializing as an empty object

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;

      console.log("Latitude:", latitude);
      console.log("Longitude:", longitude);

      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

      // Corrected the fetch promise
      fetch(url)
        .then((res) => res.json()) // Correct arrow function and parsing of JSON
        .then((data) => {
          // console.log(data); // Log full response
          setAddress(data.address); // Set the full address object
        });
    });
  }, []);

  return address;
};

export default GetCurrentAddress;
