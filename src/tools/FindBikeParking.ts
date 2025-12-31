import { MCPTool } from "mcp-framework";
import { z } from "zod";
import BikeParkInput from "../BikePark.interface";
// import Bike from "../Bike.interface";
interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  boundingbox: [string, string, string, string]; // [south, north, west, east]
}

interface OSMMapResponse {
  version: string;
  generator: string;
  copyright: string;
  attribution: string;
  license: string;
  bounds: {
    minlat: number;
    minlon: number;
    maxlat: number;
    maxlon: number;
  };
  elements: Array<{
    type: "node" | "way" | "relation";
    id: number;
    lat?: number;
    lon?: number;
    timestamp: string;
    version: number;
    changeset: number;
    user: string;
    uid: number;
    nodes?: number[];
    members?: Array<{
      type: "node" | "way" | "relation";
      ref: number;
      role: string;
    }>;
    tags?: Record<string, string>;
  }>;
}

class FindBikeParking extends MCPTool<BikeParkInput> {
  name = "find-bike-parking";
  description = "Find Bike Parking provided an address/coordinates by the user";
  schema = {
    location: {
      type: z.string(),
      description:
        "Location of choice you want to park your bike at, normally an address, but could be a general area.",
    },
    coordinates: {
      type: z.array(z.number()).length(4).optional(),
      description:
        "Its a GPS Bounding Box of 4 elements , [left, bottom, right, top], in which the values left, right, bottom, top, are all GPS Coordinates/Compass Latitude Longitude values.",
    },
  };

  async execute({ location, coordinates }: BikeParkInput) {
    //fetch
    if (coordinates) {
      const url = "https://api.openstreetmap.org/api/0.6/map.json?bbox=";
      const [left, bottom, right, top] = coordinates;
      const newUrl = `https://api.openstreetmap.org/api/0.6/map.json?bbox=${left},${bottom},${right},${top}`;
      try {
        const response = await this.fetch<OSMMapResponse>(newUrl);
        const parkingElements = response.elements.filter(
          (element) => element.tags?.amenity == "bicycle_parking"
        );
        return parkingElements;
      } catch (error: any) {
        throw error;
      }
    } else {
      const geoCodeURL = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        location
      )}&format=json&limit=1`;
      const [result] = await this.fetch<Array<{ lat: string; lon: string }>>(
        geoCodeURL,
        {
          headers: { "User-Agent": "BikeParking-MCP/1.0" },
        }
      );
      if (!result) throw new Error(`Location not found: ${location}`);
      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);

      // OSM API limits: max 0.25 square degrees (0.5 × 0.5)
      // Using 0.005 degrees = ~550m radius = ~1.1km box (well within limits)
      // This is reasonable walking distance to bike parking
      const offset = 0.005;
      let bbox: number[];
      bbox = [lon - offset, lat - offset, lon + offset, lat + offset];
      const [left, bottom, right, top] = bbox;

      // Validate bbox size to avoid OSM API errors
      const width = right - left;
      const height = top - bottom;
      if (width * height > 0.25) {
        throw new Error(
          `Bounding box too large (${
            width * height
          } sq deg). Max is 0.25 sq degrees (~25km × 25km)`
        );
      }
      const url = `https://api.openstreetmap.org/api/0.6/map.json?bbox=${left},${bottom},${right},${top}`;
      try {
        const response = await this.fetch<OSMMapResponse>(url);
        const parkingElements = response.elements.filter(
          (element) => element.tags?.amenity == "bicycle_parking"
        );
        return parkingElements;
      } catch (error) {
        throw error;
      }
    }
  }
}
export default FindBikeParking;
