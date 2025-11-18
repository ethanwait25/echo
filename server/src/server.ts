import express from "express";
import api from "./api/index.js";

console.log("Server starting up...");

const app = express();
const port = 3000;

app.use('/api', api);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});