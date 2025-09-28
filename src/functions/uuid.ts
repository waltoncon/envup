import { v1, v4, v6, v7 } from "uuid";

const versions = {
  "1": () => v1(),
  "4": () => v4(),
  "6": () => v6(),
  "7": () => v7(),
};

export default function uuid(url: URL) {
  const version = (url.pathname.slice(0) || "4") as keyof typeof versions;

  if (!(version in versions)) {
    throw new Error(`Unsupported UUID version: ${version}`);
  }

  return versions[version]();
}
