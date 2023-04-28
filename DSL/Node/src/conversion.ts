import express, { Request, Response, Router } from "express";
import { stringify, parse } from "yaml";
import multer from "multer";
import Papa from "papaparse";
import base64ToText from "./base64ToText";
const router: Router = express.Router();

router.post("/csv_to_json", multer().array('file'), (req, res) => {
    const file = base64ToText(req.body.file);
    const result = Papa.parse(file, { skipEmptyLines: true });
    res.send(result.data);
});

router.post('/yaml_to_json', multer().array('file'), (req: Request, res: Response) => {
    const file = base64ToText(req.body.file);
    const result = parse(file);
    res.send(result);
});

router.post('/json_to_yaml', (req: Request, res: Response) => {
    const result = stringify(req.body);
    res.send({"json": result});
});

export default router;
