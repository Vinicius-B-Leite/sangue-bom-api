import { Request, Response } from "express";
import { prismaClient } from "../../prisma";
import * as jwt from 'jsonwebtoken'

class AuthController {
    async store(req: Request, res: Response) {
        const { email, bloodType, username, password } = req.body

        const user = await prismaClient.users.create({
            data: {
                email,
                bloodType,
                username,
                password
            }
        })

        const token = jwt.sign({ uid: user.uid }, process.env.JWT_PASS ?? '', { expiresIn: '15d' })

        return res.json({ ...user, token })
    }


}

export const authController = new AuthController()