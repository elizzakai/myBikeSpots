import { MCPPrompt } from "mcp-framework";
import { z, ZodType } from "zod";
/*
Prompts are reusable templates that:

Define conversation flows
Provide structured context
Use dynamic data
Ensure consistent AI responses
*/

interface MyPromptInput {
  time: string;
  timeOfDay: string;
  currentBike: string;
}

class GreetPrompt extends MCPPrompt<MyPromptInput> {
  name = "greeting";
  description = "Makes a unique greeting to the user";

  schema = {
    time: {
      type: z.string(),
      description: "The local time",
    },
    timeOfDay: {
      type: z.enum(["morgen", "aften", "mittag", "nacht"]),
      description: "Time of Day",
    },
    currentBike: {
      type: z.string(),
      description: "Current Bike of Choice",
    },
  };

  async generateMessages({ time, timeOfDay, currentBike }: MyPromptInput) {
    return [
      {
        role: "system",
        content: {
          type: "text",
          text: `I am a pro bike use researcher, and I'll assist with providing the user information on bikes, bike parking, etc. This also can be bike related statistics or details on a specific bike as well. Please format information with the title of Bike Deets at the top and the date, as well as the topic of the conversation (as provided by the user). Be sure to analyze the data provided, the bike data. Please require the user to use the given params please. Use the info they provided like the ${currentBike}. AFTER: when you are giving results to the user check the getbikeinfo function and make sure the area youre reccomending has no high traffic levels of theft.`,
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `Good ${timeOfDay}. Be sure to use the tool: GetBikeInfo to get the information you need on missing/stolen bikes!`,
        },
      },
    ];
  }
}

export default GreetPrompt;
