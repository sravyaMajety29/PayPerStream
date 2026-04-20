import { Link, useLocation } from "react-router-dom";
import ConnectWallet from "./ConnectWallet";
import { useWallet } from "../context/WalletContext";
import { Badge } from "./ui/badge";
import { Play, Home, BarChart3 } from "lucide-react";

function Navbar() {
  const location = useLocation();
  const { activeAddress } = useWallet();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Play className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              tapToStream
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>

              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/dashboard") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {activeAddress && (
                <Badge variant="secondary" className="hidden sm:flex items-center space-x-1 bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Connected</span>
                </Badge>
              )}

              <ConnectWallet />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
