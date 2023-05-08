import express, { Router } from "express";
import path from "path";
import { parse as parseYmlToJson } from "yaml";
import { getAllFiles, readFile } from "./util";
import fs from "fs";

const router: Router = express.Router();

router.get("/list", (req, res) => {
  const services: any = {};

  getAllFiles("/Ruuter")
    .filter((filename) => filename.endsWith(".yml"))
    .map(path.parse)
    .forEach(({ name, dir }) => {
      const type = dir.includes("/POST/") ? "POST" : "GET";
      const status = dir.endsWith("/inactive") ? "inactive" : "active";
      if (!services[name]) {
        services[name] = { type, status };
      } else {
        if (services[name].length > 1) {
          services[name] = [...services[name], { type, status }];
        } else {
          services[name] = [{ ...services[name] }, { type, status }];
        }
      }
    });

  return res.status(200).json(services);
});

router.get("/sticky", (req, res) => {
  const services: any = {};

  getAllFiles("/Ruuter")
    .filter((filename) => filename.includes("/sticky/"))
    .filter((filename) => filename.endsWith(".yml"))
    .map(path.parse)
    .forEach(({ name, dir }) => {
      const type = dir.includes("/POST/") ? "POST" : "GET";
      const status = dir.endsWith("/inactive") ? "inactive" : "active";
      if (!services[name]) {
        services[name] = { type, status };
      } else {
        if (services[name].length > 1) {
          services[name] = [...services[name], { type, status }];
        } else {
          services[name] = [{ ...services[name] }, { type, status }];
        }
      }
    });

  return res.status(200).json(services);
});

router.get("/secrets-with-priority", (req, res) => {
  const priority = req.query.priority;
  const prodSecrets = mapToJson(getAllFiles("/secrets/prod"));
  const testSecrets = mapToJson(getAllFiles("/secrets/test"));

  const mergeSecrets = (
    secrets: { [key: string]: any },
    result: { [key: string]: any },
    isProdSecrets: boolean,
    isProdPriority: boolean
  ) => {
    Object.keys(secrets).forEach((k) => {
      if (typeof secrets[k] === "object") {
        if (!Object.keys(result).includes(k)) result[k] = {};
        return mergeSecrets(
          secrets[k],
          result[k],
          isProdSecrets,
          isProdPriority
        );
      }
      if (
        !Object.keys(result).includes(k) ||
        (!isProdSecrets && !isProdPriority)
      )
        result[k] = secrets[k];
    });
    return result;
  };
  const result = {};
  mergeSecrets(prodSecrets, result, true, priority !== "test");
  mergeSecrets(testSecrets, result, false, priority !== "test");
  return res.status(200).send({ ...result });
});

const assignSecrets = (
  data: { [key: string]: any },
  result: { [key: string]: any }
) => {
  Object.keys(data).forEach((k) => {
    if (typeof data[k] === "object") {
      result[k] = {};
      return assignSecrets(data[k], result[k]);
    }
    result[k] = data[k];
  });
};

const mapToJson = (secrets: string[]) => {
  const result: { [key: string]: any } = {};
  secrets.forEach((secretPath) => {
    try {
      const data = parseYmlToJson(fs.readFileSync(secretPath, "utf-8"));
      assignSecrets(data, result);
    } catch (_) {
      return {};
    }
  });
  return result;
};

router.get("/secrets", (req, res) => {
  const prodSecrets = getAllFiles("/secrets/prod");
  const testSecrets = getAllFiles("/secrets/test");

  const result = {
    prod: mapToJson(prodSecrets),
    test: mapToJson(testSecrets),
  };

  res.setHeader("Content-Type", "application/json");
  return res.status(200).send({ ...result });
});

router.post("/sticky/steps", (req, res) => {
  const name = req.body.name;

  const file_path = getAllFiles("/Ruuter")
    .filter((filename) => filename.includes("/sticky/"))
    .filter((filename) => filename.endsWith(`/${name}.yml`))
    .at(0);

  if (!file_path) {
    return res.status(404).json({ message: "Sticky DSL not found" });
  }

  try {
    const ymlFile = readFile(file_path);
    const jsonFile = parseYmlToJson(ymlFile);
    return res.status(200).send(jsonFile);
  } catch (e) {
    console.log(e);
    return res.status(500).send({ message: "Can't read the file" });
  }
});

export default router;
