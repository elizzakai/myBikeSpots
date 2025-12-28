import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface Bike {
  query: string;
  frame_model?: string;
  title?: string;
  manufacturer_name?: string;
  frame_colors?: string[];
  stolen?: boolean;
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
  };

  async execute({
    query,
    frame_model,
    title,
    manufacturer_name,
    stolen,
  }: Bike) {
    try {
      const url = "https://bikeindex.org/api/v3/search";
      const params = new URLSearchParams();
      if (query) {
        params.append("query", query);
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
      const newUrl = `${url}?${params.toString()}`;

      const response = await this.fetch<{ bikes: BikeResult[] }>(newUrl);

      return response.bikes;
    } catch (error: any) {
      throw error;
    }
  }
}

export default GetBikeInfo;
