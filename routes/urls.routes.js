import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { urlSchema } from "../schemas/urls.schemas.js";
import { shortenUrl } from "../controllers/urls.controller.js";
import { authValidation } from "../middlewares/auth.middleware.js";

const urlsRouter = Router();

urlsRouter.post("/urls/shorten", authValidation, validateSchema(urlSchema), shortenUrl);

export default urlsRouter;