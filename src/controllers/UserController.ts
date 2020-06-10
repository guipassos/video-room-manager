import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";

import { User } from "../entity/User";

class UserController {

  static listAll = async (req: Request, res: Response) => {

    const users = await getRepository(User).find();

    res.send(users);
  };

  static getOne = async (req: Request, res: Response) => {

    const user = await UserController.getUserByUsername(req.params.username);

    if (!user) {
      return res.status(404).send({
        code: "user.not.found",
        data: null
      });
    }

    res.send(user);
  };

  static updateUser = async (req: Request, res: Response) => {

    const userId = res.locals.jwtPayload.userId;
    const { username, mobileToken } = req.body;
    let user;

    try {
      user = await getRepository(User)
        .createQueryBuilder()
        .where({ id: userId })
        .addSelect("User.password")
        .getOne();

      if (!user) {
        throw "user unauthorized";
      }
    } catch (error) {
      return res.status(404).send({
        code: "user.unauthorized",
        data: null
      });
    }

    user.username = username;
    user.mobileToken = mobileToken;

    const errors = await validate(user);
    if (errors.length > 0) {
      return res.status(400).send(errors);
    }

    try {
      await getRepository(User).save(user);
    } catch (e) {
      return res.status(409).send({
        code: "auth.update.username.in.use",
        data: null,
      });
    }

    user = await UserController.getUserByUsername(userId);

    res.status(200).send({
      code: "user.update.success",
      data: user
    });
  };

  static deleteUser = async (req: Request, res: Response) => {

    const userId = res.locals.jwtPayload.userId;
    let user: User;

    user = await UserController.getUserByUsername(userId);
    if (!user) {
      return res.status(404).send({
        code: "user.not.found",
        data: null
      });
    }

    try {
      await getRepository(User).delete(userId);
    } catch (error) {
      return res.status(200).send({
        code: "user.delete.error",
        data: { user }
      });
    }

    res.status(200).send({
      code: "user.deleted",
      data: user
    });
  };

  static getUserByUsername = async (username: string) => {
    try {
      return await getRepository(User).findOneOrFail({
        where: [
          { id: username },
          { username: username },
        ],
      });
    } catch (error) {
      return null;
    }
  }
}

export default UserController;
