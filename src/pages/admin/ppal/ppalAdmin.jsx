import React, { useEffect, useState } from "react";
import { db } from "../../../Firebase/firebaseConfig";
import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";
import HeaderAdmin from "../header/headeradmin";
import "./PpalAdmin.css";

function PpalAdmin() {
  const [recentBitacoras, setRecentBitacoras] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  // Function to fetch recent plants from Firestore
  const getRecentBitacoras = async () => {
    const bitacorasRef = collection(db, "Bitacora");
    const bitacorasQuery = query(
      bitacorasRef,
      orderBy("fechaCreacion", "desc"),
      limit(5)
    );
    const querySnapshot = await getDocs(bitacorasQuery);

    const bitacorasData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setRecentBitacoras(bitacorasData);
  };

  // Function to fetch recent users from Firestore
  const getRecentUsers = async () => {
    const usersRef = collection(db, "usuarios");
    const usersQuery = query(
      usersRef,
      orderBy("fechaCreacion", "desc"),
      limit(5)
    );
    const querySnapshot = await getDocs(usersQuery);

    const usersData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setRecentUsers(usersData);
  };

  useEffect(() => {
    getRecentBitacoras();
    getRecentUsers();
  }, []);

  // Function to toggle header visibility
  const toggleHeader = () => {
    setIsHeaderVisible(!isHeaderVisible);
    setTimeout(() => {
      window.dispatchEvent(new Event("resize")); // Force layout recalculation
    }, 300); // Matches CSS transition time
  };

  return (
    <div
      className={`admin-container ${
        isHeaderVisible ? "header-visible" : "header-hidden"
      }`}
    >
      <div className="sidebar"></div>
      <button className="toggle-header-btn" onClick={toggleHeader}>
        ☰
      </button>

      <HeaderAdmin isVisible={isHeaderVisible} />

      <div className="admin-dashboard">
        <h2 className="titulo">Panel de Control</h2>

        {/* Contenedor de últimas bitácoras registradas */}
        <div className="recent-section">
          <h2>Últimas Bitácoras Registradas</h2>
          <div className="card-container">
            <div className="card-row">
              {recentBitacoras.map((bitacora) => (
                <div className="card" key={bitacora.id}>
                  <h3>{bitacora.titulo || "Título Desconocido"}</h3>
                  <p>Clima: {bitacora.clima}</p>
                  <p>Habitad: {bitacora.habitad}</p>
                  <p>Localización: {bitacora.localizacion}</p>
                  <p>
                    Fecha de creación:{" "}
                    {new Date(
                      bitacora.fechaCreacion.seconds * 1000
                    ).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contenedor de últimos usuarios agregados */}
        <div className="recent-section">
          <h2>Últimos Usuarios Agregados</h2>
          <div className="card-container">
            <div className="card-row">
              {recentUsers.map((user) => (
                <div className="card" key={user.id}>
                  <h3>{user.nombre || "Usuario Desconocido"}</h3>
                  <p>Correo: {user.correo}</p>
                  <p>Rol: {user.rol}</p>
                  <p>
                    Fecha de creación:{" "}
                    {new Date(
                      user.fechaCreacion.seconds * 1000
                    ).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PpalAdmin;
