import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HeaderAdmin from "../header/headeradmin";
import "./especies.css";

function Especies() {
  const [bitacora, setBitacora] = useState(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const location = useLocation();
  const { bitacora: bitacoraState } = location.state || {};

  useEffect(() => {
    if (bitacoraState && bitacoraState.id) {
      setBitacora(bitacoraState);
    } else {
      console.error("bitacoraState no está disponible o no tiene un id válido");
    }
  }, [bitacoraState]);

  const toggleHeader = () => {
    setIsHeaderVisible(!isHeaderVisible);
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 300);
  };

  const navigate = useNavigate();

  const handleCreateBitacora = () => {
    navigate("/admin/CyEespecies");
  };

  return (
    <div
      className={`especies-admin-container ${
        isHeaderVisible ? "header-visible" : "header-hidden"
      }`}
    >
      <div className="especies-sidebar"></div>
      <button className="especies-toggle-header-btn" onClick={toggleHeader}>
        ☰
      </button>

      <HeaderAdmin isVisible={isHeaderVisible} />

      <div className="especies-admin-dashboard">
        <h2 className="especies-titulo">
          {bitacora ? `Bitacora llamada: ${bitacora.titulo}` : "Cargando..."}
        </h2>
        {bitacora ? (
          <>
            <p>Clima: {bitacora.clima}</p>
            <p>Habitad: {bitacora.habitad}</p>
            <p>Localización: {bitacora.localizacion}</p>
            <p>Detalles: {bitacora.detalles}</p>
            <p>Fecha: {bitacora.fecha}</p>
            <p>Hora: {bitacora.hora}</p>
            <img src={bitacora.img} alt="Imagen de la bitácora" />
          </>
        ) : (
          <p>Cargando datos de la bitácora...</p>
        )}

        {/* Botón para crear una nueva especie */}
        <button
          className="especies-create-bitacora-btn"
          onClick={handleCreateBitacora}
        >
          Añadir Especie
        </button>

        {/* Contenedor de especies */}
        <div className="especies-bitacora-section-wrapper">
          <h2>Especies</h2>
          <div className="especies-bitacora-grid-container">
            {bitacora && bitacora.especies && bitacora.especies.length > 0 ? (
              bitacora.especies.map((especie) => (
                <div className="especie-item" key={especie.id}>
                  <h5>{especie.nombre}</h5>
                  <p>{especie.descripcion}</p>
                </div>
              ))
            ) : (
              <p>No hay especies registradas.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Especies;
