import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { userLoginSchema, userSchema } from "../schemas/users.schemas.js";
import { getUrlsByUser, ranking, signIn, signUp } from "../controllers/users.controller.js";
import { authValidation } from "../middlewares/auth.middleware.js";

const usersRouter = Router();

usersRouter.post("/signup", validateSchema(userSchema), signUp);
usersRouter.post("/signin", validateSchema(userLoginSchema), signIn);
usersRouter.get("/users/me", authValidation, getUrlsByUser);
usersRouter.get("/ranking", ranking);

export default usersRouter;