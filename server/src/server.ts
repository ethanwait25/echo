import express from "express";

console.log("Server starting up...")

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send("Welcome to echo.");
});

app.get('/hello', (req, res) => {
    res.send("Hello World!");
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});