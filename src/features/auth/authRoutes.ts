import express from "express";
import { signup, signin , checkEmail, checkLoginStatus, logout} from "./authController";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post('/check-email', checkEmail)
router.get('/user', checkLoginStatus)
router.post('/logout', logout)
export default router;
