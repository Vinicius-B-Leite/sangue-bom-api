import { Request, Response } from "express";
import { prismaClient } from "../../prisma";
import { sendNotification } from "../../services/onesignal/sendNotification";


class AlertController {
    private async sendNotificationToUsersWithBloodType(bloodTypes: string, description: string, bloodCollectorName: string) {
        for (const bloodType of bloodTypes) {
            await sendNotification({
                bodyMessage: description,
                title: `O Ponto de coleta ${bloodCollectorName} precisa da sua ajuda`,
                campaingName: 'Alerta de sangue',
                filters: [
                    {
                        field: 'tag',
                        key: 'bloodType',
                        relation: '=',
                        value: bloodType
                    }
                ]
            })
        }
    }
    store = async (req: Request, res: Response) => {
        const { bloodTypes, bloodCollectorsID, status, description } = req.body

        if (!bloodCollectorsID) {
            throw new Error(JSON.stringify({ message: 'Envie um uid válido', code: '07' }))
        }

        const hasBloodCollector = await prismaClient.bloodCollectors.findFirst({
            where: {
                uid: bloodCollectorsID
            },
            include: {
                alert: true,
                users: true
            }
        })

        if (!hasBloodCollector) {
            throw new Error(JSON.stringify({ message: 'Nenhum usuário encontrado', code: '05' }))
        }

        const alertAlreadyExists = !!hasBloodCollector.alert
        const usersHaveBloodType = await prismaClient.donors.findMany({
            where: {
                bloodType: {
                    in: bloodTypes
                }
            },
            include: {
                users: true
            }
        })
        console.log("🚀 ~ file: index.ts:57 ~ AlertController ~ store= ~ usersHaveBloodType:", usersHaveBloodType)

        if (alertAlreadyExists) {
            if (status === false) {
                await prismaClient.alert.update({
                    where: {
                        id: hasBloodCollector.alert?.id
                    },
                    data: {
                        bloodTypes,
                        status,
                        description
                    }
                })
                return res.end()

            } else {
                const [_, alert] = await Promise.all([
                    this.sendNotificationToUsersWithBloodType(bloodTypes, description, hasBloodCollector.users.username),
                    prismaClient.alert.update({
                        where: {
                            id: hasBloodCollector.alert?.id
                        },
                        data: {
                            bloodTypes,
                            status,
                            description
                        }
                    })
                ])
                console.log('bateu aqui')
                for (const user of usersHaveBloodType) {
                    await prismaClient.notification.create({
                        data: {
                            title: `O Ponto de coleta ${hasBloodCollector.users.username} precisa da sua ajuda`,
                            description: description,
                            donorsUID: user.uid,
                            type: 'alert'
                        }
                    })
                }

                return res.json(alert)
            }
        }




        if (usersHaveBloodType) {
            await this.sendNotificationToUsersWithBloodType(bloodTypes, description, hasBloodCollector.users.username)

        for (const user of usersHaveBloodType) {
                await prismaClient.notification.create({
                    data: {
                        description: description,
                        title: `O Ponto de coleta ${hasBloodCollector.users.username} precisa da sua ajuda`,
                        donorsUID: user.uid,
                        type: 'alert'
                    }
                })
            }
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