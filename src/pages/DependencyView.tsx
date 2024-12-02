import React, { useState } from "react";

const DependencyView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dependencies, setDependencies] = useState<any>(null);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      alert("Please upload a package.json file.");
      return;
    }

    const formData = new FormData();
    const fileReader = new FileReader();

    fileReader.onload = async (e) => {
      const content = e.target?.result as string;
      formData.append("file", content);
    };

    fileReader.readAsText(file);


    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/dependencies", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dependencies.");
      }

      const data = await response.json();
      setDependencies(data.dependencies); // Assuming API returns a `dependencies` object
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while fetching dependencies.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 shadow-lg">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-bold">Dependency Analyzer</h1>
          <p className="text-sm mt-2">Upload your package.json to view your dependency tree.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto mt-8 px-4">
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Upload package.json</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? "Processing..." : "Analyze"}
            </button>
          </form>
        </section>

        {/* Dependency Tree Display */}
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-4">Dependency Tree</h2>
          {loading && <p>Loading dependency tree...</p>}
          {dependencies ? (
            <div id="dependency-tree" className="bg-gray-50 p-4 rounded-lg shadow-md">
              <pre className="text-sm">{JSON.stringify(dependencies, null, 2)}</pre>
            </div>
          ) : (
            <p className="text-gray-600">No dependencies to display yet. Upload a file to start!</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default DependencyView;
