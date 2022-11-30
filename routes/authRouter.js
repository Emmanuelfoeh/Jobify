import express from 'express'
import { register, login, update } from "../controllers/authController.js";
import authenticateUser from "../middleware/auth.js";

const router = express.Router()


router.route("/register").post(register);
router.route('/login').post(login)
router.route('/update').patch(authenticateUser, update)

export default router