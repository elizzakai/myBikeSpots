import { MCPResource, ResourceContent } from "mcp-framework";

interface Bike {
  frame_model?: string;
  brand?: string;
  manufacturer_name?: string;
  frame_colors?: string[];
  stolen?: boolean;
}

class BIAPIDocs extends MCPResource {
  uri = "bike://learn/how-to-use/GetBikeInfo";
  name = "Guidelines: GetBikeInfo";
  description = "How to use the Tool Get Bike Info";
  mimeType = "text/markdown";

  async read() {
    return [
      {
        uri: this.uri,
        mimeType: this.mimeType,
        description: this.description,
        text: "API Documentation: this is how to use the GetbikeInfo tool. For input you MUST always have prompt as a parameter when you try to use the function. By default please add it when provided any input, it is required in the schema and it is the only required field. For example, if a user says Brompton then do { bike: { query: Brompton, manufacturer_name: Brompton }}. You are required to add this required field but you can ALSO append the other fields as well to the object but you just must start off with query.",
      },
    ];
  }
}

export default BIAPIDocs;
