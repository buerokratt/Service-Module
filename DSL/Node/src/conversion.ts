import express, { Request, Response, Router } from "express";
import { stringify } from "yaml";
import multer from "multer";
import Papa from "papaparse";
import { parse } from "yaml";
import base64ToText from "./base64ToText";
const router: Router = express.Router();

router.post("/csv_to_json", multer().single('file'), (req, res) => {
    const file = base64ToText(req.file?.buffer.toString('base64') ?? '');
    let result = Papa.parse(file, { skipEmptyLines: true });
    res.send(result.data);
});

router.post('/json_to_yaml', multer().array('file'), async (req: Request, res: Response) => {
    let result = stringify(req.body);
    res.json({ "json": result });
});

router.post('/yaml_to_json', multer().array('file'), async (req: Request, res: Response) => {
    const file = base64ToText(req.body.file);
    let result = parse(file);
    res.send(result);
});

export default router;
