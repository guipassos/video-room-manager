import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as helmet from "helmet";
import * as cors from "cors";
import routes from "./routes";

require('dotenv').config();

createConnection()
  .then(async (connection) => {

    const app = express();
    const port = process.env.PORT || 3000;

    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use("/", routes);

    app.listen(port, () => {
      console.log(`Listening to requests on port: ${port}`);
    });
  })
  .catch((error) => console.log(error));
