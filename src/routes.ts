import { Router } from "express";
import { authController } from "./controllers/auth";
import { bloodCollectorsController } from "./controllers/bloodCollectors";

const router = Router()

router.post('/auth/create', authController.store)
router.post('/bloodcollectors/create', bloodCollectorsController.store)

router.post('/auth/login', authController.login)

export default router