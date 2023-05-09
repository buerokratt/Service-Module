import { getAllFiles, mapSecretToJson } from "../util/utils.js";

export default async function getAllSecrets() {
  const prodSecrets = getAllFiles("/secrets/prod");
  const testSecrets = getAllFiles("/secrets/test");

  return {
    prod: mapSecretToJson(prodSecrets),
    test: mapSecretToJson(testSecrets),
  };
}
