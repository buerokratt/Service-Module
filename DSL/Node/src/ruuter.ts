import express, { Router } from 'express';
import path from 'path';
import { parse as parseYmlToJson } from 'yaml';
import { getAllFiles, readFile } from './util';
const router: Router = express.Router();

router.get('/list', (req, res) => {
  const services: any = {};

  getAllFiles('/Ruuter')
    .filter(filename => filename.endsWith('.yml'))
    .map(path.parse)
    .forEach(({ name, dir }) => {
      const type = dir.startsWith('/DSL/POST/') ? 'POST' : 'GET';
      const status = dir.endsWith('/inactive') ? 'inactive' : 'active';
      services[name] = { type, status }
    })

  return res.status(200).json(services)
});

router.get('/sticky', (req, res) => {
  const services: any = {};

  getAllFiles('/Ruuter')
    .filter(filename => filename.includes('/sticky/'))
    .filter(filename => filename.endsWith('.yml'))
    .map(path.parse)
    .forEach(({ name, dir }) => {
      const type = dir.startsWith('/DSL/POST/') ? 'POST' : 'GET';
      const status = dir.endsWith('/inactive') ? 'inactive' : 'active';
      services[name] = { type, status }
    })

  return res.status(200).json(services)
});

router.get('/stickyByName', (req, res) => {
  const name = req.query.name

  const file_paths = getAllFiles('/Ruuter')
    .filter(filename => filename.includes('/sticky/'))
    .filter(filename => filename.endsWith(`/${name}.yml`))

  if (file_paths.length === 0) {
    return res.status(404).json({ message: 'Sticky DSL not found' })
  }

  try {
    const ymlFile = readFile(file_paths[0])
    const jsonFile = parseYmlToJson(ymlFile)
    return res.status(200).send(jsonFile)
  } catch {
    return res.status(500).send({ message: 'Cann\'t read the file' })
  }
});

export default router;
