import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Integradores from "./pages/Integradores";
import Modulos from "./pages/Modulos";
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
  path="/modulos"
  element={
    <ProtectedRoute permissao="configuracoes.ver" modulo="configuracoes">
      <Modulos />
    </ProtectedRoute>
  }
/>
	<Route
  path="/integradores"
  element={
    <ProtectedRoute permissao="integradores.ver" modulo="integradores">
      <Integradores />
    </ProtectedRoute>
  }
/>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute permissao="portaria.ver" modulo="portaria">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/portaria"
          element={
            <ProtectedRoute permissao="portaria.ver" modulo="portaria">
              <Portaria />
            </ProtectedRoute>
          }
        />

        <Route
          path="/portaria-full"
          element={
            <ProtectedRoute permissao="portaria.ver" modulo="portaria">
              <PortariaFull />
            </ProtectedRoute>
          }
        />

        <Route
          path="/visitantes"
          element={
            <ProtectedRoute
              permissao="visitantes.ver"
              modulo="gestao_visitantes"
            >
              <Visitantes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/logs"
          element={
            <ProtectedRoute
              permissao="portaria.visualizar_logs"
              modulo="portaria"
            >
              <Logs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <ProtectedRoute permissao="usuarios.ver" modulo="configuracoes">
              <Usuarios />
            </ProtectedRoute>
          }
        />

        <Route
          path="/unidades"
          element={
            <ProtectedRoute
              permissao="unidades.ver"
              modulo="gestao_moradores"
            >
              <Unidades />
            </ProtectedRoute>
          }
        />

        <Route
          path="/moradores"
          element={
            <ProtectedRoute
              permissao="moradores.ver"
              modulo="gestao_moradores"
            >
              <Moradores />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pessoas"
          element={
            <ProtectedRoute
              permissao="moradores.ver"
              modulo="gestao_moradores"
            >
              <Pessoas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/credenciais"
          element={
            <ProtectedRoute permissao="dispositivos.ver" modulo="dispositivos">
              <Credenciais />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dispositivos"
          element={
            <ProtectedRoute permissao="dispositivos.ver" modulo="dispositivos">
              <Dispositivos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/condominios"
          element={
            <ProtectedRoute permissao="condominios.ver" modulo="integradores">
              <Condominios />
            </ProtectedRoute>
          }
        />

        <Route
          path="/configuracoes"
          element={
            <ProtectedRoute
              permissao="configuracoes.ver"
              modulo="configuracoes"
            >
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
