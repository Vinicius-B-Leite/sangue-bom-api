import { Request, Response } from "express";
import { prismaClient } from "../../prisma";

class NotificationController {
    async index(req: Request, res: Response) {
        const uid = req.query.uid as string

        if (!(String(uid))) {
            throw new Error(JSON.stringify({ message: 'Envie o uid', code: '07' }))
        }

        const hasUser = await prismaClient.users.findFirst({ where: { uid } })

        if (!hasUser) {
            throw new Error(JSON.stringify({ message: 'Nenhum usuário encontrado', code: '05' }))
        }

        const notification = await prismaClient.notification.findMany({ where: { userUID: uid } })


        return res.json(notification)

    }
}

export const notificationController = new NotificationController()