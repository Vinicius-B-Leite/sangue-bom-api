import { Request, Response } from "express";
import {prismaClient} from '../../prisma'

class AuthController {
    async store(req: Request, res: Response){
        const { email, bloodType, username, password } = req.body

        const user = await prismaClient.users.
    }
}