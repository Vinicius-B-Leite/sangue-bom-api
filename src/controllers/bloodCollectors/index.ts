import { Request, Response } from "express";
import { prismaClient } from "../../prisma";
import * as jwt from 'jsonwebtoken'
import { getLatAndLong } from "../../services/getLatAndLong";
import { Alert, BloodCollectors } from "@prisma/client";
import { getLatAndLongOfBloodCollectors } from "../../services/getLagAndLongOfBloodCollectors";

class BloodCollectorsController {
    async store(req: Request, res: Response) {
        const { email, username, password, phoneNumber, adress } = req.body

        if (!email || !username || !password || !phoneNumber || !adress) {
            throw new Error(JSON.stringify({ message: 'Informe todos os dados do usuário', code: '01' }))
        }
        if (!(String(email).includes('@'))) {
            throw new Error(JSON.stringify({ message: 'Envie um email válido', code: '13' }))
        }
        if (String(password).length < 8) {
            throw new Error(JSON.stringify({ message: 'A senha deve ter no mínimo 8 caracteres', code: '03' }))
        }

        const bloodCollectorExists = await prismaClient.users.findFirst({
            where: {
                email,
            }
        })
        if (bloodCollectorExists) {
            throw new Error(JSON.stringify({ message: 'Este email já está em uso', code: '02' }))
        }

        const bloodCollectors = await prismaClient.users.create({
            data: {
                email,
                password,
                username,
                type: 'bloodCollectors',
                bloodCollectors: {
                    create: {
                        phoneNumber: phoneNumber as string,
                        adress,
                        imageURL: req.file?.filename && 'images/' + req.file.filename,
                    }
                }
            },
            include: {
                bloodCollectors: true
            }
        })

        const token = jwt.sign({ uid: bloodCollectors.bloodCollectors?.uid }, process.env.JWT_PASS ?? '', { expiresIn: '15d' })

        return res.json({ ...bloodCollectors, token })
    }
    async show(req: Request, res: Response) {
        const { name } = req.query
        
        if (name) {
            const user = await prismaClient.users.findMany({
                where: {
                    username: {
                        contains: String(name)
                    },
                    AND: {
                        type: 'bloodCollectors'
                    }
                },
                include: {
                    bloodCollectors: {
                        include: {
                            alert: true
                        }
                    }
                }
            })
            const bloodCollectors = user.map(b => ({ ...b.bloodCollectors, username: b.username }))


            const bloodCollectorsWithPosition = await getLatAndLongOfBloodCollectors(bloodCollectors)
            return res.json(bloodCollectorsWithPosition)

        }


        const users = await prismaClient.bloodCollectors.findMany({
            include: {
                alert: true,
                users: true
            }
        })
        const bloodCollectors = users.map(b => ({ ...b, username: b.users.username }))

        const bloodCollectorsWithPosition = await getLatAndLongOfBloodCollectors(bloodCollectors)
        
        return res.json(bloodCollectorsWithPosition)
    }

}

export const bloodCollectorsController = new BloodCollectorsController()