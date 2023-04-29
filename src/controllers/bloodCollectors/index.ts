import { Request, Response } from "express";
import { prismaClient } from "../../prisma";
import * as jwt from 'jsonwebtoken'
import { getLatAndLong } from "../../services/getLatAndLong";
import { Alert, BloodCollectors } from "@prisma/client";

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

        const bloodCollectorExists = await prismaClient.bloodCollectors.findFirst({ where: { email } })
        if (bloodCollectorExists) {
            throw new Error(JSON.stringify({ message: 'Este email já está em uso', code: '02' }))
        }

        const bloodCollectors = await prismaClient.bloodCollectors.create({
            data: {
                email,
                username,
                password,
                imageURL: req.file?.filename && 'images/' + req.file.filename,
                phoneNumber,
                adress
            }
        })

        const token = jwt.sign({ uid: bloodCollectors.uid }, process.env.JWT_PASS ?? '', { expiresIn: '15d' })

        return res.json({ ...bloodCollectors, token })
    }
    async show(req: Request, res: Response) {
        const { name } = req.query

        const getLatAndLongOfBloodCollectors = async (bloodCollectors: (BloodCollectors & { alert: Alert | null; })[]) => {
            for (const b of bloodCollectors) {
                const position = await getLatAndLong(b.adress)
                const index = bloodCollectors.indexOf(b)
                bloodCollectors[index] = { ...bloodCollectors[index], ...position }
            }
            return bloodCollectors
        }


        if (name) {
            const bloodCollectors = await prismaClient.bloodCollectors.findMany({
                where: {
                    username: {
                        contains: String(name)
                    }
                },
                include: {
                    alert: true
                }
            })

            const bloodCollectorsWithPosition = await getLatAndLongOfBloodCollectors(bloodCollectors)

            return res.json(bloodCollectorsWithPosition)
        }

        
        const bloodCollectors = await prismaClient.bloodCollectors.findMany({
            include: {
                alert: true
            }
        })

        const bloodCollectorsWithPosition = await getLatAndLongOfBloodCollectors(bloodCollectors)

        return res.json(bloodCollectorsWithPosition)
    }

}

export const bloodCollectorsController = new BloodCollectorsController()