import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DependencyNode, ParsedFile, StatusColor } from "../types";
import { DependencyTreeGenerator } from "../components/DependencyTreeGenerator";
import Nav from "../components/Nav";
import { fetchDependencies } from "../utils";
import useSessionStorage from "../hooks/useSessionStorage";
import Footer from "../components/Footer";

const DEFAULT_SEARCH_DEPTH = 3;
const MAX_SEARCH_DEPTH = 5;
const MIN_SEARCH_DEPTH = 1;
const MAX_UPLOAD_HISTORY_BUFFER_SIZE = 5;


const DependencyView: React.FC = () => {
  const navigate = useNavigate();
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [dependencies, setDependencies] = useState<DependencyNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [searchDepth, setSearchDepth] = useState(DEFAULT_SEARCH_DEPTH);
  const [showOptions, setShowOptions] = useState(false);
  const [showDevDependencies, setShowDevDependencies] = useState(false);
  const [recentlyAnalyzedFiles, setRecentlyAnalyzedFiles] = useSessionStorage<ParsedFile[]>('recentlyAnalyzedFiles', []);
  const [selectedNode, setSelectedNode] = useState<DependencyNode | null>(null);


const updateRecentlyAnalyzedFiles = (parsedFile: ParsedFile) => {
  let newHistory = recentlyAnalyzedFiles

  if (newHistory.find(file => file.name === parsedFile.name)) {
    console.log("already exists");
    return;
  }
  newHistory = [...newHistory, parsedFile];

  if (newHistory.length > MAX_UPLOAD_HISTORY_BUFFER_SIZE) {
    newHistory.shift(); // Remove the oldest item if the buffer is full
  } 
 
  setRecentlyAnalyzedFiles(newHistory);
}

  const readFile = (file: File): Promise<string> => {
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
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {

      const file = event.target.files[0];
      const rawFileContent = await readFile(file);
      const rawFileJson = JSON.parse(rawFileContent);
  
      const parsedFileContent = {
        name: rawFileJson.name,
        version: rawFileJson.version,
        dependencies: showDevDependencies ? rawFileJson.devDependencies : rawFileJson.dependencies,
      }

      setParsedFile(parsedFileContent);
    }
  };

  // Handle form submission
  const handleFileUploadSubmit = async (event: React.FormEvent, archivedFile: ParsedFile | null = null) => {
    event.preventDefault();

    if (!parsedFile && !archivedFile) {
      alert("Please upload a package.json file.");
      return;
    }

    setLoading(true);
    //tslint:disable-next-line:no-non-null-assertion
    const dependencies = await fetchDependencies({body: archivedFile ? archivedFile : parsedFile!}, "upload", { searchDepth });
    setDependencies(dependencies.body as DependencyNode);
    setError(dependencies.errorMessage);
    setLoading(false);

    //tslint:disable-next-line:no-non-null-assertion
    updateRecentlyAnalyzedFiles(parsedFile!);
  };

  const handleSearchSubmit = async (e: React.FormEvent, passedSearchTerm : string | null = null) => {
    e.preventDefault();
    const correctSearchTerm = passedSearchTerm ? passedSearchTerm.replace(" ", '-').toLowerCase() : searchTerm.replace(" ", '-').toLowerCase();
    
    setLoading(true);
    const dependencies = await fetchDependencies({ body: correctSearchTerm }, "search", { searchDepth });
    setDependencies(dependencies.body as DependencyNode);
    setError(dependencies.errorMessage);
    setLoading(false);
  };

  return (
    <>
    {selectedNode && (
      <PackageNodeDetailPopup 
        setDependencies={setDependencies}
        node={selectedNode} 
        onClose={() => setSelectedNode(null)} 
        handleSearchSubmit={handleSearchSubmit}
      />
    )}
 
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Nav /> 
        <div className="container mx-auto text-center mt-8">
          <h1 className="text-3xl font-bold">Dependency Analyzer</h1>
          <p className="text-sm mt-2">{dependencies ? "Click on a node to analyze it." : "Upload your package.json to view your dependency tree."}</p>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

      {/* legend and back button */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
        {dependencies && (
          <>
          <div className="absolute left-4 top-24">
            <button
            className="px-4 py-2 primary-bg-color text-white rounded hover:bg-black transition"
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
            {recentlyAnalyzedFiles.length > 0 && (
            <RecentlyAnalyzedFilesSection 
                recentlyAnalyzedFiles={recentlyAnalyzedFiles}
                setParsedFile={setParsedFile}
                handleFileUploadSubmit={handleFileUploadSubmit}
              />
            )}
            <FileUploadSection 
              handleFileUploadSubmit={handleFileUploadSubmit}
              handleFileUpload={handleFileUpload}
              />
                <p className="text-gray-600 text-center m-2">OR</p>
              <SearchPackages 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleSearchSubmit={handleSearchSubmit}
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
                <button className=" mt-4 px-4 py-2 primary-bg-color text-white rounded hover:bg-black transition"
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
                  <DependencyTreeGenerator dependencies={dependencies} maxDepth={0} onNodeClick={setSelectedNode} />
                </div>
              )}
            </>
          )}
        </main>
        </>
      )}
    </div>
    </>
  );
};

