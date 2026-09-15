import { Navigate } from "react-router-dom";
import useAuth from "../context/useAuth";

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="container py-5 text-center">
        <p className="text-secondary">Checking session...</p>
      </main>
    );
  }

  if (user) {
    return <Navigate to="/tracker" replace />;
  }

  return children;
}

export default PublicOnlyRoute;
