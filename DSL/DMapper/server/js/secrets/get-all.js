import { getAllFiles, mapSecretToJson } from "../util/utils.js";

export default async function getAllSecrets() {
  return {
    prod: mapSecretToJson(getAllFiles("/secrets/prod")),
    test: mapSecretToJson(getAllFiles("/secrets/test")),
  };
}
