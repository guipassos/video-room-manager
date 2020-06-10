import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { User } from "../entity/User";

class AuthController {

  static register = async (req: Request, res: Response) => {

    let { username, password, mobileToken } = req.body;
    let user = new User();
    user.username = require('slugify')(username);
    user.password = password;
    user.mobileToken = mobileToken;
    user.role = "USER";

    const errors = await validate(user);
    if (errors.length > 0) {

      delete errors["target"]; // to clear password on list errors

      return res.status(400).send({
        code: "auth.register.errors",
        data: { errors: errors },
      });
    }

    user.hashPassword();

    try {
      await getRepository(User).save(user);
    } catch (e) {
      return res.status(409).send({
        code: "auth.register.username.in.use",
        data: null,
      });
    }

    user = await getRepository(User).findOne(user.id);

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).send({
      code: "auth.register.success",
      data: { user, token: token },
    });
  };

  static login = async (req: Request, res: Response) => {

    let { username, password } = req.body;
    if (!(username && password)) {
      return res.status(400).send({
        code: "auth.login.invalid.params",
        data: null,
      });
    }

    let user: User;
    try {
      user = await getRepository(User)
        .createQueryBuilder()
        .where({ username })
        .addSelect("User.password")
        .getOne();

      if (!user) {
        throw "user not found";
      }
    } catch (error) {
      return res.status(404).send({
        code: "auth.login.user.not.found",
        data: null,
      });
    }

    if (!user.checkIfUnencryptedPasswordIsValid(password)) {
      return res.status(401).send({
        code: "auth.login.unauthorized",
        data: null,
      });
    }

    user = await getRepository(User).findOne(user.id);

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.send({
      code: "auth.login.success",
      data: { user, token: token },
    });
  };

  static changePassword = async (req: Request, res: Response) => {

    const userId = res.locals.jwtPayload.userId;
    const { oldPassword, newPassword } = req.body;
    let user: User;

    if (!oldPassword || !newPassword) {
      return res.status(400).send({
        code: "auth.password.invalid.params",
        data: null,
      });
    }

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
      return res.status(401).send({
        code: "auth.password.unauthorized",
        data: null,
      });
    }

    if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
      return res.status(401).send({
        code: "auth.password.invalid",
        data: null,
      });
    }

    user.password = newPassword;
    const errors = await validate(user);

    if (errors.length > 0) {
      return res.status(400).send({
        code: "auth.password.errors",
        data: { errors: errors },
      });
    }

    user.hashPassword();

    await getRepository(User).save(user);

    user = await getRepository(User).findOne(user.id);

    res.status(200).send({
      code: "auth.password.changed",
      data: { user }
    });
  };

}
export default AuthController;
