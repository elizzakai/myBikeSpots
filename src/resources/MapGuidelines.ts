import { MCPResource, ResourceContent } from "mcp-framework";

interface Bike {
  frame_model?: string;
  brand?: string;
  manufacturer_name?: string;
  frame_colors?: string[];
  stolen?: boolean;
}

class MapGuidelines extends MCPResource {
  uri = "bike://learn/how-to-use/OpenStreetMap";
  name = "Guidelines: FindSafeBikePark";
  description = "How to Utilize the Resource MyMapAPI";
  mimeType = "text/markdown";

  async read() {
    return [
      {
        uri: this.uri,
        mimeType: this.mimeType,
        description: this.description,
        text: "API Documentation: FIRST-- if user provides only the address/string location -- TRANSLATE THAT into the 4 compass latitude longitude. That way the tool find safe bike parking can be used. Now, this is how to use the API. This endpoint provided is to GET Map Data - from OpenStreetMap API. in the parameters you must provide the GET /api/0.6/map.json?bbox=left,bottom,right,top. left, bottom, right. left - Western longitude (min longitude). bottom - Southern latitude (min latitude). right - Eastern longitude (max longitude). top - Northern latitude (max latitude). All coordinates must be in WGS84 format (standard GPS coordinates). Important Limitations- Size limit: The bounding box cannot be too large. Maximum area is 0.25 square degrees (approximately 25km × 25km at the equator). Node limit: Maximum of 50,000 nodes can be returned in a single request. Rate limiting: Don't make too many requests in quick succession. Be respectful of the API. What Gets Returned. The response includes: All nodes within the bounding box, All ways that have at least one node in the bounding box (even if the way extends outside). All relations that reference the returned nodes/ways.. AFTER: when you are giving results to the user check the getbikeinfo function and make sure the area youre reccomending has no high traffic levels of theft.",
      },
    ];
  }
}

export default MapGuidelines;
