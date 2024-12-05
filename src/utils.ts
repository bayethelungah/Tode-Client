import { TodeResponseMessage } from "./types";

export const fetchDependencies = async (formData: { body: string }, apiRoute: string, options: { searchDepth: number }): Promise<TodeResponseMessage> => {
    try {
      const response = await fetch("http://localhost:8080/api/dependencies/" + apiRoute + "/" + options.searchDepth, {
        method: "POST", 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dependencies.");
      }

      const responseMessage = await response.json() as TodeResponseMessage;
      return responseMessage;
      
    } catch (error) {
      console.error("Error:", error);
      return {
        body: null,
        errorMessage: "An error occurred while fetching dependencies"
      };
    } finally {
    }
  };