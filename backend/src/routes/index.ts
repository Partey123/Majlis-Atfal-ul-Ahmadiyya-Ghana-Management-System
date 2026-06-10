import { Router, type IRouter } from "express";
import healthRouter from "./health";
import membersRouter from "./members";
import locationsRouter from "./locations";
import analyticsRouter from "./analytics";
import graduationsRouter from "./graduations";

const router: IRouter = Router();

router.use(healthRouter);
router.use(membersRouter);
router.use(locationsRouter);
router.use(analyticsRouter);
router.use(graduationsRouter);

export default router;
