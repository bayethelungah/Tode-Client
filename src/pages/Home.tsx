import React from "react";
import { useNavigate } from "react-router-dom";
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (  
    <div className="flex flex-col text-gray-800">
      <Nav />
      <HeroSection navigate={navigate} />
      <Footer />
    </div>
  );
};



const HeroSection = ({ navigate }: { navigate: (path: string) => void }) => {
  return (
    <main className="container mx-auto mt-48 px-4 min-h-screen">
    <section className="flex items-center justify-center">
      <div className="flex flex-col items-start justify-center ml-16">
        <h2 className="text-4xl font-extrabold mb-4">Visualize Your Dependencies!</h2>
        <p className="text-lg text-gray-600 mb-6 w-1/2 text-left">
          Tode helps you easily understand your project's dependency tree.
          Upload your files, and we'll handle the rest.
        </p>
        <button
          onClick={() => navigate("/dependency")}
          className="px-6 py-3 primary-bg-color text-white rounded-lg text-lg hover:bg-black transition"
        >
          Get Started
        </button> 
      </div>
      <img src="/Toad-image.jpg" alt="Toad sitting on a leaf" className="w-1/3 mr-16" />
    </section>
  </main>
  )
}

export default HomePage;