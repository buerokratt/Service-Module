import express, { Express } from "express";
import "dotenv/config";
import file from "./file";
import ruuter from "./ruuter";

const app: Express = express();
const port = process.env.PORT || 3008;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/file", file);
app.use("/ruuter", ruuter);
app.get("/status", (req, res) => res.status(200).send("ok"));

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
