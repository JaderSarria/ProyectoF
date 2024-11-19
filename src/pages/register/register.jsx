import React, { useState } from "react";
import { auth, db } from "../../Firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./registro.css";

function RegistroUsuario() {
  const [correo, setCorreo] = useState("");
  const [nombre, setNombre] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [rol, setRol] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        correo,
        contrasena
      );

      const userDocRef = doc(db, "usuarios", userCredential.user.uid);
      await setDoc(userDocRef, {
        nombre,
        correo,
        rol,
        fechaCreacion: new Date(),
        permisoEspecial: "no",
      });

      navigate("/");
    } catch (error) {
      setError("Hubo un problema al registrarse: " + error.message);
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="envoltura-registro">
      <div className="contenedor-registro">
        <h2>Registro</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="entrada-registro"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            type="email"
            className="entrada-registro"
            placeholder="Correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          <input
            type="password"
            className="entrada-registro"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
          <p className="seleccion-rol">Selecciona el rol</p>
          <div className="opciones-rol">
            <label className="rol-checkbox">
              <input
                type="radio"
                className="checkbox-rol"
                name="rol"
                value="administrador"
                checked={rol === "administrador"}
                onChange={(e) => setRol(e.target.value)}
                required
              />
              <span className="marca-rol"></span> Administrador
            </label>
            <label className="rol-checkbox">
              <input
                type="radio"
                className="checkbox-rol"
                name="rol"
                value="investigador"
                checked={rol === "investigador"}
                onChange={(e) => setRol(e.target.value)}
                required
              />
              <span className="marca-rol"></span> Investigador
            </label>
            <label className="rol-checkbox">
              <input
                type="radio"
                className="checkbox-rol"
                name="rol"
                value="colaborador"
                checked={rol === "colaborador"}
                onChange={(e) => setRol(e.target.value)}
                required
              />
              <span className="marca-rol"></span> Colaborador
            </label>
          </div>
          <button type="submit" className="boton-registro">
            Registrarse
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
        <button onClick={handleBackToHome} className="boton-volver">
          Volver al Inicio
        </button>
      </div>
    </div>
  );
}

export default RegistroUsuario;
