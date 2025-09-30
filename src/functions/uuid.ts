import { createFunction } from "@/utils";
import { v1, v4, v6, v7 } from "uuid";

const versions = {
  "1": () => v1(),
  "4": () => v4(),
  "6": () => v6(),
  "7": () => v7(),
};

export default createFunction({
  schema: (z) => ({
    value: z.enum(["1", "4", "6", "7"]).default("4"),
  }),
  handler: ({ value }) => {
    if (!(value in versions)) {
      throw new Error(`Unsupported UUID version: ${value}`);
    }

    return versions[value as keyof typeof versions]();
  },
});
