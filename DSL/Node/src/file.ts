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

export default router;
