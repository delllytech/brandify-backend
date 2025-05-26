import express from "express";
import {
  createOffer,
  getAllOffers,
  getOfferById,
  updateOffer,
  deleteOffer
} from "./offerController";

const offerRouter = express.Router();

offerRouter.get("/offers", getAllOffers);

offerRouter.get("/offers/:id", getOfferById);

offerRouter.post("/offers", createOffer);

offerRouter.put("/offers/:id", updateOffer);

offerRouter.delete("/offers/:id", deleteOffer);

export default offerRouter;