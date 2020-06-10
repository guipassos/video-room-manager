import { Router } from "express";
import RoomController from "../controllers/RoomController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

// Get all rooms
router.get("/", RoomController.listAll);

// Get one room
router.get("/:uuid", RoomController.getOne);

// Create a new room
router.post("/", [checkJwt], RoomController.create);

// Update a room
router.put("/:uuid", [checkJwt], RoomController.updateRoom);

// Join or leave room
router.post("/go", [checkJwt], RoomController.go);

// Search rooms
router.get("/search/:username", RoomController.search);

// Delete room by host
router.delete("/:uuid", [checkJwt], RoomController.deleteRoom);



export default router;
