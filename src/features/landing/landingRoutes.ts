import express from "express";
import {
  createLanding,
  getLandingData
} from "./landingController";

const landingRouter = express.Router();

landingRouter.get("/landing", getLandingData);

landingRouter.post("/landing", createLanding);

export default landingRouter;