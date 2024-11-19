import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../../../Firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import HeaderAdmin from "../header/headeradmin";
import "./especies.css";
import { FaRegArrowAltCircleLeft } from "react-icons/fa";

function Especies() {
  const [bitacora, setBitacora] = useState(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const location = useLocation();
  const { bitacora: bitacoraState } = location.state || {};

  // Función para obtener las especies de la subcolección "especies"
  const getEspecies = async (bitacoraId) => {
    try {
      const especiesRef = collection(db, "Bitacora", bitacoraId, "especies"); // Accede a la subcolección
      const querySnapshot = await getDocs(especiesRef);

      const especiesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBitacora((prevBitacora) => ({
        ...prevBitacora,
        especies: especiesData,
      }));
    } catch (error) {
      console.error("Error al obtener las especies:", error);
    }
  };

  useEffect(() => {
    if (bitacoraState && bitacoraState.id) {
      setBitacora(bitacoraState); // Configura el estado inicial de bitacora
      getEspecies(bitacoraState.id); // Llama a la función para obtener las especies
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
    navigate("/admin/CyEespecies", { state: { bitacora: bitacora } });
  };

  const handleCardClick = (especie) => {
    navigate("/admin/detalles", {
      state: { especie: especie, bitacora: bitacora },
    });
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
        <button
          className="CyE-admin-dash-submit-btn"
          onClick={() => navigate("/admin/bitacora")}
        >
          <FaRegArrowAltCircleLeft /> Volver
        </button>

        {bitacora ? (
          <>
            <div className="bitacora-container">
              {/* Contenedor para la imagen y la información */}

              <div className="especies-bitacora-info">
                <h2 className="especies-titulo">
                  {bitacora
                    ? `Bitacora llamada: ${bitacora.titulo}`
                    : "Cargando..."}
                </h2>
                <p>Clima: {bitacora.clima}</p>
                <p>Habitad: {bitacora.habitad}</p>
                <p>Localización: {bitacora.localizacion}</p>
                <p>Detalles: {bitacora.detalles}</p>
                <p>Fecha: {bitacora.fecha}</p>
                <p>Hora: {bitacora.hora}</p>
              </div>

              <div className="bitacora-img-container">
                <img
                  src={bitacora.img}
                  alt="Imagen de la bitácora"
                  className="bitacora-img"
                />
              </div>
            </div>
          </>
        ) : (
          <p>Cargando datos de la bitácora...</p>
        )}

        <hr />

        {/* Contenedor de especies */}
        <div className="especies-bitacora-section-wrapper">
          <h2>Especies Registradas</h2>
          {/* Botón para crear una nueva especie */}
          <button
            className="especies-create-bitacora-btn"
            onClick={handleCreateBitacora}
          >
            Añadir Especie
          </button>
          <div className="especies-bitacora-grid-container">
            {bitacora && bitacora.especies && bitacora.especies.length > 0 ? (
              bitacora.especies.map((especie) => (
                <div
                  className="especie-card"
                  key={especie.id}
                  onClick={() => handleCardClick(especie)}
                >
                  <img
                    src={especie.img || "https://via.placeholder.com/150"}
                    alt={especie.nombre_comun}
                    className="especie-img"
                  />
                  <div className="especie-info">
                    <h5>{especie.nombre_comun}</h5>
                    <p>
                      <strong>Nombre científico:</strong>{" "}
                      {especie.nombre_cientifico}
                    </p>
                    <p>
                      <strong>Familia:</strong> {especie.familia}
                    </p>
                    <p>
                      <strong>Estado:</strong> {especie.estado}
                    </p>
                    <p>
                      <strong>Cantidad de muestras:</strong>{" "}
                      {especie.cantidad_muestras}
                    </p>
                    <p>{especie.descripcion}</p>
                  </div>
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
