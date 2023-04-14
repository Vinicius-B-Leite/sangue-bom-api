import { Router } from "express";
import { authController } from "./controllers/auth";
import { bloodCollectorsController } from "./controllers/bloodCollectors";
import { isLogged } from "./middleware/isLoged";

const router = Router()

router.post('/auth/create', authController.store)
router.post('/bloodcollectors/create', bloodCollectorsController.store)

router.post('/auth/login', authController.login)


router.get('/', isLogged)

export default router