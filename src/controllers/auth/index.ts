import { Request, Response } from "express";
import { prismaClient } from "../../prisma";
import * as jwt from 'jsonwebtoken'
import path from 'path'
import fs from 'fs'

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

            if (!bloodCollectors) {
                return res.json({ error: 'Nenhum usuário encontrado' })
            }

            if (bloodCollectors.password !== password) {
                return res.json({ error: 'Sennha incorreta' })
            }

            const token = jwt.sign({ uid: bloodCollectors.uid }, process.env.JWT_PASS ?? '', { expiresIn: '15d' })
            return res.json({ ...bloodCollectors, token, type: 'blood collectors' })
        }

        if (user.password !== password) {
            return res.json({ error: 'Senha incorreta' })
        }

        const token = jwt.sign({ uid: user.uid }, process.env.JWT_PASS ?? '', { expiresIn: '15d' })
        return res.json({ ...user, token, type: 'normal user' })


    }

    async update(req: Request, res: Response) {
        const { email, password, bloodType, imageURL, phoneNumber, adress, uid, username } = req.body

        const user = await prismaClient.users.findFirst({
            where: {
                uid
            }
        })

        if (!user) {
            const bloodCollectors = await prismaClient.bloodCollectors.findFirst({
                where: {
                    uid
                }
            })

            if (!bloodCollectors) return res.status(401).json({ error: 'Usuário não encontrado' })

            if (bloodCollectors.imageURL && bloodCollectors.imageURL.length > 0){
                const uploadsPath = path.resolve(__dirname, '..', '..', '..', 'uploads')
                fs.unlink(`${uploadsPath}/${bloodCollectors.imageURL.split('/')[1]}`, () => {})
            }

            const updatedBloocCollectors = await prismaClient.bloodCollectors.update({
                where: {
                    uid
                },
                data: {
                    email,
                    password,
                    imageURL: req.file?.filename && 'images/' + req.file?.filename,
                    phoneNumber,
                    adress,
                    username
                }
            })

            return res.json(updatedBloocCollectors)
        }

        const updatedUser = await prismaClient.users.update({
            where: {
                uid
            },
            data: {
                email,
                password,
                bloodType,
                username
            }
        })

        return res.json(updatedUser)
    }
}

export const authController = new AuthController()