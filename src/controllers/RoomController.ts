import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { getRepository, In, getConnection } from "typeorm";
import { Room } from "../entity/Room";
import { validate } from "class-validator";
import UserController from "./UserController";

class RoomController {

  static listAll = async (req: Request, res: Response) => {

    const rooms = await getRepository(Room).find({ relations: ["host", "users"] });
    res.send(rooms);

  };

  static search = async (req: Request, res: Response) => {

    const username = req.params.username;
    let user = await UserController.getUserByUsername(username);

    if (!user) {
      return res.status(404).send({
        code: "room.search.user.not.found",
        data: null
      });
    }

    const rooms = await getRepository(Room)
      .createQueryBuilder("room")
      .innerJoinAndSelect("room.users", "user", "user.id = :userId", { userId: user.id })
      .getMany();

    res.send(rooms);
  };

  static getOne = async (req: Request, res: Response) => {

    const uuid = req.params.uuid;
    let room = await RoomController.getRoomByUuid(uuid);

    if (!room) {
      return res.status(404).send({
        code: "room.not.found",
        data: null
      });
    }

    res.send(room);
  };

  static create = async (req: Request, res: Response) => {
    let { name, capacity } = req.body;

    let user = await UserController.getUserByUsername(res.locals.jwtPayload.userId || 0);
    if (!user) {
      return res.status(401).send({
        code: "room.create.not.authorized",
        data: null
      });
    }

    let room = new Room();
    room.uuid = uuidv4();
    room.name = name || room.uuid;
    room.capacity = capacity || 5;
    room.host = user;
    room.users = [user];

    const errors = await validate(room);

    if (errors.length > 0) {
      delete errors["target"];
      return res.status(400).send({
        code: "room.create.errors",
        data: { errors: errors },
      });
    }

    try {
      await getRepository(Room).save(room);
    } catch (e) {
      return res.status(409).send({
        code: "room.create.uuid.in.use",
        data: null,
      });
    }

    res.status(200).send({
      code: "room.create.success",
      data: { room },
    });
  };


  static updateRoom = async (req: Request, res: Response) => {
    let { name, host, capacity } = req.body;
    let userId = res.locals.jwtPayload.userId || 0;
    let hostTo;

    let room = await RoomController.getRoomByUuid(req.params.uuid);
    if (!room) {
      return res.status(404).send({
        code: "room.update.not.found",
        data: null
      });
    }

    if (host) {
      hostTo = UserController.getUserByUsername(host)
      if (!hostTo) {
        return res.status(404).send({
          code: "room.update.host.invalid",
          data: null
        });
      }
    }

    if (!room.host || (room.host.id !== userId)) {
      return res.status(404).send({
        code: "room.update.unauthorized",
        data: null
      });
    }

    room.name = name || room.name || room.uuid;
    room.host = hostTo || room.host;
    room.capacity = capacity || room.capacity;

    if (room.capacity < room.users.length) {
      return res.status(400).send({
        code: "room.update.capacity",
        data: null
      });
    }

    const errors = await validate(room);
    if (errors.length > 0) {
      return res.status(400).send({
        code: "room.update.errors",
        data: { errors: errors },
      });
    }

    try {
      await getRepository(Room).save(room);
    } catch (e) {
      return res.status(409).send({
        code: "room.update.uuid.in.use",
        data: null,
      });
    }

    res.status(200).send({
      code: "room.update.success",
      data: { room },
    });
  };

  static go = async (req: Request, res: Response) => {

    let { uuid } = req.body;

    let userId = res.locals.jwtPayload.userId || 0;
    let room = await RoomController.getRoomByUuid(uuid);

    if (!room) {
      return res.status(404).send({
        code: "room.go.not.found",
        data: null
      });
    }

    const userRoom = await getRepository(Room).createQueryBuilder("room")
      .innerJoinAndSelect("room.users", "user", "user.id = :userId", { userId: userId })
      .where("room.id = :roomId", { roomId: room.id })
      .getOne();

    let code;

    if (userRoom) {

      await getConnection()
        .createQueryBuilder()
        .relation(Room, "users")
        .of(room.id)
        .remove(userId);

      code = "room.user.leave";

    } else {

      await getConnection()
        .createQueryBuilder()
        .relation(Room, "users")
        .of(room.id)
        .add(userId);
      code = "room.user.joined"
    }

    room = await RoomController.getRoomByUuid(room.id.toString());

    res.status(200).send({
      code,
      data: { room }
    });

  };

  static deleteRoom = async (req: Request, res: Response) => {

    const userId = res.locals.jwtPayload.userId || 0;

    let room = await RoomController.getRoomByUuid(req.params.uuid);
    if (!room) {
      return res.status(404).send({
        code: "room.delete.not.found",
        data: null
      });
    }

    if (!room.host || (room.host.id !== userId)) {
      return res.status(401).send({
        code: "room.delete.unauthorized",
        data: null
      });
    }

    if (room.users.length > 1) {
      return res.status(400).send({
        code: "room.delete.in.use",
        data: null
      });
    }

    try {
      await getRepository(Room).remove(room);
    } catch (error) {
      return res.status(200).send({
        code: "room.delete.error",
        data: { room }
      });
    }

    res.status(200).send({
      code: "room.delete.success",
      data: { room }
    });
  }

  static getRoomByUuid = async (uuid: string) => {
    try {
      return await getRepository(Room).findOneOrFail({
        where: [
          { id: uuid },
          { uuid: uuid },
        ],
        relations: ["host", "users"]
      });
    } catch (error) {
      return null;
    }
  }

}

export default RoomController;
