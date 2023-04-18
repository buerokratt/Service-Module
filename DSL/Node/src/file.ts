import express, { Router } from "express";
import path from "path";
import fs from "fs";
import mime from "mime-types";
import array from "lodash";
import { buildContentFilePath, isValidFilename } from "./util";
const router: Router = express.Router();

interface MergeRequestBody {
  array1: Array<Record<string, any>>;
  array2: Array<Record<string, any>>;
  iteratee: string;
}

router.post("/write", (req, res) => {
  const filename = buildContentFilePath(req.body.file_path);
  const content = req.body.content;

  if (!filename || !content) {
    res.status(400).json({ message: "Filename and content are required" });
    return;
  }

  if (!isValidFilename(filename) || path.normalize(filename).includes("..")) {
    res.status(400).json({ message: "Filename contains illegal characters" });
    return;
  }

  fs.writeFile(filename, content, (err) => {
    if (err) {
      res.status(500).json({ message: "Unable to save file" });
      return;
    }

    res.status(201).json({ message: "File saved successfully" });
    return;
  });
});

router.post("/move", async (req, res) => {
  const currentPath = buildContentFilePath(req.body.current_path);
  const newPath = buildContentFilePath(req.body.new_path);

  if (!currentPath || !newPath) {
    res.status(400).json({ message: "current path and new path are required" });
    return;
  }

  if (
    !isValidFilename(currentPath) ||
    path.normalize(currentPath).includes("..")
  ) {
    res.status(400).json({ message: "current contains illegal characters" });
    return;
  }

  fs.mkdir(path.dirname(newPath), () => { });

  fs.rename(currentPath, newPath, function (err) {
    if (err) {
      res.status(500).json({ message: "Unable to move file" });
      return;
    }

    res.status(201).json({ message: "File moved successfully" });
    return;
  });
});

router.post("/delete", async (req, res) => {
  const filePath = buildContentFilePath(req.body.path);

  if (!filePath) {
    res.status(400).json({ message: "Path is required" });
    return;
  }

  if (!isValidFilename(filePath) || path.normalize(filePath).includes("..")) {
    res.status(400).json({ message: "current contains illegal characters" });
    return;
  }

  fs.unlink(filePath, function (err) {
    if (err) {
      res.status(500).json({ message: "Unable to delete file" });
      return;
    }

    res.status(201).json({ message: "File deleted successfully" });
    return;
  });
});

router.post("/check", (req, res) => {
  const filePath = buildContentFilePath(req.body.file_path);

  if (!filePath) {
    res.status(400).send("Filename is required");
    return;
  }

  if (filePath.includes("..")) {
    res.status(400).send("Relative paths are not allowed");
    return;
  }
  fs.access(filePath, (err) => {
    if (err) {
      console.error(err);
      res.json(false);
    } else {
      res.json(true);
    }
  });
});

router.post("/read", (req, res) => {
  const filePath = buildContentFilePath(req.body.file_path);

  if (!filePath) {
    res.status(400).send("File path is required");
    return;
  }

  if (filePath.includes("..")) {
    res.status(400).send("Relative paths are not allowed");
    return;
  }
  const mimeType = mime.lookup(filePath);
  const name = filePath.split(/(\\|\/)/g).pop();

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      res.status(404).send('File not found');
      return;
    }
    const file = Buffer.from(data).toString('base64');

    res.setHeader('Content-Type', 'application/json');

    const result = {
      name: name,
      file: file,
      mimeType: mimeType
    };
    res.json(result);
  });
});

router.post("/merge", (req, res) => {
  const { array1, array2, iteratee }: MergeRequestBody = req.body;

    if (!array1 || !array2) {
        res.status(400).send('Both arrays are required');
        return;
    }

    const merged = array.unionBy(array2, array1, iteratee);

    res.json(merged);
});

export default router;
