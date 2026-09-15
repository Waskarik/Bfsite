import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import notFoundBackground from "../assets/not-found.png";

function NotFound() {
  return (
    <>
      <SiteHeader />
      <main
        className="notFoundPage"
        style={{ backgroundImage: `url(${notFoundBackground})` }}
      >
        <div className="notFoundActions">
          <h1 className="h3 mb-3">404 - Not Found</h1>
          <Link className="btn btn-warning" to="/">
            Back to BadFish
          </Link>
        </div>
      </main>
    </>
  );
}

export default NotFound;
