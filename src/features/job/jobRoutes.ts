import express from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob
} from "./jobController";

const jobRouter = express.Router();

jobRouter.get("/jobs", getAllJobs);

jobRouter.get("/jobs/:id", getJobById);

jobRouter.post("/jobs", createJob);

jobRouter.put("/jobs/:id", updateJob);

jobRouter.delete("/jobs/:id", deleteJob);

export default jobRouter;