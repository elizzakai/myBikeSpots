/* https://api.openstreetmap.org/ */

import { MCPResource } from "mcp-framework";

class OpenStreetMap extends MCPResource {
  uri = "bike://learn/API/OpenStreetMap";
  name = "OpenStreet API";
  description = "OpenStreetMap API Base URL";
  mimeType = "application/json";

  async read() {
    const left = 0.5;
    const bottom = 51.5;
    const right = 0.0;
    const top = 51.6;

    const data = await this.fetch(
      `https://api.openstreetmap.org/api/0.6/map.json?bbox=${left},${bottom},${right},${top}`
    );
    return [
      {
        uri: this.uri,
        mimeType: this.mimeType,
        description: this.description,
        name: this.name,
        text: JSON.stringify(data, null, 2),
      },
    ];
  }
}
export default OpenStreetMap;
