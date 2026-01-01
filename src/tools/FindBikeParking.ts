import { MCPTool } from "mcp-framework";
import { z } from "zod";
import BikeParkInput from "../BikePark.interface";
import GetBikeInfo from "./GetBikeInfo.js";
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
    googleMaps: string;
  }>;
}

const getThreatLevel = async (location: string, query: string) => {
  let theftItems: any[] = [];
  const bikeIndex = new GetBikeInfo();

  // Get total count from count endpoint
  const countUrl = "https://bikeindex.org/api/v3/search/count";
  const countParams = new URLSearchParams({
    stolenness: "proximity",
    location: location,
    distance: "2",
  });
  const countResponse = await fetch(`${countUrl}?${countParams.toString()}`);
  const countData = await countResponse.json();
  const totalTheftCount = countData.proximity || 0;

  const pageResults = await bikeIndex.execute({
    query: " ",
    stolenness: "proximity",
    location: location,
    distance: "2",
  });

  theftItems.push(...pageResults);

  // Filter to only last 90 days
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const recentThefts = theftItems.filter(
    (theft) => theft.date_stolen && theft.date_stolen * 1000 > ninetyDaysAgo
  );

  let theftMessage = `Bike thefts in last 90 days: ${recentThefts.length} recent (out of ${theftItems.length} total shown)`;
  return { theftMessage, theftItems: recentThefts, totalTheftCount };
};

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
        parkingElements.forEach((element) => {
          if (element.lat && element.lon) {
            element.googleMaps = `https://www.google.com/maps?q=${element.lat},${element.lon}`;
          }
        });

        //add section to warn users about parking in high theft areas...
        const { theftMessage, theftItems, totalTheftCount } =
          await getThreatLevel(location, "");
        return JSON.stringify([
          ...parkingElements,
          {
            "theft summary": theftMessage,
            "total thefts in area over all time periods": totalTheftCount,
            "(important!) recent thefts of bikes in the area - but concern the user only with theft that has happened very recently -- in the last 90 days please. let them know":
              theftItems,
          },
        ]);
        //return { parkingElements, theft };
      } catch (error) {
        throw error;
      }
    }
  }
}
export default FindBikeParking;
