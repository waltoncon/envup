import { defineFunction } from "@/utils";
import { v1, v4, v6, v7 } from "uuid";

const versions = {
  "1": () => v1(),
  "4": () => v4(),
  "6": () => v6(),
  "7": () => v7(),
};

export default defineFunction(function uuid({ value: version = "4" }) {
  if (!(version in versions)) {
    throw new Error(`Unsupported UUID version: ${version}`);
  }

  return versions[version as keyof typeof versions]();
});
