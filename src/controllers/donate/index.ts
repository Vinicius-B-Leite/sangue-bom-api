import { Request, Response, response } from "express";
import { prismaClient } from "../../prisma";
import { differenceInCalendarDays } from "date-fns";


class DonateController {
    async store(req: Request, res: Response) {
        const { userID, date, bloodCollectorID } = req.body

        if (!userID || !date || !bloodCollectorID) {
            throw new Error(JSON.stringify({ message: 'Envie todos os dados', code: '17' }))
        }

        const userExists = await prismaClient.users.findFirst({ where: { uid: userID } })
        if (!userExists) {
            throw new Error(JSON.stringify({ message: 'Envie um uid válido', code: '07' }))
        }

        const bloodCollectorExists = await prismaClient.bloodCollectors.findFirst({ where: { uid: bloodCollectorID } })
        if (!bloodCollectorExists) {
            throw new Error(JSON.stringify({ message: 'Envie um id válido do ponto de coleta', code: '18' }))
        }

        if (new Date(date) > new Date()) {
            throw new Error(JSON.stringify({ message: 'Data além do limite', code: '19' }))
        }

        const donate = await prismaClient.donate.create({
            data: {
                date,
                bloodCollectoID: bloodCollectorID,
                userID
            }
        })

        return res.json(donate)

    }
    async show(req: Request, res: Response) {
        const userid = req.query.userid as string
        const daysMaleShouldWaitToDonate = 60
        const daysFemaleShouldWaitToDonate = 90

        if (!userid) {
            const donates = await prismaClient.donate.findMany()
            return res.json(donates)

        }


        const user = await prismaClient.users.findFirst({ where: { uid: userid } })
        if (!user) {
            throw new Error(JSON.stringify({ message: 'Envie o uid válido', code: '07' }))
        }

        const donates = await prismaClient.donate.findMany({
            where: {
                userID: userid
            },
            include: {
                bloodCollectors: true,
                users: true
            },
            orderBy: {
                date: 'desc'
            }
        })
        let waitDaysToDonate = 0
        const lastDonateDaysDiff = differenceInCalendarDays(donates[0].date, new Date())

        if (user.gender === 'male') {
            waitDaysToDonate = lastDonateDaysDiff <= 0 ? 0 : daysMaleShouldWaitToDonate - differenceInCalendarDays(donates[0].date, new Date())
        }
        if (user.gender === 'female') {
            waitDaysToDonate = lastDonateDaysDiff <= 0 ? 0 : daysFemaleShouldWaitToDonate - differenceInCalendarDays(donates[0].date, new Date())
        }
        return res.json({ donates, waitDaysToDonate })
    }
}


export const donateController = new DonateController()