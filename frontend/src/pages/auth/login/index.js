import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import useSignIn from "../../../hooks/useSignIn";

import styles from "../index.module.css";
import AuthPageBase from "../../../components/auth/authBase";
import Card from "../../../components/ui/card";
import FancyInput from "../../../components/formElements/fancyInput";

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    signin,
    demoSignIn,
    verifyFacebookSignIn,
    isLoading,
    errors,
    clearErrors,
  } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await signin(email, password);
    if (ok) {
      toast.dismiss(); // Clear all previous toasts
      toast.success("Successfully logged in.");
    }
  };

  const useDemoAccount = async () => {
    const ok = await demoSignIn();
    if (ok) {
      toast.dismiss(); // Clear all previous toasts
      toast.success("Successfully logged in.");
    }
  };

  useEffect(() => {
    const token = searchParams.get("token");
    // See if we have a "token" in the url query params if we tried to login with facebook
    if (token) {
      verifyFacebookSignIn(token).then((success) => {
        if (success) {
          navigate("/", { replace: true });
          toast.success("Successfully logged in with Facebook.", {
            id: "facebook",
          });
        }
      });
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    if (errors) {
      errors.forEach((err) => toast.error(err.msg, { duration: 5000 }));
      clearErrors();
    }
  }, [errors, clearErrors]);

  return (
    <AuthPageBase>
      <Card className={styles.authCard}>
        <p>Login to Your Account.</p>
        <form
          className={styles.authForm}
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <FancyInput
            labelText="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <FancyInput
            labelText="Password"
            type="password"
            minLength="6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            className={`btn compressed gold ${styles.cstmBtn}`}
            disabled={isLoading}
          >
            Login
          </button>
        </form>
        <div className={styles.otherActions}>
          <a
            className={`btn link compressed `}
            disabled={isLoading}
            href={`${process.env.REACT_APP_BACKEND_URL}/api/auth/login/facebook`}
          >
            Sign in with Facebook
          </a>
          <button
            className={`btn compressed green`}
            disabled={isLoading}
            onClick={useDemoAccount}
          >
            Use Demo Account
          </button>
        </div>

        <Link to="/signup" className={styles.link}>
          New to OdinWorks? Create an Account.
        </Link>
      </Card>
    </AuthPageBase>
  );
};

export default LoginPage;
