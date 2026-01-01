import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface Bike {
  query: string;
  frame_model?: string;
  title?: string;
  manufacturer_name?: string;
  frame_colors?: string[];
  stolen?: boolean;
  location?: string;
  stolenness?: string;
  distance?: string;
  page?: number;
  per_page?: number;
  // stolen_coordinates?: [number, number];
}

interface BikeResult {
  id: number;
  title: string;
  manufacturer_name?: string;
  frame_model?: string;
  frame_colors?: string[];
  year?: number | null;
  serial?: string;
  status: string;
  stolen: boolean;
  stolen_location?: string;
  stolen_coordinates?: [number, number];
  date_stolen?: number;
  description?: string | null;
  url: string;
  thumb?: string | null;
  large_img?: string | null;
  propulsion_type_slug?: string;
  cycle_type_slug?: string;
  // Add other fields as needed
}

class GetBikeInfo extends MCPTool<Bike> {
  name = "get-bike-index-info";
  description = "Get bike information, provided the given bike info";

  schema = {
    query: {
      type: z.string(),
      description: "Full text search of the bike, full general text search",
    },
    frame_model: {
      type: z.string().optional(),
      description: "Frame model name",
    },
    title: {
      type: z.string().optional(),
      description: "Bike title",
    },
    manufacturer_name: {
      type: z.string().optional(),
      description: "Manufacturer name",
    },
    stolen: {
      type: z.boolean().optional(),
      description: "Filter by stolen status",
    },
    stolenness: {
      type: z.string().optional(),
      description: "location is ignored unless stolenness is proximity",
    },
    location: {
      type: z.string().optional(),
      description:
        "General Location/Address of where the Theft occured (City, Zip Code)",
    },
    distance: {
      type: z.string().optional(),
      description: "Distance in miles from the location (used with stolenness=proximity)",
    },
    page: {
      type: z.number().optional(),
      description: "Page number for pagination (default: 1)",
    },
    per_page: {
      type: z.number().optional(),
      description: "Number of results per page (default: 25, max: 100)",
    },
  };

  async execute({
    query,
    frame_model,
    title,
    manufacturer_name,
    stolen,
    location,
    stolenness,
    distance,
    page,
    per_page,
  }: Bike) {
    try {
      const url = "https://bikeindex.org/api/v3/search";
      const params = new URLSearchParams();
      if (query) {
        params.append("query", query);
      }
      if (location) {
        params.append("location", location);
      }
      if (stolenness) {
        params.append("stolenness", stolenness);
      }
      if (distance) {
        params.append("distance", distance);
      }
      if (frame_model) {
        params.append("frame_model", frame_model);
      }
      if (title) {
        params.append("title", title);
      }
      if (manufacturer_name) {
        params.append("manufacturer_name", manufacturer_name);
      }
      if (stolen === true || stolen === false) {
        params.append("stolen", stolen.toString());
      }
      if (page) {
        params.append("page", page.toString());
      }
      if (per_page) {
        params.append("per_page", per_page.toString());
      }
      const newUrl = `${url}?${params.toString()}`;

      const response = await this.fetch<{ bikes: BikeResult[] }>(newUrl);

      return response.bikes;
    } catch (error: any) {
      throw error;
    }
  }
}

export default GetBikeInfo;
