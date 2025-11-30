import { createFunction } from "@/utils";

export default createFunction({
  schema: (z) => ({
    length: z.coerce.number().int().min(0).optional(),
  }),
  handler: (args) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < (args.length ?? 15); i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }
    return result;
  },
});
