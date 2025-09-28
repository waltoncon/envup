import { defineFunction } from "@/utils";

export default defineFunction(function timestamp() {
  return Date.now().toString();
});
