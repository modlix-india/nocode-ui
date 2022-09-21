import express from "express";
import { login } from "../constants/Login.js";
import { page } from "../constants/page.js";

const router = express.Router();

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log(new Date().toTimeString());
  next();
});
// define the home page route
router.get("/", (req, res) => {
  res.send({ name: "Hello World" });
});

router.get("/page", (req, res) => {
  res.send(login);
});

router.get("/ui/page/pagename", (req, res) => {
  res.send(page);
});

export default router;
