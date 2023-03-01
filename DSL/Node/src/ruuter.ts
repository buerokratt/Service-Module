import express, { Router } from 'express';
import path from 'path';
import { getAllFiles } from './util';
const router: Router = express.Router();

router.get('/list', (req, res) => {
  const services: any = {};

  getAllFiles('/Ruuter')
    .filter(filename => filename.endsWith('.yml'))
    .map(path.parse)
    .forEach(({ name, dir }) => {
      const type = dir.startsWith('/DSL/POST/services') ? 'POST' : 'GET';
      const status = dir.endsWith('/inactive') ? 'inactive' : 'active';
      services[name] = { type, status }
    })

  return res.status(200).json(services)
});

export default router;
