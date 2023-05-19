import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { userLoginSchema, userSchema } from "../schemas/users.schemas.js";
import { signIn, signUp } from "../controllers/users.controller.js";

const usersRouter = Router();

usersRouter.post("/signup", validateSchema(userSchema), signUp);
usersRouter.post("/signin", validateSchema(userLoginSchema), signIn);

export default usersRouter;