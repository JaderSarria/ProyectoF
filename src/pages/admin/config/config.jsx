import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import HeaderAdmin from "../header/headeradmin";
import "./Config.css";
import { getAuth, updatePassword } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

function Config() {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [userData, setUserData] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const toggleHeader = () => {
    setIsHeaderVisible(!isHeaderVisible);
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 300);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const db = getFirestore();
      const user = auth.currentUser;

      if (user) {
        try {
          const userDocRef = doc(db, "usuarios", user.uid); // Buscar en la colección "usuarios" por el UID
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserData(userDoc.data()); // Establecer los datos del usuario
          } else {
            console.error("No se encontró información para este usuario.");
          }
        } catch (error) {
          console.error("Error al obtener los datos del usuario:", error);
        }
      } else {
        console.error("No hay un usuario autenticado.");
      }
    };

    fetchUserData();
  }, []);

  const handlePasswordChange = async () => {
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    if (user) {
      try {
        // Actualizar la contraseña en Firebase Authentication
        await updatePassword(user, newPassword);

        // Actualizar la contraseña en la colección `usuarios` (si es necesario)
        const userDocRef = doc(db, "usuarios", user.uid);
        await updateDoc(userDocRef, { password: newPassword }); // Solo si guardas la contraseña ahí

        setMessage("Contraseña actualizada con éxito.");
      } catch (error) {
        console.error("Error al actualizar la contraseña:", error);
        setMessage("Error al actualizar la contraseña: " + error.message);
      }
    } else {
      setMessage("No hay un usuario autenticado.");
    }
  };

  return (
    <div
      className={`config-wrapper ${
        isHeaderVisible ? "show-header" : "hide-header"
      }`}
    >
      <HeaderAdmin isVisible={isHeaderVisible} />

      <div className="config-main">
        <h2 className="config-heading">Configuración</h2>

        <div className="config-section">
          <h2>Información Personal</h2>
          <div className="config-grid">
            {userData ? (
              <div className="user-info">
                <p>
                  <strong>Nombre:</strong> {userData.nombre || "Sin nombre"}
                </p>
                <p>
                  <strong>Email:</strong> {userData.correo || "Sin correo"}
                </p>
                <p>
                  <strong>Rol:</strong> {userData.rol || "Sin rol"}
                </p>
              </div>
            ) : (
              <p>Cargando información del usuario...</p>
            )}
          </div>
        </div>

        {/* Cambiar contraseña */}
        <div className="config-section">
          <h2>Cambiar Contraseña</h2>
          <div className="password-change">
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="password-input"
            />
            <button onClick={handlePasswordChange} className="password-btn">
              Cambiar Contraseña
            </button>
            {message && <p className="password-message">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Config;
