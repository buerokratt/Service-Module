import express, { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { buildContentFilePath, isValidFilename } from './util';
const router: Router = express.Router();

router.post('/write', (req, res) => {
  const filename = buildContentFilePath(req.body.file_path)
  const content = req.body.content

  if (!filename || !content) {
    res.status(400).json({ message: 'Filename and content are required' });
    return;
  }

  if (!isValidFilename(filename) || path.normalize(filename).includes('..')) {
    res.status(400).json({ message: 'Filename contains illegal characters' });
    return;
  }

  fs.writeFile(filename, content, (err) => {
    if (err) {
      res.status(500).json({ message: 'Unable to save file' });
      return;
    }

    res.status(201).json({ message: 'File saved successfully' });
    return;
  });
});

router.post('/move', async (req, res) => {
  const currentPath = buildContentFilePath(req.body.current_path)
  const newPath = buildContentFilePath(req.body.new_path)

  if (!currentPath || !newPath) {
    res.status(400).json({ message: 'current path and new path are required' });
    return;
  }

  if (!isValidFilename(currentPath) || path.normalize(currentPath).includes('..')) {
    res.status(400).json({ message: 'current contains illegal characters' });
    return;
  }

  fs.mkdir(path.dirname(newPath), () => {});

  fs.rename(currentPath, newPath, function (err) {
    if (err) {
      res.status(500).json({ message: 'Unable to move file' });
      return;
    }

    res.status(201).json({ message: 'File moved successfully' });
    return;
  })
});


router.post('/delete', async (req, res) => {
  const filePath = buildContentFilePath(req.body.path)

  if (!filePath) {
    res.status(400).json({ message: 'Path is required' });
    return;
  }

  if (!isValidFilename(filePath) || path.normalize(filePath).includes('..')) {
    res.status(400).json({ message: 'current contains illegal characters' });
    return;
  }

  fs.unlink(filePath, function (err) {
    if (err) {
      res.status(500).json({ message: 'Unable to delete file' });
      return;
    }

    res.status(201).json({ message: 'File deleted successfully' });
    return;
  })
});

export default router;
