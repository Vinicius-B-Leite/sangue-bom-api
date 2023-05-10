import { Router } from "express";
import { authController } from "./controllers/auth";
import { bloodCollectorsController } from "./controllers/bloodCollectors";
import { isLogged } from "./middleware/isLoged";
import { postController } from "./controllers/post";
import { questionsController } from "./controllers/questions";
import { alertController } from "./controllers/alert";
import multer from 'multer'
import express from "express";
import { notificationController } from "./controllers/notification";


const upload = multer({
    limits: {fieldSize:  25 * 1024 * 1024},
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/')
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`)
        }
    })
})
const router = Router()



router.use('/images', express.static('uploads/'))

router.post('/auth/create', authController.store)
router.post('/auth/login', authController.login)
router.post( '/bloodcollectors/create', upload.single('avatar'), bloodCollectorsController.store)


router.put('/auth/update', isLogged, upload.single('avatar'), authController.update)

router.get('/bloodcollectors', isLogged, bloodCollectorsController.show)


router.post('/posts', isLogged, upload.single('banner'), postController.store)
router.put('/posts', isLogged, upload.single('banner'), postController.update)
router.get('/posts', isLogged, postController.index)
router.get('/posts/single', isLogged, postController.show)

router.post('/questions', isLogged, questionsController.store)
router.get('/questions', isLogged, questionsController.index)

router.post('/alert', isLogged, alertController.store)
router.get('/alert', isLogged, alertController.index)

router.get('/notification', isLogged, notificationController.index)

export default router