import { Request, Response } from "express";
import { prismaClient } from "../../prisma";


class AlertController {
    async store(req: Request, res: Response) {
        const { bloodTypes, bloodCollectorsID, status, description } = req.body
        console.log( bloodTypes, bloodCollectorsID, status, description)

        if (!bloodCollectorsID ) {
            throw new Error(JSON.stringify({ message: 'Envie o uid', code: '07' }))
        }

        const hasBloodCollector = await prismaClient.bloodCollectors.findFirst({ where: { uid: bloodCollectorsID } })

        if (!hasBloodCollector) {
            throw new Error(JSON.stringify({ message: 'Nenhum usuário encontrado', code: '05' }))
        }

        const alreadyExists = await prismaClient.alert.findFirst({
            where: {
                bloodCollectorsID
            }
        })


        const users = await prismaClient.users.findMany({
            where: {
                bloodType: {
                    in: bloodTypes
                }
            }
        })

        if (users) {
            for (const user of users) {
                await prismaClient.notification.create({
                    data: {
                        description: description,
                        title: `O Ponto de coleta ${hasBloodCollector.username} precisa da sua ajuda`,
                        userUID: user.uid,
                        type: 'alert'
                    }
                })
            }
        }


        if (alreadyExists) {
            const alert = await prismaClient.alert.update({
                where: {
                    id: alreadyExists.id
                },
                data: {
                    bloodTypes,
                    status,
                    description: description
                }
            })

            return res.json(alert)
        }

        const alert = await prismaClient.alert.create({
            data: {
                status,
                bloodCollectorsID,
                bloodTypes,
                description: description
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