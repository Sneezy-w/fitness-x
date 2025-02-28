import { Outlet, Link } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-neutral flex flex-col">
      <div className="container mx-auto px-4 py-4">
        <Link to="/" className="text-2xl font-bold text-primary">
          FITNESS<span className="text-white">X</span>
        </Link>
      </div>

      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Outlet />
        </div>
      </div>

      <footer className="py-4 text-center text-white">
        <p>&copy; {new Date().getFullYear()} FitnessX. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;
