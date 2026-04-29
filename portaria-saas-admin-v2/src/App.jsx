import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./auth/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Visitantes from "./pages/Visitantes";
import Moradores from "./pages/Moradores";
import Usuarios from "./pages/Usuarios";
import Dispositivos from "./pages/Dispositivos";
import Configuracoes from "./pages/Configuracoes";
import Perfil from "./pages/Perfil";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/visitantes" element={<Visitantes />} />
        <Route path="/moradores" element={<ProtectedRoute allowed={["SUPER_ADMIN", "ADMIN_CONDOMINIO"]}><Moradores /></ProtectedRoute>} />
        <Route path="/usuarios" element={<ProtectedRoute allowed={["SUPER_ADMIN", "ADMIN_CONDOMINIO"]}><Usuarios /></ProtectedRoute>} />
        <Route path="/dispositivos" element={<ProtectedRoute allowed={["SUPER_ADMIN", "ADMIN_CONDOMINIO", "TECNICO"]}><Dispositivos /></ProtectedRoute>} />
        <Route path="/configuracoes" element={<ProtectedRoute allowed={["SUPER_ADMIN", "ADMIN_CONDOMINIO"]}><Configuracoes /></ProtectedRoute>} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
