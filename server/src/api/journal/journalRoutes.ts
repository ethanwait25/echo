import { Router } from "express";

const journalRouter = Router();

journalRouter.get('/', (req, res) => {
    res.send("Default for journal");
})

journalRouter.get('/test', (req, res) => {
    res.send("Journal test");
});

export default journalRouter;