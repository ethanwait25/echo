import { Router } from "express";

const authRouter = Router();

authRouter.post('/register', (req, res) => {
    res.send("Register");
});

authRouter.post('/login', (req, res) => {
    res.send("Login");
});

authRouter.post('/logout', (req, res) => {
    res.send("Logout");
});

export default authRouter;