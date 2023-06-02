import { Request, Response, response } from "express";
import { prismaClient } from "../../prisma";
import { differenceInCalendarDays } from "date-fns";


class DonateController {



    async store(req: Request, res: Response) {
        const { userID, date, bloodCollectorID } = req.body
        const daysMaleShouldWaitToDonate = 60
        const daysFemaleShouldWaitToDonate = 90
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

        const getDaysToDonate = (gender: string, lastDonateDaysDiff: number) => {
            let waitDaysToDonate = 0

            if (gender === 'male') {
                waitDaysToDonate = lastDonateDaysDiff <= 0 ? 0 :
                    daysMaleShouldWaitToDonate - lastDonateDaysDiff
            }
            if (gender === 'female') {
                waitDaysToDonate = lastDonateDaysDiff <= 0 ? 0 : daysFemaleShouldWaitToDonate - lastDonateDaysDiff
            }

            return waitDaysToDonate
        }





        const donates = await prismaClient.donate.findMany({
            where: {
                userID: userID
            },
            orderBy: {
                date: 'desc'
            }
        })
        if (donates.length === 0){
            const donate = await prismaClient.donate.create({
                data: {
                    date,
                    bloodCollectoID: bloodCollectorID,
                    userID
                }
            })
    
            return res.json(donate)
        }
        const lastDonateDaysDiff = differenceInCalendarDays(donates[0].date, new Date())

        const waitDaysToDonate = getDaysToDonate(userExists.gender, lastDonateDaysDiff)

        if (waitDaysToDonate > 0) {
            throw new Error(JSON.stringify({ message: `Ainda faltam ${waitDaysToDonate} dias para poder doar novamente`, code: '21' }))
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
        const getDaysToDonate = (gender: string, lastDonateDaysDiff: number) => {
            let waitDaysToDonate = 0

            if (gender === 'male') {
                waitDaysToDonate = lastDonateDaysDiff < 0 ? 0 :
                    daysMaleShouldWaitToDonate - lastDonateDaysDiff
            }
            if (gender === 'female') {
                waitDaysToDonate = lastDonateDaysDiff <= 0 ? 0 : daysFemaleShouldWaitToDonate - lastDonateDaysDiff
            }

            return waitDaysToDonate
        }


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
        if (donates.length === 0) {            
            return res.json({ donates, waitDaysToDonate: 0 })
        }
        const lastDonateDaysDiff = differenceInCalendarDays(donates[0].date, new Date())

        const waitDaysToDonate = getDaysToDonate(user.gender, lastDonateDaysDiff)


        return res.json({ donates, waitDaysToDonate })
    }


}


export const donateController = new DonateController()