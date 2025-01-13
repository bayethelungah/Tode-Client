import Footer from '../components/Footer';
import Nav from '../components/Nav';


export function About() {
  return (
    <div className="flex flex-col min-h-screen text-gray-800">
      <Nav />
      <main className="container mx-auto mt-48 px-4 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">About</h1>
        <p className="text-lg text-gray-600 mb-6 w-1/2 text-left card">
          Visualize your codebase like never before with Tode. We transform complex dependency trees into clear, 
          interactive maps that make sense. Simply upload your project files and watch as your architecture comes to life.
        </p>
        <h3 className="text-lg font-bold">Author: <a href="https://github.com/bayethelungah">Bayethe Lungah</a></h3>
      </main>
      <Footer />
    </div>
  )
} 