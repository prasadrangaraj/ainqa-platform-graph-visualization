interface Guideline {
  id: string;
  updated_at: string;
  association: string;
  name: string;
  publication_year: string;
  created_at: string;
  version: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  nodes?: unknown;
  edges?: unknown;
  message: string;
  
}

// interface ErrorProps{
//   validationErrors?:[];
//   success: boolean;
//   error:string;
//   message:string;
// }

const API_BASE_URL = "https://ebm-service-graphrag-dev.ainqaplatform.in/v1/knowledge-map";

async function fetchApi<T>(endpoint: string, method: string, payload?: unknown): Promise<ApiResponse<T>> {

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    // "X-Neo4j-Uri": "neo4j+s://7c28c8d5.databases.neo4j.io",
    // "X-Neo4j-Username": "neo4j",
    // "X-Neo4j-Password": "CiQJ61ybaoGALqWZ7orpo-DGcvNF8uAFCAnGMTXFZ1k",
    // "X-Neo4j-Database": "neo4j",
  };

    headers["Authorization"] = `Bearer emb-Bjmo1dtrzSqbTNJY2QJgMbbNfNJKdD89o4I5SfG`;

  const config: RequestInit = {
    method,
    headers,
  };

  if (payload) {
    config.body = JSON.stringify(payload);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    if (!response.ok) {
      throw (data || "Something went wrong");
    }
    return data as ApiResponse<T>;
  } catch (error: unknown) {
    console.error("API call failed:", error);
    throw error;
  }
}

export { fetchApi };
export type { Guideline };
