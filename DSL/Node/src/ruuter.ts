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

router.get('/sticky/steps', (req, res) => {
  const name = req.query.name

  const file_path = getAllFiles('/Ruuter')
    .filter(filename => filename.includes('/sticky/'))
    .filter(filename => filename.endsWith(`/${name}.yml`))
    .at(0)

  if (!file_path) {
    return res.status(404).json({ message: 'Sticky DSL not found' })
  }

  try {
    const ymlFile = readFile(file_path)
    const jsonFile = parseYmlToJson(ymlFile)
    return res.status(200).send(jsonFile)
  } catch (e) {
    console.log(e)
    return res.status(500).send({ message: 'Can\'t read the file' })
  }
});

export default router;