export default DependencyView;


const FileUploadSection = ({ 
  handleFileUploadSubmit, 
  handleFileUpload,
}: { 
  handleFileUploadSubmit: (e: React.FormEvent) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <section className="bg-white p-6 rounded-lg shadow-md mt-2">
    <h2 className="text-2xl font-bold mb-4">Upload package.json</h2>
    <form onSubmit={handleFileUploadSubmit} className="space-y-4">
    <div className="flex gap-2">
      <input
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        type="submit"
        className="px-4 py-2 primary-bg-color text-white rounded hover:bg-black"
      >
          Upload
        </button>
      </div>
    </form>
  </section>
);
const SearchPackages = ({
  searchTerm,
  setSearchTerm,
  handleSearchSubmit
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
}) => {
  return (
    <section className="bg-white p-6 rounded-lg shadow-md mt-2">
      <h2 className="text-2xl font-bold mb-4">Search NPM Packages</h2>
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            placeholder="Enter package name"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 primary-bg-color text-white rounded hover:bg-black disabled:bg-gray-400"
          >
             Search
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
      <button className="mt-4 px-4 py-2 primary-bg-color text-white rounded hover:bg-black transition"
      onClick={() => setShowOptions(false)}
    >
      close
    </button>
  </section>  
);  

 const RecentlyAnalyzedFilesSection = ({
  recentlyAnalyzedFiles,
  handleFileUploadSubmit
 }: {
  recentlyAnalyzedFiles: ParsedFile[];
  setParsedFile: (parsedFile: ParsedFile) => void;
  handleFileUploadSubmit: (e: React.FormEvent, parsedFile: ParsedFile | null) => void;
 }) => {
  return (
    <section className="bg-white p-6 rounded-lg shadow-md mt-2">
      <h2 className="text-2xl font-bold mb-4"> Recently Uploaded</h2>
      <div className="flex items-start justify-start gap-2">

      {recentlyAnalyzedFiles.map((file, index) => (
        <div key={index}>
          <button className="px-4 py-2 primary-bg-color text-white rounded hover:bg-black transition" onClick={(e) => {handleFileUploadSubmit(e, file)}}>{file.name}</button>
        </div>
      ))}
      </div>
    </section>
  );
 }

const PackageNodeDetailPopup = ({
  node,
  onClose,
  handleSearchSubmit,
  setDependencies
}: {
  node: DependencyNode;
  onClose: () => void;
  handleSearchSubmit: (e: React.FormEvent, searchTerm: string) => void;
  setDependencies: (dependencies: DependencyNode | null) => void;
}) => {

  const handleAnalyze = (e: React.FormEvent) => {
    setDependencies(null);
    handleSearchSubmit(e, node.name);
    onClose();  
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup content */}
      <div className="relative z-50 bg-white rounded-lg shadow-xl p-6 max-w-md w-full m-4">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        
        <div className="space-y-4 flex flex-col items-start justify-center">
          <h1 className="text-3xl font-bold">{node.name}</h1>
          <h2 className="text-xl"><b>Version:</b> {node.version}</h2>
          <h3 className="text-lg"><b>Status:</b> {node.status}</h3>
          <h3 className="text-lg"><b>Description:</b> {node.description}</h3>
          {node.repoLink && <a href={node.repoLink} className="text-sm text-blue-500">Repository Link</a>}
          <button className="px-4 py-2 primary-bg-color text-white rounded hover:bg-black transition"
            onClick={(e) => handleAnalyze(e)}
          >
            Analyze
          </button>
        </div>
      </div>
    </div>
  );
};