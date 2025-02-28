import { Link } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <div className="text-center max-w-md bg-neutral rounded-lg shadow-lg p-8">
        <div className="text-primary text-8xl mb-4 flex justify-center">
          <FiAlertCircle />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <h2 className="text-xl font-semibold text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-300 mb-6">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="bg-primary hover:bg-accent text-white px-6 py-2 rounded-md font-semibold transition inline-block"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
