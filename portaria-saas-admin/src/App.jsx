import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Portaria from "./pages/Portaria";
import PortariaFull from "./pages/PortariaFull";
import Perfil from "./pages/Perfil";
import Configuracoes from "./pages/Configuracoes";
import Visitantes from "./pages/Visitantes";
import Moradores from "./pages/Moradores";
import Unidades from "./pages/Unidades";
import Usuarios from "./pages/Usuarios";
import Condominios from "./pages/Condominios";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Logs from "./pages/Logs";
import Pessoas from "./pages/Pessoas";
import Credenciais from "./pages/Credenciais";
import Dispositivos from "./pages/Dispositivos";

function App() {
  const [tema, setTema] = useState(() => {
    return localStorage.getItem("tema") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tema);
    localStorage.setItem("tema", tema);
  }, [tema]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute permissao="dashboard.ver">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/portaria"
          element={
            <ProtectedRoute permissao="portaria.ver">
              <Portaria />
            </ProtectedRoute>
          }
        />

        <Route
          path="/portaria-full"
          element={
            <ProtectedRoute permissao="portaria.ver">
              <PortariaFull />
            </ProtectedRoute>
          }
        />

        <Route
          path="/visitantes"
          element={
            <ProtectedRoute permissao="visitantes.ver">
              <Visitantes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/logs"
          element={
            <ProtectedRoute permissao="logs.ver">
              <Logs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <ProtectedRoute permissao="usuarios.ver">
              <Usuarios />
            </ProtectedRoute>
          }
        />

        <Route
          path="/unidades"
          element={
            <ProtectedRoute permissao="unidades.ver">
              <Unidades />
            </ProtectedRoute>
          }
        />

        <Route
          path="/moradores"
          element={
            <ProtectedRoute permissao="pessoas.ver">
              <Moradores />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pessoas"
          element={
            <ProtectedRoute permissao="pessoas.ver">
              <Pessoas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/credenciais"
          element={
            <ProtectedRoute permissao="credenciais.ver">
              <Credenciais />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dispositivos"
          element={
            <ProtectedRoute permissao="dispositivos.ver">
              <Dispositivos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/condominios"
          element={
            <ProtectedRoute permissao="condominios.gerenciar">
              <Condominios />
            </ProtectedRoute>
          }
        />

        <Route
          path="/configuracoes"
          element={
            <ProtectedRoute permissao="configuracoes.editar">
              <Configuracoes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil tema={tema} setTema={setTema} />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;