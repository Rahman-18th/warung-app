import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = () => {

  return (

    <div className="layout">

      <Sidebar />

      <div className="main">

        <Navbar />

        <div className="content">
          <Outlet />
        </div>

      </div>

    </div>

  );

};

export default Layout;