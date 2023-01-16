import express from "express";
import { campaigns } from "../constants/campaigns.js";
import { login } from "../constants/Login.js";
import { page } from "../constants/page.js";
import { upload } from "../constants/upload.js";
import { userSegments } from "../constants/userSegments.js";
import { webPersonalisation } from "../constants/webPersonalisation.js";
import { workflows } from "../constants/workflows.js";

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

router.get("/ui/page/dashboard", (req, res) => {
  res.send(page);
});

router.get("/ui/page/campaigns", (req, res) => {
  res.send(campaigns);
});

router.get("/ui/page/workflows", (req, res) => {
  res.send(workflows);
});

router.get("/ui/page/usersegments", (req, res) => {
  res.send(userSegments);
});

router.get("/ui/page/upload", (req, res) => {
  res.send(upload);
});

router.get("/ui/page/webpersonalisation", (req, res) => {
  res.send(webPersonalisation);
});

export default router;
