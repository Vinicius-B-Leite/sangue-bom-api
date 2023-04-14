import { Router } from "express";
import { authController } from "./controllers/auth";
import { bloodCollectorsController } from "./controllers/bloodCollectors";
import { isLogged } from "./middleware/isLoged";
import { postController } from "./controllers/post";
import { questionsController } from "./controllers/questions";
import { alertController } from "./controllers/alert";

const router = Router()

router.post('/auth/create', authController.store)
router.put('/auth/update', isLogged, authController.update)

router.post('/bloodcollectors/create', bloodCollectorsController.store)
router.get('/bloodcollectors', bloodCollectorsController.show)

router.post('/auth/login', authController.login)

router.post('/posts', isLogged, postController.store)
router.put('/posts', isLogged, postController.update)

router.post('/questions', isLogged, questionsController.store)
router.get('/questions', isLogged, questionsController.index)

router.post('/alert', isLogged, alertController.store)
router.get('/alert', isLogged, alertController.index)
export default router