import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      {open && <div className="backdrop" onClick={() => setOpen(false)} />}
      <main className="main-area">
        <Header onMenu={() => setOpen(true)} />
        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
