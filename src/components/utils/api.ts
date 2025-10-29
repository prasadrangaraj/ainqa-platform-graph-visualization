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

// --- Neo4j Databases API ---
export interface Neo4jDatabase {
  id: number;
  name: string;
  url: string;
  username: string;
  password: string;
  database: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}


// interface ErrorProps{
//   validationErrors?:[];
//   success: boolean;
//   error:string;
//   message:string;
// }

// const API_BASE_URL = "https://ebm-service-graphrag-dev.ainqaplatform.in/v1/knowledge-map";
const API_BASE_URL = "https://ebmgraphrag-dev.modebm.ainqa.com";

async function fetchApi<T>(endpoint: string, method: string, payload?: unknown, dataBaseId?:number): Promise<ApiResponse<T>> {

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(dataBaseId ? { "X-Database-Id": String(dataBaseId) } : {})
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

  if (payload && method.toUpperCase() !== "GET" && method.toUpperCase() !== "HEAD") {
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

