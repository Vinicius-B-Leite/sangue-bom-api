import { Request, Response } from "express";
import { prismaClient } from "../../prisma";
import * as jwt from 'jsonwebtoken'
import path from 'path'
import fs from 'fs'

class AuthController {
    async store(req: Request, res: Response) {
        const { email, bloodType, username, password, gender } = req.body

        if (!email || !bloodType || !username || !password || !gender) {
            throw new Error(JSON.stringify({ message: 'Informe todos os dados do usuário', code: '01' }))
        }
        if (!(String(email).includes('@'))) {
            throw new Error(JSON.stringify({ message: 'Envie um email válido', code: '13' }))
        }
        if (['male', 'female'].includes(gender) === false) {
            throw new Error(JSON.stringify({ message: 'Envie um gênero biológico válido', code: '20' }))
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
                password,
                type: 'donors',
                username,
                donors: {
                    create: {
                        bloodType,
                        gender,
                    }
                }
            },
            include: {
                donors: true
            }
        })
        const token = jwt.sign({ uid: user.donors?.uid }, process.env.JWT_PASS ?? '', { expiresIn: '15d' })

        return res.json({ ...user, token, type: 'normal user' })
    }

    async login(req: Request, res: Response) {
        const { email, password, isAdmin } = req.body

        if (!email || !password) {
            throw new Error(JSON.stringify({ message: 'Envie o email e senha para fazer login', code: '04' }))
        }
        if (!(String(email).includes('@'))) {
            throw new Error(JSON.stringify({ message: 'Envie um email válido', code: '13' }))
        }
        if (String(password).length < 8) {
            throw new Error(JSON.stringify({ message: 'A senha deve ter no mínimo 8 caracteres', code: '03' }))
        }

        const user = await prismaClient.users.findFirst({
            where: {
                email
            },
            include: {
                bloodCollectors: true,
                donors: true
            }
        })

        if (!user) {
            throw new Error(JSON.stringify({ message: 'Nenhum usuário encontrado', code: '05' }))
        }

        if (user.password !== password) {
            throw new Error(JSON.stringify({ message: 'Senha incorreta', code: '06' }))
        }


        if (isAdmin) {
            const userHasAdminType = user?.type === 'admin'

            if (!userHasAdminType) throw new Error(JSON.stringify({ message: 'Nenhum usuário encontrado', code: '05' }))


            const token = jwt.sign({ email: user.email }, process.env.JWT_PASS ?? '', { expiresIn: '15d' })
            return res.json({ ...user, token })
        }



        const isDonors = user.type === 'donors'

        const token = jwt.sign({ uid: user[isDonors ? 'donors' : 'bloodCollectors']?.uid }, process.env.JWT_PASS ?? '', { expiresIn: '15d' })
        return res.json({ ...user, token })

    }

    async update(req: Request, res: Response) {
        const { email, password, username, bloodType, phoneNumber, adress, uid } = req.body

        if (!uid) {
            throw new Error(JSON.stringify({ message: 'Envie o uid válido', code: '07' }))
        }

        const user = await prismaClient.users.findFirst({
            where: {
                OR: [
                    {
                        bloodCollectors: {
                            uid
                        }
                    },
                    {
                        donors: {
                            uid
                        }
                    }
                ]
            },
            include: {
                bloodCollectors: true,
                donors: true
            }
        })

        if (!user) {
            throw new Error(JSON.stringify({ message: 'Nenhum usuário encontrado', code: '05' }))
        }

        if (user.type === 'bloodCollectors' && user.bloodCollectors) {
            const bloodCollectors = user.bloodCollectors

            if (bloodCollectors.imageURL && bloodCollectors.imageURL.length > 0 && req.file) {
                const uploadsPath = path.resolve(__dirname, '..', '..', '..', 'uploads')
                fs.unlink(`${uploadsPath}/${bloodCollectors.imageURL.split('/')[1]}`, () => { })
            }


            const updatedBloocCollectors = await prismaClient.users.update({
                where: {
                    email: user.email
                },
                data: {
                    email,
                    password,
                    username,
                    bloodCollectors: {
                        update: {
                            imageURL: req.file?.filename && 'images/' + req.file?.filename,
                            phoneNumber,
                            adress,
                        }
                    }

                },
                include:{
                    bloodCollectors: true
                }
            })

            return res.json(updatedBloocCollectors)


        }

        const updatedUser = await prismaClient.users.update({
            where: {
                email: user.email
            },
            data: {
                email,
                password,
                username,
                donors: {
                    update: {
                        bloodType,
                    }
                }
            },
            include:{
                donors: true
            }
        })

        return res.json(updatedUser)
    }
}

export const authController = new AuthController()