import React, { useState, useEffect } from "react";
import { db, storage } from "../../../Firebase/firebaseConfig";
import { useNavigate, useLocation } from "react-router-dom";
import HeaderAdmin from "../header/headeradmin";
import "./CyEBitacora.css";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Importación necesaria
import { doc, updateDoc, deleteDoc } from "firebase/firestore"; // Importar updateDoc para editar un documento
import { FaTrash, FaRegArrowAltCircleLeft, FaSave } from "react-icons/fa";

function CyEBitacora() {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [formData, setFormData] = useState({
    titulo: "",
    fecha: "",
    hora: "",
    clima: "",
    habitad: "",
    localizacion: "",
    img: null,
    detalles: "",
    observaciones: "",
  });
  const [imgPreview, setImgPreview] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { bitacora } = location.state || {}; // Desestructuramos la bitacora del state

  useEffect(() => {
    if (bitacora) {
      // Si la bitacora existe, configura los datos del formulario
      setFormData({
        titulo: bitacora.titulo || "",
        fecha: bitacora.fecha || "",
        hora: bitacora.hora || "",
        clima: bitacora.clima || "",
        habitad: bitacora.habitad || "",
        localizacion: bitacora.localizacion || "",
        img: bitacora.img || null,
        detalles: bitacora.detalles || "",
        observaciones: bitacora.observaciones || "",
      });
      setImgPreview(bitacora.img || null); // Previsualización de la imagen
    } else {
      console.log("No se pasó la bitacora correctamente.");
    }
  }, [bitacora]);

  const toggleHeader = () => {
    setIsHeaderVisible(!isHeaderVisible);
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 300);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgPreview(reader.result);
        setFormData({ ...formData, img: file }); // Guardamos el archivo de imagen
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejo del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Subir la imagen a Firebase Storage y guardar los datos en Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imgURL = formData.img || ""; // Se usa la imagen existente si no se sube una nueva

      // Si se sube una nueva imagen, la almacenamos en Firebase Storage
      if (formData.img && formData.img !== bitacora.img) {
        const imgRef = ref(storage, `bitacoras/${formData.img.name}`);
        await uploadBytes(imgRef, formData.img);
        imgURL = await getDownloadURL(imgRef); // Obtenemos la URL de la imagen
      }

      // Actualizar los datos en Firestore si la bitacora ya existe
      if (bitacora) {
        const bitacoraRef = doc(db, "Bitacora", bitacora.id); // Usamos el ID de la bitacora para encontrarla en Firestore
        await updateDoc(bitacoraRef, {
          titulo: formData.titulo,
          fecha: formData.fecha,
          hora: formData.hora,
          clima: formData.clima,
          habitad: formData.habitad,
          localizacion: formData.localizacion,
          img: imgURL, // Usamos la URL de la imagen si se subió una nueva
          detalles: formData.detalles,
          observaciones: formData.observaciones,
          fechaCreacion: new Date(),
        });
      }

      // Resetear el formulario después de guardar
      setFormData({
        titulo: "",
        fecha: "",
        hora: "",
        clima: "",
        habitad: "",
        localizacion: "",
        img: null,
        detalles: "",
        observaciones: "",
      });
      setImgPreview(null); // Limpiar la previsualización de la imagen
      alert("Bitácora actualizada exitosamente");
      navigate("/admin/bitacora"); // Redirige a la página de administración de bitácoras
    } catch (error) {
      console.error("Error al editar la bitácora: ", error);
      alert("Hubo un error al actualizar la bitácora.");
    }
  };

  // Función para eliminar la bitácora
  const handleDelete = async () => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar esta bitácora?")
    ) {
      try {
        const bitacoraRef = doc(db, "Bitacora", bitacora.id); // Referencia de la bitacora a eliminar
        await deleteDoc(bitacoraRef); // Eliminar documento
        alert("Bitácora eliminada exitosamente");
        navigate("/admin/bitacora"); // Redirigir a la lista de bitácoras
      } catch (error) {
        console.error("Error al eliminar la bitácora: ", error);
        alert("Hubo un error al eliminar la bitácora.");
      }
    }
  };

  return (
    <div
      className={`bitacora-admin-container ${
        !isHeaderVisible ? "bitacora-header-visible" : "bitacora-header-hidden"
      }`}
    >
      <div className="bitacora-sidebar"></div>
      <button className="bitacora-toggle-header-btn" onClick={toggleHeader}>
        ☰
      </button>

      <HeaderAdmin isVisible={!isHeaderVisible} />

      <div className="bitacora-admin-dashboard">
        <button
          className="bitacora-submit-btn"
          onClick={() => navigate("/admin/bitacora")}
        >
          <FaRegArrowAltCircleLeft /> Volver
        </button>
        <h2 className="bitacora-title">Editar Bitácora</h2>

        <div className="bitacora-section">
          <div className="bitacora-grid">
            <form className="bitacora-form" onSubmit={handleSubmit}>
              <div className="bitacora-form-group">
                <label>Título:</label>
                <input
                  type="text"
                  name="titulo"
                  placeholder="Ingrese el título"
                  className="bitacora-input"
                  value={formData.titulo}
                  onChange={handleInputChange}
                />
              </div>

              <div className="bitacora-form-row">
                <div className="bitacora-form-group">
                  <label>Fecha:</label>
                  <input
                    type="date"
                    name="fecha"
                    className="bitacora-input"
                    value={formData.fecha}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="bitacora-form-group">
                  <label>Hora:</label>
                  <input
                    type="time"
                    name="hora"
                    className="bitacora-input"
                    value={formData.hora}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="bitacora-form-group">
                <label>Clima:</label>
                <input
                  type="text"
                  name="clima"
                  placeholder="Describa el clima"
                  className="bitacora-input"
                  value={formData.clima}
                  onChange={handleInputChange}
                />
              </div>

              <div className="bitacora-form-group">
                <label>Hábitat:</label>
                <input
                  type="text"
                  name="habitad"
                  placeholder="Describa el hábitat"
                  className="bitacora-input"
                  value={formData.habitad}
                  onChange={handleInputChange}
                />
              </div>

              <div className="bitacora-form-group">
                <label>Localización:</label>
                <input
                  type="text"
                  name="localizacion"
                  placeholder="Ingrese la localización"
                  className="bitacora-input"
                  value={formData.localizacion}
                  onChange={handleInputChange}
                />
              </div>

              <div className="bitacora-form-group">
                <label>Imagen:</label>
                <input
                  type="file"
                  name="img"
                  accept="image/*"
                  className="bitacora-input"
                  onChange={handleImageChange}
                />
                {imgPreview && (
                  <img
                    src={imgPreview}
                    alt="Previsualización"
                    className="img-preview"
                  />
                )}
              </div>

              <div className="bitacora-form-group">
                <label>Detalles:</label>
                <textarea
                  name="detalles"
                  placeholder="Detalles sobre el muestreo"
                  className="bitacora-textarea"
                  value={formData.detalles}
                  onChange={handleInputChange}
                />
              </div>

              <div className="bitacora-form-group">
                <label>Observaciones:</label>
                <textarea
                  name="observaciones"
                  placeholder="Observaciones adicionales"
                  className="bitacora-textarea"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                />
              </div>

              <div className="bitacora-form-group">
                <button type="submit" className="bitacora-submit-btn">
                  <FaSave /> Guardar Cambios
                </button>
              </div>
              {bitacora && (
                <div className="bitacora-form-group">
                  <button
                    type="button"
                    className="bitacora-delete-btn"
                    onClick={handleDelete}
                  >
                    <FaTrash /> Eliminar Bitácora
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CyEBitacora;
