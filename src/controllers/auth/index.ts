import { Request, Response } from "express";
import { prismaClient } from "../../prisma";
import * as jwt from 'jsonwebtoken'
import path from 'path'
import fs from 'fs'

class AuthController {
    async store(req: Request, res: Response) {
        const { email, bloodType, username, password } = req.body

        if (!email || !bloodType || !username || !password) {
            throw new Error(JSON.stringify({ message: 'Informe todos os dados do usuário', code: '01' }))
        }

        const userExists = await prismaClient.users.findFirst({ where: { email } })
        if (userExists) {
            throw new Error(JSON.stringify({ message: 'Este email já está em uso', code: '02' }))
        }

        if (String(password).length < 8) {
            throw new Error(JSON.stringify({ message: 'A senha deve ter no mínimo 8 caracteres', code: '03' }))
        }


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

        if (!email || !password) {
            throw new Error(JSON.stringify({ message: 'Este email já está em uso', code: '02' }))
        }
        if (String(password).length < 8) {
            throw new Error(JSON.stringify({ message: 'A senha deve ter no mínimo 8 caracteres', code: '03' }))
        }


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
                throw new Error(JSON.stringify({ message: 'Nenhum usuário encontrado', code: '05' }))
            }

            if (bloodCollectors.password !== password) {
                throw new Error(JSON.stringify({ message: 'Senha incorreta', code: '06' }))
            }

            const token = jwt.sign({ uid: bloodCollectors.uid }, process.env.JWT_PASS ?? '', { expiresIn: '15d' })
            return res.json({ ...bloodCollectors, token, type: 'blood collectors' })
        }

        if (user.password !== password) {
            throw new Error(JSON.stringify({ message: 'Senha incorreta', code: '06' }))
        }

        const token = jwt.sign({ uid: user.uid }, process.env.JWT_PASS ?? '', { expiresIn: '15d' })
        return res.json({ ...user, token, type: 'normal user' })


    }

    async update(req: Request, res: Response) {
        const { email, password, bloodType, phoneNumber, adress, uid, username } = req.body

        if (!uid){
            throw new Error(JSON.stringify({ message: 'Envie o uid', code: '07' }))
        }

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

            if (!bloodCollectors) {
                throw new Error(JSON.stringify({ message: 'Nenhum usuário encontrado', code: '05' }))
            }

            if (bloodCollectors.imageURL && bloodCollectors.imageURL.length > 0 && req.file?.filename) {
                const uploadsPath = path.resolve(__dirname, '..', '..', '..', 'uploads')
                fs.unlink(`${uploadsPath}/${bloodCollectors.imageURL.split('/')[1]}`, () => { })
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