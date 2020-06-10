import { Router } from "express";
import AuthController from "../controllers/AuthController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Register an user
router.post("/register", AuthController.register);

//Login route
router.post("/login", AuthController.login);

//Change password
router.put("/password", [checkJwt], AuthController.changePassword);


export default router;
