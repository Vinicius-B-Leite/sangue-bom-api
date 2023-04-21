import { Request, Response } from "express";
import { prismaClient } from "../../prisma";


class AlertController {
    async store(req: Request, res: Response) {
        const { bloodTypes, bloodCollectorsID, status } = req.body

        if (!bloodCollectorsID || !bloodTypes || !status) {
            throw new Error(JSON.stringify({ message: 'Envie os dados do alerta', code: '10' }))
        }

        const alreadyExists = await prismaClient.alert.findFirst({
            where: {
                bloodCollectorsID
            }
        })

        if (alreadyExists) {
            const alert = await prismaClient.alert.update({
                where: {
                    id: alreadyExists.id
                },
                data: {
                    bloodTypes,
                    status
                }
            })

            return res.json(alert)
        }
        const alert = await prismaClient.alert.create({
            data: {
                status,
                bloodCollectorsID,
                bloodTypes
            }
        })

        return res.json(alert)
    }

    async index(req: Request, res: Response) {
        const alerts = await prismaClient.alert.findMany({
            include: {
                bloodCollectors: true
            }
        })

        return res.json(alerts)
    }
}


export const alertController = new AlertController()