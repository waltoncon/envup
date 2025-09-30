import { createFunction } from "@/utils";

export default createFunction({
  schema: (z) => ({}),
  handler: () => {
    return Math.random().toString(36).substring(2, 15);
  },
});
