import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaHome,
  FaClipboardList,
  FaUsers,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa"; // Importa los iconos
import "./HeaderAdmin.css";

function HeaderAdmin({ isVisible }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Sesión cerrada");
    navigate("/"); // Redirige al inicio cuando se cierra sesión
  };

  return (
    <header className={`admin-header ${isVisible ? "visible" : "hidden"}`}>
      <div className="aaa">
        <h1>Bienvenido Administrador</h1>
        <nav className="admin-nav">
          <ul>
            <li>
              <Link to="/ppalAdmin">
                <FaHome /> Inicio
              </Link>
            </li>
            <li>
              <Link to="/admin/bitacora">
                <FaClipboardList /> Bitácoras
              </Link>
            </li>
            <li>
              <Link to="/admin/users">
                <FaUsers /> Usuarios
              </Link>
            </li>
            <li>
              <Link to="/configuracion">
                <FaCog /> Configuración
              </Link>
            </li>
          </ul>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Cerrar sesión
          </button>
        </nav>
      </div>
    </header>
  );
}

export default HeaderAdmin;
