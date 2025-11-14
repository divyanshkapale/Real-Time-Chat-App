import express from "express";
import { signup } from "../controller/auth.controller.js";
import { login } from "../controller/auth.controller.js";
import { logout } from "../controller/auth.controller.js";
import { updateProfile } from "../controller/auth.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout );
router.put("/update-profile",protectedRoute,updateProfile)

router.get("/check",protectedRoute,(req,res)=>{res.send(req.user)})


export default router;
