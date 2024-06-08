import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoutes = () => {
  const localStorageToken = localStorage.getItem("accessToken");

  return localStorageToken ? <Outlet /> : <Navigate to="/"  replace />;
};

export default ProtectedRoutes;
