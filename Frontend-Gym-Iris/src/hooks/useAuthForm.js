import { useState } from "react";
import { saveUserSession } from "../services/session/userSessionService";

const AUTH_MODE = {
  LOGIN: "login",
  REGISTER: "register",
};

export const useAuthForm = ({ navigate } = {}) => {
  const [mode, setMode] = useState(AUTH_MODE.LOGIN);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const isLogin = mode === AUTH_MODE.LOGIN;

  const toggleMode = () => {
    setMode((currentMode) =>
      currentMode === AUTH_MODE.LOGIN ? AUTH_MODE.REGISTER : AUTH_MODE.LOGIN,
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    saveUserSession({
      email,
      name: name || "Usuario",
    });

    if (navigate) {
      navigate("/dashboard");
    }
  };

  return {
    isLogin,
    email,
    password,
    name,
    setEmail,
    setPassword,
    setName,
    toggleMode,
    handleSubmit,
  };
};
