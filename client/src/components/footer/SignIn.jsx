import axios from "axios";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Loader from "../loader/Loader";

const SignIn = () => {
  // Loader
  const [isLoading, setIsLoading] = useState(true);
  const [showSignIn, setShowSignIn] = useState(true);

  useEffect(function () {
    async function fetchUser() {
      try {
        const res = await axios.get("http://localhost:5000/api/getAuthUser", {
          withCredentials: true,
        });

        if (res) {
          setShowSignIn(false);
        }
      } catch (error) {
        if (error.response.data.message == "No token provided") {
        } else {
          console.log(error);
        }
      }
      setIsLoading(false);
    }

    fetchUser();
  }, []);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : showSignIn ? (
        <div className="footer-signin">
          <hr />
          <div className="signin-wrapper">
            <p>See personalized recommendations</p>
            <NavLink to="/login">
              <button>Sign in</button>
            </NavLink>

            <p>
              New customer? <NavLink to="/register">Start here.</NavLink>
            </p>
          </div>
          <hr />
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default SignIn;
