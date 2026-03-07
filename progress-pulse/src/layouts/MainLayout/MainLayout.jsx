import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import "./MainLayout.css";

export default function MainLayout() {
  return (
    <div className="pp-layout">
      <Navbar />
      <div className="pp-layout-body">
        <Sidebar />
        <main className="pp-layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
