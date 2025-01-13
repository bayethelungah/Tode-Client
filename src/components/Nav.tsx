import React from 'react';
import { useNavigate } from 'react-router-dom';

const Nav: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="primary-bg-color text-white py-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center px-4">
        <h1 className="text-3xl font-bold cursor-pointer" onClick={() => navigate("/")}>Tode</h1>
        <div>
          <button
            className="px-4 py-2 bg-transparent border border-white rounded text-white hover:bg-white hover:text-black transition"
            onClick={() => navigate("/about")}
          >
            About
          </button>
          <button
            className="ml-4 px-4 py-2 bg-white primary-text-color rounded hover:bg-gray-200 transition"
            onClick={() => navigate("/dependency")}
          >
            Dependency View
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Nav; 