import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/login/login";
import Register from "./pages/register/register";
import PpalAdmin from "./pages/admin/ppal/ppalAdmin";
import PpalColab from "./pages/colab/ppal/ppalColab";
import PpalInv from "./pages/invest/ppal/ppalInv";
import Users from "./pages/admin/users/users";
import BitAdmin from "./pages/admin/bitac/bitAdmin";
import CyEBitacora from "./pages/admin/CyEBitacora/CyEBitacora";
import Especies from "./pages/admin/especies/especies";
import CyEEspecie from "./pages/admin/addEspecie/CyEEspecie";
import Comentarios from "./pages/comentarios/comentarios";
import Config from "./pages/admin/config/config";

import "./App.css";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/ppalAdmin" element={<PpalAdmin />} />
        <Route path="/ppalInv" element={<PpalInv />} />
        <Route path="/ppalColab" element={<PpalColab />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/bitacora" element={<BitAdmin />} />
        <Route path="/admin/CyEbitacora" element={<CyEBitacora />} />
        <Route path="/admin/especies" element={<Especies />} />
        <Route path="/admin/CyEespecies" element={<CyEEspecie />} />
        <Route path="/admin/detalles" element={<Comentarios />} />
        <Route path="/configuracion" element={<Config />} />
      </Routes>
    </div>
  );
};

export default App;
