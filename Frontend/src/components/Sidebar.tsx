import { NavLink } from "react-router-dom";
import { FaHome, FaBox, FaShoppingCart, FaChartBar } from "react-icons/fa";

const Sidebar = () => {

  return (

    <div className="sidebar">

      <h2 className="logo">Warung App</h2>

      <nav>

        <NavLink to="/dashboard" className="menu">
          <FaHome className="menu-icon"/>
          Dashboard
        </NavLink>

        <NavLink to="/products" className="menu">
          <FaBox className="menu-icon"/>
          Products
        </NavLink>

        <NavLink to="/transactions" className="menu">
          <FaShoppingCart className="menu-icon"/>
          Transactions
        </NavLink>

        <NavLink to="/reports" className="menu">
          <FaChartBar className="menu-icon"/>
          Reports
        </NavLink>

      </nav>

    </div>

  );

};

export default Sidebar;