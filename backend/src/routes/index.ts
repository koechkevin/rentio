import authRoutes from "./auth.routes";
import ownerRoutes from "./owner.routes";
import tenantRoutes from "./tenant.routes";
import publicRoutes from "./public.routes";
import { Router } from "express";

const router = Router();

router.use(`/auth`, authRoutes);
router.use(`/owner`, ownerRoutes);
router.use(`/tenant`, tenantRoutes);
router.use(`/public`, publicRoutes);

export default router;
