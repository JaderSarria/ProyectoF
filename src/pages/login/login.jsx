import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../Firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Limpiar el mensaje de error previo

    // Validaciones básicas
    if (!email || !password) {
      setError("Por favor, llena todos los campos.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const role = await getRole(user.uid);

      if (role === "administrador") {
        navigate("/ppalAdmin", { replace: true });
      } else if (role === "investigador") {
        navigate("/ppalInv", { replace: true });
      } else if (role === "colaborador") {
        navigate("/ppalColab", { replace: true });
      }
    } catch (err) {
      // Manejo de errores comunes de Firebase
      handleAuthError(err.code);
    }
  };

  const getRole = async (uid) => {
    const userDocRef = doc(db, "usuarios", uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const role = userDoc.data().rol;
      return role;
    } else {
      throw new Error("Usuario no encontrado en la base de datos.");
    }
  };

  const handleAuthError = (errorCode) => {
    console.error("Código de error recibido:", errorCode); // Para depuración

    switch (errorCode) {
      case "auth/invalid-email":
        setError("El correo electrónico no es válido.");
        break;
      case "auth/user-disabled":
        setError("Este usuario ha sido deshabilitado.");
        break;
      case "auth/user-not-found":
        setError("Usuario no encontrado. Verifica tus credenciales.");
        break;
      case "auth/wrong-password":
        setError("Contraseña incorrecta. Inténtalo nuevamente.");
        break;
      default:
        setError("Ocurrió un error inesperado. Por favor, intenta nuevamente.");
        break;
    }
  };  

  return (
    <div className="envoltura-login">
      <div className="contenedor-login">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="campo-entrada"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="campo-entrada"
          />
          <div className="opciones">
            <label className="contenedor-checkbox">
              <input type="checkbox" className="checkbox-personalizado" />
              <span className="marca"></span>
              Recuérdame
            </label>
            <a href="#" className="contrasena-olvidada">
              Olvidé mi Contraseña
            </a>
          </div>
          <button type="submit" className="boton-login">
            Login
          </button>
        </form>
        {error && <p className="mensaje-error">{error}</p>}
        <p className="enlace-registro">
          ¿No tienes cuenta?
          <Link to="/register"> Regístrate</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
