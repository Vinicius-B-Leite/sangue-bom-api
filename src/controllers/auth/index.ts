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

    async login(req: Request, res: Response) {
        const { email, password } = req.body

        const user = await prismaClient.users.findFirst({
            where: {
                email
            }
        })

        if (!user) {
            const bloodCollectors = await prismaClient.bloodCollectors.findFirst({
                where: {
                    email
                }
            })

            if (!bloodCollectors){
                return res.json({error: 'Nenhum usuário encontrado'})
            }

            if (bloodCollectors.password !== password){
                return res.json({error: 'Sennha incorreta'})
            }

            const token = jwt.sign({ uid: bloodCollectors.uid }, process.env.JWT_PASS ?? '', { expiresIn: '15d' })
            return res.json({...bloodCollectors, token, type: 'blood collectors'})
        }

        if (user.password !== password){
            return res.json({error: 'Senha incorreta'})
        }

        const token = jwt.sign({ uid: user.uid }, process.env.JWT_PASS ?? '', { expiresIn: '15d' })
        return res.json({...user, token, type: 'normal user'})


    }
}

export const authController = new AuthController()