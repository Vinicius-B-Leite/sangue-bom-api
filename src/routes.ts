import { Router } from "express";

const router = Router()

router.get('/', (req, res) => res.send('Server is runnig'))

export default router