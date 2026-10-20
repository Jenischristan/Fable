import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <main className="notfound-page">
      <div className="notfound-card">
        <h1>404</h1>
        <p>This page could not be found.</p>
        <Link to="/home" className="notfound-link">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
