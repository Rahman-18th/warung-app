import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

function App() {

  return (

    <BrowserRouter>

      {/* Toast Notification */}
      <Toaster position="top-right" />

      <Routes>

        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* Layout Dashboard */}
        <Route element={<Layout />}>

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />

        </Route>

      </Routes>

    </BrowserRouter>

  );
}

export default App;