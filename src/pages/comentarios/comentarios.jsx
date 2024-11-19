import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HeaderAdmin from "../admin/header/headeradmin";
import "./Comentarios.css";
import { FaRegArrowAltCircleLeft } from "react-icons/fa";
import { db } from "../../Firebase/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  doc as firestoreDoc,
  getDoc as firestoreGetDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

function Comentarios() {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const location = useLocation();
  const { especie, bitacora } = location.state || {};

  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    if (especie?.img?.length > 0) {
      setSelectedImage(especie.img[0]); // Establece la primera imagen como predeterminada
    }
  }, [especie]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getComentarios = async (bitacoraId, especieId) => {
    setIsLoading(true);
    try {
      const comentariosRef = collection(
        db,
        "Bitacora",
        bitacoraId,
        "especies",
        especieId,
        "comentarios"
      );
      const querySnapshot = await getDocs(comentariosRef);

      const comentariosData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const comentarioData = doc.data();
          const usuarioId = comentarioData.usuarioId;

          try {
            const usuarioRef = firestoreDoc(db, "usuarios", usuarioId);
            const usuarioSnap = await firestoreGetDoc(usuarioRef);

            let usuario = "Usuario desconocido";
            let rol = "Desconocido";

            if (usuarioSnap.exists()) {
              const usuarioData = usuarioSnap.data();
              usuario = usuarioData.nombre;
              rol = usuarioData.rol || "No asignado";
            }

            return {
              id: doc.id,
              comentario: comentarioData.comentario,
              fecha: comentarioData.fecha,
              usuario: `${usuario} (${rol})`,
            };
          } catch (error) {
            console.error("Error al obtener el usuario:", error);
            return {
              id: doc.id,
              comentario: comentarioData.comentario,
              fecha: comentarioData.fecha,
              usuario: "Usuario desconocido (Desconocido)",
            };
          }
        })
      );

      const comentariosOrdenados = comentariosData.sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      );

      setComentarios(comentariosOrdenados);
    } catch (error) {
      console.error("Error al obtener comentarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const agregarComentario = async () => {
    if (nuevoComentario.trim() === "") {
      alert("Por favor ingrese un comentario.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Debes iniciar sesión para comentar");
      return;
    }

    try {
      const comentariosRef = collection(
        db,
        "Bitacora",
        bitacora.id,
        "especies",
        especie.id,
        "comentarios"
      );

      await addDoc(comentariosRef, {
        comentario: nuevoComentario,
        fecha: new Date().toISOString(),
        usuarioId: user.uid,
      });

      setNuevoComentario("");
      await getComentarios(bitacora.id, especie.id);
    } catch (error) {
      console.error("Error al agregar comentario:", error);
      alert("Error al agregar el comentario");
    }
  };

  useEffect(() => {
    if (bitacora && especie) {
      getComentarios(bitacora.id, especie.id);
    }
  }, [bitacora, especie]);

  if (!especie || !bitacora) {
    return <p>Datos de la especie o bitácora no encontrados.</p>;
  }

  const handleEdit = () => {
    navigate("/admin/CyEespecies", { state: { especie, bitacora } });
  };

  const handleCreateBitacora = () => {
    navigate("/admin/especies", { state: { bitacora: bitacora } });
  };

  return (
    <div
      className={`layout-container ${
        isHeaderVisible ? "layout-expanded" : "layout-collapsed"
      }`}
    >
      <div className="layout-sidebar"></div>

      <button
        className="nav-toggle-btn"
        onClick={() => setIsHeaderVisible(!isHeaderVisible)}
      >
        ☰
      </button>

      <HeaderAdmin isVisible={isHeaderVisible} />

      <div className="main-content">
        <button className="back-btn" onClick={handleCreateBitacora}>
          <FaRegArrowAltCircleLeft /> Volver
        </button>
        <button className="editt-btn" onClick={handleEdit}>
          Editar
        </button>

        <div className="content-wrapper">
          <div className="species-details">
            <h2 className="content-title">Detalles de la Especie</h2>
            <div className="species-card" key={especie.id}>
              <div className="image-container">
                <img
                  src={
                    selectedImage ||
                    especie?.img?.[0] ||
                    "https://via.placeholder.com/150"
                  }
                  alt={especie?.nombre_comun || "Imagen no disponible"}
                  className="large-image"
                />

                <div className="thumbnail-container">
                  {especie?.img?.length > 0 ? (
                    especie.img.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`${especie.nombre_comun || "Imagen"} ${index + 1}`}
                        className={`thumbnail ${
                          selectedImage === img ? "active-thumbnail" : ""
                        }`}
                        onClick={() => setSelectedImage(img)}
                      />
                    ))
                  ) : (
                    <p>No hay imágenes disponibles.</p>
                  )}
                </div>
              </div>
              <div className="card-content">
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
              </div>
            </div>
          </div>
        </div>

        <hr />

        <div className="comentarios-container">
          <h2 className="comentarios-titulo">Comentarios</h2>
          <div className="nuevo-comentario-container">
            <textarea
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              placeholder="Escribe tu comentario..."
              className="comentario-input"
            ></textarea>
            <button
              onClick={agregarComentario}
              className="agregar-comentario-btn"
            >
              Agregar Comentario
            </button>
          </div>

          {isLoading ? (
            <p>Cargando comentarios...</p>
          ) : comentarios.length > 0 ? (
            <ul className="comentarios-list">
              {comentarios.map((comentarioDoc) => (
                <li key={comentarioDoc.id} className="comentario-item">
                  <p>
                    <strong>{comentarioDoc.usuario}:</strong>{" "}
                    {comentarioDoc.comentario}
                  </p>
                  <p className="fecha-comentario">
                    {formatDate(comentarioDoc.fecha)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay comentarios disponibles.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Comentarios;
