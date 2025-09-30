import { createFunction } from "@/utils";

export default createFunction({
  schema: (z) => ({}),
  handler: () => {
    return Date.now().toString();
  },
});
