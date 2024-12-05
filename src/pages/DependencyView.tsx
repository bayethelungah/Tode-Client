import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DependencyNode, StatusColor } from "../types";
import { DependencyTreeGenerator } from "../components/DependencyTreeGenerator";
import Nav from "../components/Nav";
import { fetchDependencies } from "../utils";

const DEFAULT_SEARCH_DEPTH = 3;
const MAX_SEARCH_DEPTH = 5;
const MIN_SEARCH_DEPTH = 1;

const DependencyView: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dependencies, setDependencies] = useState<DependencyNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchDepth, setSearchDepth] = useState(DEFAULT_SEARCH_DEPTH);
  const [showOptions, setShowOptions] = useState(false);
  const [showDevDependencies, setShowDevDependencies] = useState(false);

  const readFileAsync = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      // Set up the onload event to resolve the Promise with the file content
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as string); // Explicitly cast to string
        } else {
          reject(new Error("FileReader result is null or undefined"));
        }
      };
  
      // Set up the onerror event to reject the Promise with the error
      reader.onerror = () => {
        reject(reader.error || new Error("An unknown error occurred while reading the file"));
      };
  
      reader.readAsText(file); // Start reading the file
    });
  }
  

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

 
    setLoading(true);
    const dependencies = await fetchDependencies({body: await readFileAsync(file)}, "upload", { searchDepth });
    setDependencies(dependencies.body as DependencyNode);
    setError(dependencies.errorMessage);
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSearching(true);
    const dependencies = await fetchDependencies({ body: searchTerm }, "search", { searchDepth });
    setDependencies(dependencies.body as DependencyNode);
    setError(dependencies.errorMessage);
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Nav /> 
        <div className="container mx-auto text-center mt-8">
          <h1 className="text-3xl font-bold">Dependency Analyzer</h1>
          <p className="text-sm mt-2">Upload your package.json to view your dependency tree.</p>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

      {/* legend and back button */}
      {dependencies && (
        <>
        <div className="absolute left-4 top-24">
          <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => navigate("/dependency")}
        >
          Back
          </button>
        </div>
            <div className="absolute left-4 top-40 bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-bold mb-2">Status Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full ${StatusColor.ok} mr-2`}></div>
                <span>Up to date</span>
              </div>
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full ${StatusColor.outdated} mr-2`}></div>
                <span>Outdated</span>
              </div>
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full ${StatusColor.vulnerable} mr-2`}></div>
                <span>Vulnerable</span>
              </div>
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full ${StatusColor.default} mr-2`}></div>
                <span>Unknown</span>
              </div>
            </div>
          </div>
          </>
      )}
      

      {/* Main Content */}
      <main className="container mx-auto px-4">
        {!dependencies ? (
          <>
           
            <SearchPackages 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isSearching={isSearching}
              handleSearch={handleSearch}
            />
            <p className="text-gray-600 text-center m-2">OR</p>
           <FileUploadSection 
            handleSubmit={handleSubmit}
            handleFileUpload={handleFileUpload}
            loading={loading}
            />
            {showOptions ? (
              <OptionsSection 
                searchDepth={searchDepth}
                setSearchDepth={setSearchDepth}
                showDevDependencies={showDevDependencies}
                setShowDevDependencies={setShowDevDependencies}
                setShowOptions={setShowOptions}
              />
            ) : (
              <button className=" mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => setShowOptions(true)}
              >
                advanced options
              </button>
            )}
          </>
        ) : (
          <>
            {loading ? (
              <p>Loading dependency tree...</p>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <DependencyTreeGenerator dependencies={dependencies} maxDepth={0} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default DependencyView;


const FileUploadSection = ({ 
  handleSubmit, 
  handleFileUpload, 
  loading 
}: { 
  handleSubmit: (e: React.FormEvent) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
}) => (
  <section className="bg-white p-6 rounded-lg shadow-md mt-2">
    <h2 className="text-2xl font-bold mb-4">Upload package.json</h2>
    <form onSubmit={handleSubmit} className="space-y-4">
    <div className="flex gap-2">
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
      </div>
    </form>
  </section>
);
const SearchPackages = ({
  searchTerm,
  setSearchTerm,
  isSearching,
  handleSearch
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isSearching: boolean;
  handleSearch: (e: React.FormEvent) => void;
}) => {
  return (
    <section className="bg-white p-6 rounded-lg shadow-md mt-4">
      <h2 className="text-2xl font-bold mb-4">Search NPM Packages</h2>
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter package name"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>
      </form>
    </section>
  );
};

const OptionsSection = ({
  searchDepth,
  setSearchDepth,
  showDevDependencies,
  setShowDevDependencies,
  setShowOptions
}: {
  searchDepth: number;
  setSearchDepth: (depth: number) => void;
  showDevDependencies: boolean;
  setShowDevDependencies: (show: boolean) => void;
  setShowOptions: (show: boolean) => void;
}) => (
  <section className="bg-white p-6 rounded-lg shadow-md mb-4 flex flex-col items-start justify-center mt-4">
    <h1 className="text-2xl font-bold mb-4 text-center">Options</h1>
    <div className="flex items-center justify-center space-x-4">
    <p className="font-bold ">Search Depth</p>
      <input
        type="number"
        min={MIN_SEARCH_DEPTH}
        max={MAX_SEARCH_DEPTH}
        value={searchDepth}
        onChange={(e) => setSearchDepth(parseInt(e.target.value))}
        className="border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-2"
      />
      <h3 className="text-gray-600">Maximum depth to search dependencies ({MIN_SEARCH_DEPTH}-{MAX_SEARCH_DEPTH})</h3>
    </div>
    <div className="flex items-center justify-center space-x-4">
      <p className="font-bold">Show Dev Dependencies</p>
      <input type="checkbox" checked={showDevDependencies} onChange={() => setShowDevDependencies(!showDevDependencies)} />
    </div>
    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      onClick={() => setShowOptions(false)}
    >
      close
    </button>
  </section>
);