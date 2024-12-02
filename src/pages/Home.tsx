import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-gray-800">
      {/* Top Navigation Bar */}
      <nav className="bg-blue-600 text-white py-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center px-4">
          <h1 className="text-3xl font-bold">Tode</h1>
          <div>
            <button
              className="px-4 py-2 bg-transparent border border-white rounded text-white hover:bg-white hover:text-blue-600 transition"
              onClick={() => navigate("/about")}
            >
              About
            </button>
            <button
              className="ml-4 px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-200 transition"
              onClick={() => navigate("/dependency")}
            >
              Dependency View
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto mt-16 px-4">
        <section className="flex items-center justify-center">
          <img src="./Hero-Tree.png" alt="Tode Logo" className="w-2/3" />
          <div className=" ">
            <h2 className="text-4xl font-extrabold mb-4">Visualize Your Dependencies!</h2>
            <p className="text-lg text-gray-600 mb-6 w-1/2">
              Node Dependency Walker helps you easily understand your project's dependency tree.
              Upload your <code>package.json</code>, and we'll handle the rest.
            </p>
            <button
              onClick={() => navigate("/dependency")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition"
            >
              Get Started
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;