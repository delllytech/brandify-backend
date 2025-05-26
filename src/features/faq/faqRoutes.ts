import express from "express";
import {
  createFAQ,
  getAllFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ
} from "./faqController";

const faqRouter = express.Router();

faqRouter.get("/faqs", getAllFAQs);

faqRouter.get("/faqs/:id", getFAQById);

faqRouter.post("/faqs", createFAQ);

faqRouter.put("/faqs/:id", updateFAQ);

faqRouter.delete("/faqs/:id", deleteFAQ);

export default faqRouter;