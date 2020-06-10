import { Router } from "express";
import UserController from "../controllers/UserController";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";

const router = Router();

// Get all users
router.get("/", UserController.listAll);

// Get one user
router.get("/:username", UserController.getOne);

// Update current user
router.put("/", [checkJwt], UserController.updateUser);

// Delete current user
router.delete("/", [checkJwt], UserController.deleteUser);

export default router;
