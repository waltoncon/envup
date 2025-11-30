import { createFunction } from "@/utils";
import { execa } from "execa";

export default createFunction({
  schema: (z) => ({
    value: z.string().describe("The path of the secret in 1Password"),
  }),
  handler: async ({ value }) => {
    const cmd = !!process.env.WSL_DISTRO_NAME ? "op.exe" : "op";
    console.log(`${cmd} read ${`op://${value}`}`);
    const res = await execa`${cmd} read ${`op://${value}`}`;
    return res.stdout;
  },
});
