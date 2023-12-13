import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../app/store";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { registerUser } from "../slices/authSlice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

  const routeToLogin = () => {
    navigate("/login");
  };

  const register = (event: any) => {
    event?.preventDefault();
    let registerData = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
    };
    dispatch(registerUser(registerData));
    setEmail("");
    setFirstName("");
    setLastName("");
    setPassword("");
  };

  useEffect(() => {
    let isLoggedIn = localStorage.getItem("user") !== null;
    console.log(isLoggedIn, "isLoggedIn");
    if (auth.authenticated && auth.user && !isLoggedIn) {
      localStorage.setItem("user", JSON.stringify(auth.user));
    } else if (isLoggedIn) {
      navigate("/");
    }
  }, [auth]);

  return (
    <>
      {auth.loading && <div className="loader">Loading...</div>}
      <form onSubmit={register} className="full center-col">
        <h1 className="pb-lg">Sign up</h1>
        <div className="pb-md">
          <p className="pb-sm">First name</p>
          <input
            required
            className="text-input"
            value={firstName}
            onChange={(evt) => setFirstName(evt.target.value)}
            type="text"
            placeholder="First name"
          />
        </div>
        <div className="pb-md">
          <p className="pb-sm">Last name</p>
          <input
            required
            className="text-input"
            value={lastName}
            onChange={(evt) => setLastName(evt.target.value)}
            type="text"
            placeholder="Last name"
          />
        </div>
        <div className="pb-md">
          <p className="pb-sm">Email</p>
          <input
            required
            className="text-input"
            value={email}
            onChange={(evt) => setEmail(evt.target.value)}
            type="text"
            placeholder="Email"
          />
        </div>
        <div className="pb-md">
          <p className="pb-sm">Password</p>
          <input
            required
            className="text-input"
            value={password}
            onChange={(evt) => setPassword(evt.target.value)}
            type="password"
            placeholder="Password"
          />
        </div>

        <button type="submit" className="button mb-sm">
          Sign up
        </button>
        <p onClick={routeToLogin} className="link">
          Already have an account? Login
        </p>
      </form>

      <ToastContainer position="bottom-center" />
    </>
  );
}
