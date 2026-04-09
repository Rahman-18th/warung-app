import { FaMoon, FaSignOutAlt } from "react-icons/fa";

const Navbar = () => {

  const toggleDarkMode = () => {
    document.body.classList.toggle("dark-mode");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (

    <div className="navbar">
      <h1>Warung App</h1>
      <div className="nav-actions">

        <button
          className="dark-btn"
          onClick={toggleDarkMode}
        >
          <FaMoon /> 🌙 Dark
        </button>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          <FaSignOutAlt /> Logout
        </button>

      </div>

    </div>

  );

};

export default Navbar;