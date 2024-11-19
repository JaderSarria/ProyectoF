import React, { useEffect, useState } from "react";
import { db } from "../../../Firebase/firebaseConfig";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import HeaderAdmin from "../header/headeradmin";
import "./BitAdmin.css";
import { FiEdit } from "react-icons/fi";
import { MdOutlineManageAccounts } from "react-icons/md";
import { useNavigate } from "react-router-dom";

function BitAdmin() {
  const [recentPlants, setRecentPlants] = useState([]);
  const [bitacoras, setBitacoras] = useState([]);
  const [filteredBitacoras, setFilteredBitacoras] = useState([]);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const handleEditBitacora = (bitacoraId) => {
    const bitacoraToEdit = filteredBitacoras.find(
      (bitacora) => bitacora.id === bitacoraId
    );
    navigate("/admin/CyEbitacora", { state: { bitacora: bitacoraToEdit } });
  };

  const handleManageBitacora = (bitacoraId) => {
    const bitacoraToEdit = filteredBitacoras.find(
      (bitacora) => bitacora.id === bitacoraId
    );
    console.log("Bitacora a gestionar:", bitacoraToEdit); // Verifica si está correcto
    navigate("/admin/especies", { state: { bitacora: bitacoraToEdit } });
  };

  // Estado para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: null,
    end: null,
  });
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedClima, setSelectedClima] = useState("");
  const [sortOption, setSortOption] = useState("fecha"); // Por defecto por fecha
  const [filtersVisible, setFiltersVisible] = useState(false); // Estado para mostrar/ocultar filtros


  // Función para obtener todas las bitácoras
  const getBitacoras = async () => {
    const bitacorasRef = collection(db, "Bitacora");
    const bitacorasQuery = query(
      bitacorasRef,
      orderBy("fechaCreacion", "desc")
    );
    const querySnapshot = await getDocs(bitacorasQuery);

    const bitacorasData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setBitacoras(bitacorasData);
    setFilteredBitacoras(bitacorasData); // Inicializamos con todas las bitácoras
  };

  useEffect(() => {
    getBitacoras();
  }, []);

  // Función para aplicar los filtros de búsqueda
  const filterBitacoras = () => {
    let filtered = [...bitacoras];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter((bitacora) =>
        bitacora.titulo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por fecha
    if (selectedDateRange.start && selectedDateRange.end) {
      filtered = filtered.filter((bitacora) => {
        const bitacoraDate = new Date(bitacora.fechaCreacion.seconds * 1000);
        return (
          bitacoraDate >= selectedDateRange.start &&
          bitacoraDate <= selectedDateRange.end
        );
      });
    }

    // Filtrar por localización
    if (selectedLocation) {
      filtered = filtered.filter((bitacora) =>
        bitacora.localizacion
          .toLowerCase()
          .includes(selectedLocation.toLowerCase())
      );
    }

    // Filtrar por clima
    if (selectedClima) {
      filtered = filtered.filter((bitacora) =>
        bitacora.clima.toLowerCase().includes(selectedClima.toLowerCase())
      );
    }

    // Ordenar bitácoras
    if (sortOption === "fecha") {
      filtered = filtered.sort((a, b) => {
        return (
          new Date(b.fechaCreacion.seconds * 1000) -
          new Date(a.fechaCreacion.seconds * 1000)
        );
      });
    } else if (sortOption === "lugar") {
      filtered = filtered.sort((a, b) =>
        a.localizacion.localeCompare(b.localizacion)
      );
    }

    setFilteredBitacoras(filtered);
  };

  useEffect(() => {
    filterBitacoras();
  }, [
    searchTerm,
    selectedDateRange,
    selectedLocation,
    selectedClima,
    sortOption,
  ]);

  // Toggle para el header
  const toggleHeader = () => {
    setIsHeaderVisible(!isHeaderVisible);
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 300);
  };

  const navigate = useNavigate();

  const handleCreateBitacora = () => {
    // Realiza cualquier lógica adicional antes de redirigir, si es necesario
    navigate("/admin/CyEbitacora");
  };

  // Toggle para mostrar/ocultar los filtros
  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
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
        <h2 className="titulo">Gestión De Bitácoras</h2>

        {/* Barra de búsqueda */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Botón para mostrar/ocultar filtros */}
        <button className="toggle-filters-btn" onClick={toggleFilters}>
          {filtersVisible ? "Ocultar Filtros" : "Mostrar Filtros"}
        </button>

        {/* Contenedor de filtros, solo visible si filtersVisible es true */}
        {filtersVisible && (
          <div className="filters">
            <label>Fecha de Inicio:</label>
            <input
              type="date"
              onChange={(e) =>
                setSelectedDateRange({
                  ...selectedDateRange,
                  start: new Date(e.target.value),
                })
              }
            />

            <label>Fecha de Fin:</label>
            <input
              type="date"
              onChange={(e) =>
                setSelectedDateRange({
                  ...selectedDateRange,
                  end: new Date(e.target.value),
                })
              }
            />

            <input
              type="text"
              placeholder="Filtrar por localización"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            />

            <input
              type="text"
              placeholder="Filtrar por clima"
              value={selectedClima}
              onChange={(e) => setSelectedClima(e.target.value)}
            />

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="fecha">Ordenar por fecha</option>
              <option value="lugar">Ordenar por lugar</option>
            </select>
          </div>
        )}

        {/* Botón para crear una nueva bitácora */}
        <button className="create-bitacora-btn" onClick={handleCreateBitacora}>
          Crear Nueva Bitácora
        </button>

        {/* Contenedor de todas las bitácoras */}
        <div className="xyz_bitacora_section_wrapper">
          <h2>Bitácoras</h2>
          <div className="xyz_bitacora_grid_container">
            {filteredBitacoras.map((bitacora) => (
              <div className="xyz_bitacora_item_box" key={bitacora.id}>
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
                <div className="button-group">
                  <button
                    className="edit-btn"
                    onClick={() => handleEditBitacora(bitacora.id)}
                    title="Editar bitácora"
                  >
                    <FiEdit />
                  </button>
                  <button
                    className="manage-btn"
                    onClick={() => handleManageBitacora(bitacora.id)}
                    title="Gestionar bitácora"
                  >
                    <MdOutlineManageAccounts />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BitAdmin;
