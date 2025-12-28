import { MCPResource, ResourceContent } from "mcp-framework";

interface Bike {
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
}

class BikeIndexAPI extends MCPResource {
  uri = "bike://learn-about-bikes/info";
  name = "Bike Information";
  description =
    "Get Details on Bikes in a general sense.. mb how to fix?, mb missing bikes?";
  mimeType = "application/json";

  async read() {
    const url = "https://bikeindex.org/api/v3/search";
    const params = new URLSearchParams();

    const response = await this.fetch<{ data: Bike[] }>(url);
    return [
      {
        uri: this.uri,
        mimeType: this.mimeType,
        text: JSON.stringify(response),
      },
    ];
  }
}

export default BikeIndexAPI;
