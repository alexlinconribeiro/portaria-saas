import { BrowserRouter, Routes, Route } from "react-router-dom";

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
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
	<Route path="/logs" element={<Logs />} />
	<Route path="/condominios" element={<Condominios />} />
	<Route path="/usuarios" element={<Usuarios />} />
	<Route path="/unidades" element={<Unidades />} />
	<Route path="/moradores" element={<Moradores />} />
	<Route path="/pessoas" element={<Pessoas />} />
	<Route path="/credenciais" element={<Credenciais />} />
	<Route path="/dispositivos" element={<Dispositivos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
