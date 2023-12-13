import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../app/store";
import { loginUser } from "../slices/authSlice";
import { ToastContainer } from "react-toastify";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("student");

  const routeToSignup = () => {
    navigate("/signup");
  };

  const login = (event: any) => {
    event?.preventDefault();
    let loginData = {
      email: username,
      password: password,
      usertype: userType,
    };
    dispatch(loginUser(loginData));
  };

  useEffect(() => {
    // check if user is already logged in by using local storage
    //if yes, then get user data from local storage or else set user data in local storage
    let isLoggedIn = localStorage.getItem("user") !== null;
    console.log(isLoggedIn, "isLoggedIn");
    if (auth.authenticated && auth.user && !isLoggedIn) {
      console.log("test");
      localStorage.setItem("user", JSON.stringify(auth.user));
      if (userType === "admin" || userType === "professor") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } else if (isLoggedIn) {
      const lsUser = localStorage.getItem("user");
      console.log(lsUser);
      if (lsUser !== null) {
        const userObj = JSON.parse(lsUser);
        if (userType === "admin" || userType === "professor") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      }
    }
  }, [auth, navigate]);

  return (
    <>
      {auth.loading && <div className="loader">Loading...</div>}
      <form onSubmit={login} className="full center-col">
        <h1 className="pb-lg">Login</h1>
        <div className="pb-md">
          <p className="pb-sm">Email</p>
          <input
            required
            value={username}
            onChange={(evt) => setUsername(evt.target.value)}
            className="text-input"
            type="text"
            placeholder="Email"
          />
        </div>
        <div className="pb-md">
          <p className="pb-sm">Password</p>
          <input
            required
            value={password}
            onChange={(evt) => setPassword(evt.target.value)}
            className="text-input"
            type="password"
            placeholder="Password"
          />
        </div>

        <div className="center-between mb-md">
          <div className="pr-lg">
            <input
              id="student"
              name="userType"
              value="student"
              checked={userType === "student"}
              onChange={(evt) => setUserType(evt?.target?.value)}
              type="radio"
            />
            <label className="pl-xsm" htmlFor="user">
              Student
            </label>
          </div>
          <div className="pr-lg">
            <input
              id="admin"
              name="userType"
              value="admin"
              checked={userType === "admin"}
              onChange={(evt) => setUserType(evt?.target?.value)}
              type="radio"
            />
            <label className="pl-xsm" htmlFor="admin">
              Admin
            </label>
          </div>
          <div>
            <input
              id="professor"
              name="userType"
              value="professor"
              checked={userType === "professor"}
              onChange={(evt) => setUserType(evt?.target?.value)}
              type="radio"
            />
            <label className="pl-xsm" htmlFor="professor">
              Professor
            </label>
          </div>
        </div>
        <button type="submit" className="button mb-sm">
          Login
        </button>
        <p onClick={routeToSignup} className="link">
          Don't have an account? Sign up
        </p>
      </form>

      <ToastContainer position="bottom-center" />
    </>
  );
}

export default Login;
