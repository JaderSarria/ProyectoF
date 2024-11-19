import React, { useState, useEffect } from "react";
import HeaderAdmin from "../header/headeradmin";
import "./users.css";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../../../Firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  getAuth,
  deleteUser as deleteUserAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";

const Users = () => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);
  const [userForm, setUserForm] = useState({
    nombre: "",
    correo: "",
    rol: "administradores",
  });
  const [editUserId, setEditUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleHeader = () => {
    setIsHeaderVisible(!isHeaderVisible);
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 300);
  };

  const getRecentUsers = async () => {
    try {
      const usersRef = collection(db, "usuarios");
      const usersQuery = query(usersRef, orderBy("fechaCreacion", "desc"));
      const querySnapshot = await getDocs(usersQuery);

      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date(),
      }));
      setRecentUsers(usersData);
    } catch (error) {
      console.error("Error fetching recent users:", error);
    }
  };

  const deleteUserFromAuth = async (userId) => {
    try {
      const userDocRef = doc(db, "usuarios", userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.error("Usuario no encontrado en Firestore");
        return;
      }

      const { correo, contrasena } = userDoc.data();

      const auth = getAuth();
      await signInWithEmailAndPassword(auth, correo, contrasena);

      const user = auth.currentUser;

      if (user && user.uid === userId) {
        await deleteUserAuth(user);
        console.log("Usuario eliminado de Firebase Authentication");
        await deleteDoc(doc(db, "usuarios", userId));
        console.log("Usuario eliminado de Firestore");
      } else {
        console.error(
          "El usuario no está autenticado correctamente o no coincide el UID"
        );
      }
    } catch (error) {
      console.error("Error eliminando usuario de auth:", error);
    }
  };

  const saveUser = async () => {
    if (!userForm.nombre || !userForm.correo || !userForm.rol) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    setLoading(true);

    try {
      const userExists = await checkIfUserExists(userForm.correo);
      if (userExists) {
        alert("El correo ya está registrado.");
        setLoading(false);
        return;
      }

      // Si estamos editando un usuario
      if (editUserId) {
        if (
          window.confirm(
            "Al actualizar los datos, se restablecerá la contraseña a la predeterminada. ¿Estás seguro?"
          )
        ) {
          // 1. Eliminar al usuario antiguo de Firebase Authentication
          await deleteUserFromAuth(editUserId);

          // 2. Crear un nuevo usuario con el correo actualizado
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            userForm.correo,
            userForm.correo // Usamos el mismo correo como contraseña temporal
          );

          const userDocRef = doc(db, "usuarios", userCredential.user.uid);
          await setDoc(userDocRef, {
            nombre: userForm.nombre,
            correo: userForm.correo,
            rol: userForm.rol,
            contrasena: userForm.correo, // Contraseña temporal
            fechaCreacion: new Date(),
            permisoEspecial: "no",
          });

          // 3. Actualizar la lista de usuarios
          setRecentUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === editUserId
                ? {
                    id: userCredential.user.uid,
                    ...userForm,
                    fechaCreacion: new Date(),
                  }
                : user
            )
          );
          alert("Usuario actualizado correctamente!");
        } else {
          setLoading(false);
          return;
        }
      } else {
        // Si es un nuevo usuario, lo creamos como siempre
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userForm.correo,
          userForm.correo // Contraseña predeterminada
        );

        const userDocRef = doc(db, "usuarios", userCredential.user.uid);
        await setDoc(userDocRef, {
          nombre: userForm.nombre,
          correo: userForm.correo,
          rol: userForm.rol,
          contrasena: userForm.correo,
          fechaCreacion: new Date(),
          permisoEspecial: "no",
        });

        setRecentUsers((prevUsers) => [
          {
            id: userCredential.user.uid,
            ...userForm,
            fechaCreacion: new Date(),
          },
          ...prevUsers,
        ]);
        alert("Usuario guardado correctamente!");
      }

      setUserForm({ nombre: "", correo: "", rol: "administrador" });
      setEditUserId(null);
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Hubo un error al guardar el usuario.");
    }

    setLoading(false);
  };

  const checkIfUserExists = async (email) => {
    const usersRef = collection(db, "usuarios");
    const usersQuery = query(usersRef, orderBy("correo"));
    const querySnapshot = await getDocs(usersQuery);

    const userExists = querySnapshot.docs.some(
      (doc) => doc.data().correo === email
    );
    return userExists;
  };

  const editUser = (user) => {
    setUserForm({ nombre: user.nombre, correo: user.correo, rol: user.rol });
    setEditUserId(user.id);
  };

  const cancelEdit = () => {
    setUserForm({ nombre: "", correo: "", rol: "administrador" });
    setEditUserId(null);
  };

  useEffect(() => {
    getRecentUsers();
  }, []);

  return (
    <div
      className={`users-page-container ${
        isHeaderVisible ? "users-header-visible" : "users-header-hidden"
      }`}
    >
      <div className="users-sidebar"></div>
      <button className="users-toggle-header-btn" onClick={toggleHeader}>
        ☰
      </button>

      <HeaderAdmin isVisible={isHeaderVisible} />

      <div className="users-dashboard">
        <h2 className="users-title">Lista de Usuarios</h2>

        <div className="users-content">
          {/* Formulario para agregar o editar usuario */}
          <div className="add-user-form">
            <input
              type="text"
              placeholder="Nombre"
              value={userForm.nombre}
              onChange={(e) =>
                setUserForm({ ...userForm, nombre: e.target.value })
              }
            />
            <input
              type="email"
              placeholder="Correo"
              value={userForm.correo}
              onChange={(e) =>
                setUserForm({ ...userForm, correo: e.target.value })
              }
            />
            <select
              value={userForm.rol}
              onChange={(e) =>
                setUserForm({ ...userForm, rol: e.target.value })
              }
            >
              <option value="administrador">Administrador</option>
              <option value="investigador">Investigador</option>
              <option value="colaborador">Colaborador</option>
            </select>
            <button onClick={saveUser} disabled={loading}>
              {loading
                ? "Guardando..."
                : editUserId
                ? "Guardar Cambios"
                : "Agregar Usuario"}
            </button>
            {editUserId && (
              <div>
                <button onClick={cancelEdit}>Cancelar</button>
                <p className="password-warning">
                  Al actualizar los datos, se restablecerá la contraseña a la
                  predeterminada (el correo).
                </p>
              </div>
            )}
          </div>

          {/* Lista de usuarios */}
          <div className="users-list">
            {recentUsers.map((user) => (
              <div className="users-card" key={user.id}>
                <h3>{user.nombre || "Usuario Desconocido"}</h3>
                <p>Correo: {user.correo}</p>
                <p>Rol: {user.rol}</p>
                <p>
                  Fecha de creación: {user.fechaCreacion.toLocaleDateString()}
                </p>
                <button onClick={() => editUser(user)}>Editar</button>
                <button
                  onClick={() => deleteUserFromAuth(user.id)}
                  className="delete-btn"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
