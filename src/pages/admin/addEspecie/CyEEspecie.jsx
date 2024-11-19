import React, { useState, useEffect } from "react";
import { db, storage } from "../../../Firebase/firebaseConfig";
import { useNavigate, useLocation } from "react-router-dom";
import HeaderAdmin from "../header/headeradmin";
import "./CyEEspecie.css";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { FaSave, FaRegArrowAltCircleLeft, FaTrash } from "react-icons/fa";

function CyEEspecie() {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [imgPreview, setImgPreview] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { especie } = location.state || {};
  const { bitacora } = location.state || {};

  const [formData, setFormData] = useState({
    nombre_cientifico: "",
    nombre_comun: "",
    cantidad_muestras: "",
    estado: "",
    familia: "",
    img: [],
    descripcion: "",
  });

  useEffect(() => {
    if (especie) {
      setFormData({
        nombre_comun: especie.nombre_comun || "",
        nombre_cientifico: especie.nombre_cientifico || "",
        familia: especie.familia || "",
        estado: especie.estado || "",
        cantidad_muestras: especie.cantidad_muestras || "",
        img: especie.img || [],
        descripcion: especie.descripcion || "",
      });
      setImgPreview(especie.img || []); // Mostrar imagen existente
    }
  }, [especie]);

  const toggleHeader = () => {
    setIsHeaderVisible(!isHeaderVisible);
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 300);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files); // Convertir archivos a un arreglo
    const newPreviews = files.map((file) => URL.createObjectURL(file)); // Crear previsualizaciones

    // Mantener las imágenes previas y agregar las nuevas
    setImgPreview((prevPreview) => [...prevPreview, ...newPreviews]);
    setFormData((prevFormData) => ({
      ...prevFormData,
      img: [...prevFormData.img, ...files], // Concatenar las nuevas imágenes con las anteriores
    }));
  };

  const handleImageDelete = (index) => {
    // Eliminar imagen de las vistas previas
    setImgPreview((prevPreview) => prevPreview.filter((_, i) => i !== index));

    // Eliminar imagen del estado formData
    setFormData((prevFormData) => ({
      ...prevFormData,
      img: prevFormData.img.filter((_, i) => i !== index), // Filtrar la imagen eliminada
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const uploadedImageUrls = [];
      let existingImages = [...formData.img]; // Mantener imágenes previas si no se eliminan

      // Subir imágenes nuevas si las hay
      for (let i = 0; i < formData.img.length; i++) {
        const imgFile = formData.img[i];
        let imgURL = ""; // Inicializamos el URL vacío

        if (imgFile instanceof File) {
          const imgRef = ref(storage, `bitacoras/${imgFile.name}`);
          await uploadBytes(imgRef, imgFile);
          imgURL = await getDownloadURL(imgRef); // Obtenemos el URL de la imagen
          uploadedImageUrls.push(imgURL); // Guardamos el URL de cada imagen subida
        } else {
          // Si es una imagen previamente cargada (no un archivo nuevo), mantenemos la URL
          uploadedImageUrls.push(imgFile);
        }
      }

      // Si estamos actualizando una especie, solo actualizamos las URLs de las nuevas imágenes
      if (especie) {
        const especieRef = doc(
          db,
          "Bitacora",
          bitacora.id,
          "especies",
          especie.id
        );

        // Actualizamos la especie, incluyendo las imágenes nuevas y manteniendo las anteriores
        await updateDoc(especieRef, {
          nombre_cientifico: formData.nombre_cientifico,
          nombre_comun: formData.nombre_comun,
          cantidad_muestras: formData.cantidad_muestras,
          estado: formData.estado,
          familia: formData.familia,
          img: uploadedImageUrls, // Guardamos las nuevas imágenes
          descripcion: formData.descripcion,
          fechaActualizacion: new Date(),
        });

        alert("Especie actualizada exitosamente");
      } else {
        // Crear nueva especie
        const especiesRef = collection(db, "Bitacora", bitacora.id, "especies");
        await addDoc(especiesRef, {
          nombre_cientifico: formData.nombre_cientifico,
          nombre_comun: formData.nombre_comun,
          cantidad_muestras: formData.cantidad_muestras,
          estado: formData.estado,
          familia: formData.familia,
          img: uploadedImageUrls, // Guardar imágenes nuevas o mantener las previas
          descripcion: formData.descripcion,
          fechaCreacion: new Date(),
        });

        alert("Especie agregada exitosamente");
      }

      // Limpiar el formulario y redirigir
      setFormData({
        nombre_cientifico: "",
        nombre_comun: "",
        cantidad_muestras: "",
        estado: "",
        familia: "",
        img: [], // Limpiar el arreglo de imágenes
        descripcion: "",
      });
      setImgPreview([]);

      navigate("/admin/especies", { state: { bitacora } });
    } catch (error) {
      console.error("Error al guardar la especie: ", error);
      alert("Hubo un error al guardar la especie.");
    }
  };

  const handleDelete = async () => {
    try {
      // Confirmación antes de eliminar
      const confirmDelete = window.confirm(
        "¿Estás seguro de que quieres eliminar esta especie?"
      );
      if (confirmDelete && especie) {
        const especieRef = doc(
          db,
          "Bitacora",
          bitacora.id,
          "especies",
          especie.id
        );
        await deleteDoc(especieRef); // Eliminar la especie de la base de datos
        alert("Especie eliminada exitosamente");
        navigate("/admin/especies", { state: { bitacora } });
      }
    } catch (error) {
      console.error("Error al eliminar la especie: ", error);
      alert("Hubo un error al eliminar la especie.");
    }
  };

  const handleCreateBitacora = () => {
    navigate("/admin/especies", { state: { bitacora } });
  };

  return (
    <div
      className={`CyE-admin-dash-container ${
        !isHeaderVisible
          ? "CyE-admin-dash-header-visible"
          : "CyE-admin-dash-header-hidden"
      }`}
    >
      <div className="CyE-admin-dash-sidebar"></div>
      <button
        className="CyE-admin-dash-toggle-header-btn"
        onClick={toggleHeader}
      >
        ☰
      </button>

      <HeaderAdmin isVisible={!isHeaderVisible} />

      <div className="CyE-admin-dash-dashboard">
        <button
          className="CyE-admin-dash-submit-btn"
          onClick={handleCreateBitacora}
        >
          <FaRegArrowAltCircleLeft /> Volver
        </button>
        <h2 className="CyE-admin-dash-title">
          {especie ? "Editar Especie" : "Agregar Nueva Especie"}
        </h2>

        <div className="CyE-admin-dash-section">
          <form className="CyE-admin-dash-form" onSubmit={handleSubmit}>
            {/* Input para el nombre científico */}
            <div className="CyE-admin-dash-form-group">
              <label>Nombre Científico:</label>
              <input
                type="text"
                name="nombre_cientifico"
                placeholder="Ingrese el nombre científico"
                className="CyE-admin-dash-input"
                value={formData.nombre_cientifico}
                onChange={handleInputChange}
              />
            </div>

            {/* Input para el nombre común */}
            <div className="CyE-admin-dash-form-group">
              <label>Nombre Común:</label>
              <input
                type="text"
                name="nombre_comun"
                placeholder="Ingrese el nombre común"
                className="CyE-admin-dash-input"
                value={formData.nombre_comun}
                onChange={handleInputChange}
              />
            </div>

            {/* Input para la cantidad de muestras */}
            <div className="CyE-admin-dash-form-group">
              <label>Cantidad de Muestras:</label>
              <input
                type="number"
                name="cantidad_muestras"
                className="CyE-admin-dash-input"
                value={formData.cantidad_muestras}
                onChange={handleInputChange}
              />
            </div>

            {/* Input para el estado */}
            <div className="CyE-admin-dash-form-group">
              <label>Estado:</label>
              <input
                type="text"
                name="estado"
                placeholder="Estado de la especie"
                className="CyE-admin-dash-input"
                value={formData.estado}
                onChange={handleInputChange}
              />
            </div>

            {/* Input para la familia */}
            <div className="CyE-admin-dash-form-group">
              <label>Familia:</label>
              <input
                type="text"
                name="familia"
                placeholder="Familia de la especie"
                className="CyE-admin-dash-input"
                value={formData.familia}
                onChange={handleInputChange}
              />
            </div>

            {/* Input para la descripción */}
            <div className="CyE-admin-dash-form-group">
              <label>Descripción:</label>
              <textarea
                name="descripcion"
                placeholder="Descripción de la especie"
                className="CyE-admin-dash-input"
                value={formData.descripcion}
                onChange={handleInputChange}
              />
            </div>

            {/* Input para las imágenes */}
            <div className="CyE-admin-dash-form-group">
              <label>Imágenes:</label>
              <input
                type="file"
                name="img"
                accept="image/*"
                className="CyE-admin-dash-input"
                onChange={handleImageChange}
                multiple // Permitir selección de múltiples imágenes
              />
              {imgPreview.length > 0 && (
                <div className="CyE-admin-dash-img-previews">
                  {imgPreview.map((img, index) => (
                    <div
                      key={index}
                      className="CyE-admin-dash-img-preview-container"
                    >
                      <img
                        src={img}
                        alt={`Previsualización ${index + 1}`}
                        className="CyE-admin-dash-img-preview"
                      />
                      <button
                        type="button"
                        className="CyE-admin-dash-img-delete-btn"
                        onClick={() => handleImageDelete(index)}
                      >
                        Eliminar
                      </button>
                      
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botón para guardar */}
            <div className="CyE-admin-dash-form-group">
              <button type="submit" className="CyE-admin-dash-submit-btn">
                <FaSave /> {especie ? "Actualizar Especie" : "Guardar Especie"}
              </button>
              {especie && (
            <div className="CyE-admin-dash-form-group">
              <button
                type="button"
                className="CyE-admin-dash-delete-btn"
                onClick={handleDelete}
              >
                <FaTrash /> Eliminar Especie
              </button>
            </div>
          )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CyEEspecie;
