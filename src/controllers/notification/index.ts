import { Request, Response } from "express";
import { prismaClient } from "../../prisma";




type QueryObjectConfigType = {
    where: {
        userUID: string
    },
    cursor?: {
        id: string
    }
}
class NotificationController {
    async index(req: Request, res: Response) {
        const uid = req.query.uid as string

        if (!(String(uid))) {
            throw new Error(JSON.stringify({ message: 'Envie um uid válido', code: '07' }))
        }

        const hasUser = await prismaClient.users.findFirst({
            where: {
                donors: {
                    uid
                }
            }
        })


        if (!hasUser) {
            throw new Error(JSON.stringify({ message: 'Nenhum usuário encontrado', code: '05' }))
        }

        const notification = await prismaClient.notification.findMany({
            where: {
                donorsUID: uid
            },
            orderBy: {
                createdAt: 'desc'
            }
        })


        return res.json(notification)

    }
    async show(req: Request, res: Response) {
        const uid = req.query.uid as string
        const lastedRead = req.query.lastedread as string

        if (!uid) {
            throw new Error(JSON.stringify({ message: 'Envie um uid válido', code: '07' }))
        }

        const hasUser = await prismaClient.users.findFirst({
            where: {
                donors: {
                    uid
                }
            }
        })


        if (!hasUser) {
            throw new Error(JSON.stringify({ message: 'Nenhum usuário encontrado', code: '05' }))
        }


        const notifications = await prismaClient.notification.findMany({
            where: {
                donorsUID: uid
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        const index = notifications.findIndex(v => v.id === lastedRead)
        const numberOfNotification = notifications.filter((n, i) => index > i)

        return res.json(lastedRead ? numberOfNotification.length : notifications.length)

    }
}

export const notificationController = new NotificationController()