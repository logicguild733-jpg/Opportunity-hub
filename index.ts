import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import leadsRouter from "./leads.js";
import skillsRouter from "./skills.js";
import adminRouter from "./admin.js";
import catalogRouter from "./catalog.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/leads", leadsRouter);
router.use("/skills", skillsRouter);
router.use("/admin", adminRouter);
router.use("/catalog", catalogRouter);

export default router;
