import React, { useState, useEffect, useRef } from "react";
import api from "../../utils/axios";
import * as THREE from "three";
import GLOBE from "vanta/dist/vanta.net.min";
import fullsuiteLogo from "../../assets/logos/logo-fs.svg";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import TwoCirclesLoader from "../../assets/loaders/TwoCirclesLoader";
import { getUserFromCookie } from "../../utils/cookie";
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from "react-google-recaptcha-v3";

import { ModalResetPassword } from "../../components/modals/ModalResetPassword";
import { Link } from "react-router-dom";
import sendVerification from "../../utils/sendVerification";
import { useLoginUserAPIhris } from "../../api/auth/useAuthAPI";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const LoginForm = ({ email, password, setEmail, setPassword }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const { loginUser, loading: hrisLoading } = useLoginUserAPIhris();

  const handleResetPasswordBtn = () => {
    // setResetModal((prev) => !prev); // Fixed typo here
    navigate("/reset-password");
  };
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!executeRecaptcha) {
      toast.error("reCAPTCHA is not ready.");
      return;
    }

    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      const recaptchaToken = await executeRecaptcha("login");
      //TODO: check first if exists in HRIS
      console.log("nakapasok hereee ");

      const { token } = await loginUser({ email, password });
      localStorage.setItem("hris-token", token);

      console.log("hris-token: ", token);

      //then proceed if yes...
      if (token) {
        const response = await api.post("/api/login", {
          email,
          recaptchaToken,
        });

        const user = await getUserFromCookie();
        if (response.data.accessToken) {
          // Store token in localStorage for Suitebite API compatibility
          localStorage.setItem("token", response.data.accessToken);
          console.log("tokeeeen: ", response.data.accessToken);
          toast.success(`Welcome back ${user?.first_name || ""}!`, {
            icon: <CheckCircleIcon className="w-5 h-5 text-primary" />,
          });

          navigate("/app/blogs-feed");
        } else if (response.data.recaptchaError) {
          toast.success(response.data.message);
        } else {
          toast.error("Login failed. Please check your credentials.");
        }
      }
    } catch (error) {
      setLoading(false);
      if (error.response?.status === 400) {
        toast.error("Invalid email or password. Please try again.");
      } else if (error.response?.data?.isNotActive) {
        navigate("/account-deactivated");
      } else {
        toast.error(
          `${error.response?.data?.message || "Something went wrong."}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="dark flex flex-col gap-5">
      <div>
        <input
          type="text"
          id="email"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className=" text-white w-full p-3 border border-white/20 rounded-md bg-white/10 focus:outline-none focus:ring-2 focus:ring-white placeholder-white/50"
        />
      </div>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border text-white border-white/20 rounded-md bg-white/10 focus:outline-none focus:ring-2 focus:ring-white placeholder-white/50"
          onPaste={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="cursor-pointer absolute top-3.5 right-3 text-gray-500"
        >
          {showPassword ? (
            <EyeSlashIcon className="size-5 cursor-pointer text-white/70" />
          ) : (
            <EyeIcon className="size-5 cursor-pointer text-white/70" />
          )}
        </button>
      </div>
      <section className="flex justify-end mb-5">
        <p
          className="text-xs text-white no-underline hover:underline! cursor-pointer"
          onClick={handleResetPasswordBtn}
        >
          Forgot password?
        </p>
      </section>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg font-avenir-black text-white bg-white/30 shadow-xs hover:bg-white/40 disabled:opacity-50 transition cursor-pointer"
      >
        {loading ? (
          <div className="mx-auto w-fit">
            <TwoCirclesLoader
              bg={"transparent"}
              color1={"#bfd1a0"}
              color2={"#ffffff"}
              width={"135"}
              height={"24"}
            />
          </div>
        ) : (
          "Log in"
        )}
      </button>
      <p
        className="text-xs text-white text-center select-none cursor-pointer"
        onClick={() => navigate("/")}
      >
        Exit
      </p>
    </form>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const vantaRef = useRef(null);
  // const [isResetModal, setResetModal] = useState(false); // Fixed typo here
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUserFromCookie();
      if (user) navigate("/app/blogs-feed");
    };
    fetchUser();
  }, []);

  useEffect(() => {
    let effect = null;
    const loadVanta = () => {
      if (!vantaRef.current) {
        // Suppress THREE.js deprecation warnings for Vanta.js
        const originalWarn = console.warn;
        console.warn = (message, ...args) => {
          if (typeof message === "string" && message.includes("vertexColors")) {
            return; // Suppress the vertexColors warning
          }
          originalWarn(message, ...args);
        };

        effect = GLOBE({
          THREE,
          el: "#vanta-bg",
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0xffffff,
          backgroundColor: 0x248da4,
          points: 9.0,
          maxDistance: 22.0,
          spacing: 16.0,
          showDots: true,
        });

        // Restore original console.warn
        console.warn = originalWarn;
      }
    };

    requestAnimationFrame(loadVanta);

    return () => {
      if (effect) effect.destroy();
    };
  }, []);

  return (
    <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE}>
      <div
        id="vanta-bg"
        className="dark max-h-screen bg-primary overflow-y-auto"
      >
        {/* <ModalResetPassword
          isOpen={isResetModal}
          handleClose={handleResetPasswordBtn}
        /> */}
        <div className="flex flex-col items-center justify-center h-screen">
          <div
            className="w-full max-w-md space-y-6 p-10 rounded-2xl shadow-xl border border-white/20 bg-white/10 backdrop-blur-md mx-auto"
            style={{ width: "min(90%, 600px)" }}
          >
            <div className="flex justify-center">
              <img
                src={fullsuiteLogo}
                alt="Logo"
                className="h-15 cursor-pointer"
                onClick={() => navigate("/")}
              />
            </div>
            <div className="flex flex-col items-center  mb-10">
              <p className=" text-lg  text-white">
                Welcome,{" "}
                <span className="font-avenir-roman-oblique">Suitelifer!</span>
              </p>
              <p className="text-sm  text-white/50">Enter to empower.</p>
            </div>
            <LoginForm
              email={email}
              password={password}
              setEmail={setEmail}
              setPassword={setPassword}
            />
          </div>
        </div>
      </div>
    </GoogleReCaptchaProvider>
  );
};

export default Login;
