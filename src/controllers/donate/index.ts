import { Request, Response, response } from "express";
import { prismaClient } from "../../prisma";
import { differenceInCalendarDays } from "date-fns";


class DonateController {

    private readonly daysMaleShouldWaitToDonate = 60
    private readonly daysFemaleShouldWaitToDonate = 90

    private getDaysToDonate(gender: string, lastDonateDaysDiff: number) {
        let waitDaysToDonate = 0

        if (gender === 'male') {
            waitDaysToDonate = lastDonateDaysDiff <= 0 ? this.daysMaleShouldWaitToDonate :
                this.daysMaleShouldWaitToDonate - lastDonateDaysDiff
        }
        if (gender === 'female') {
            waitDaysToDonate = lastDonateDaysDiff <= 0 ? this.daysFemaleShouldWaitToDonate :
                this.daysFemaleShouldWaitToDonate - lastDonateDaysDiff
        }

        return waitDaysToDonate
    }


    store = async (req: Request, res: Response) => {
        const { userID, date, bloodCollectorID } = req.body


        if (!userID || !date || !bloodCollectorID) {
            throw new Error(JSON.stringify({ message: 'Envie todos os dados', code: '17' }))
        }

        const [userExists, bloodCollectorExists] = await Promise.all([
            prismaClient.users.findFirst({
                where: {
                    donors: {
                        uid: userID
                    }
                },
                include: {
                    donors: true
                }
            }),
            prismaClient.users.findFirst({
                where: {
                    bloodCollectors: {
                        uid: bloodCollectorID
                    }
                },
                include: {
                    bloodCollectors: true
                }
            })
        ])

        if (!userExists || !userExists.donors) {
            throw new Error(JSON.stringify({ message: 'Envie um uid válido', code: '07' }))
        }

        if (!bloodCollectorExists) {
            throw new Error(JSON.stringify({ message: 'Envie um id válido do ponto de coleta', code: '18' }))
        }

        if (new Date(date) > new Date()) {
            throw new Error(JSON.stringify({ message: 'Data além do limite', code: '19' }))
        }


        const donates = await prismaClient.donate.findMany({
            where: {
                donorID: userID
            },
            orderBy: {
                date: 'desc'
            }
        })

        if (donates.length > 0) {

            const lastDonateDaysDiff = differenceInCalendarDays(new Date(), donates[0].date)
            const waitDaysToDonate = this.getDaysToDonate(userExists.donors.gender, lastDonateDaysDiff)

            if (waitDaysToDonate > 0) {
                throw new Error(JSON.stringify({ message: `Ainda faltam ${waitDaysToDonate} dias para poder doar novamente`, code: '21' }))
            }
        }


        const donate = await prismaClient.donate.create({
            data: {
                date: new Date(date),
                bloodCollectoID: bloodCollectorID,
                donorID: userID,
            }
        })

        return res.json(donate)

    }
    show = async (req: Request, res: Response) => {
        const userid = req.query.userid as string

        if (!userid) {
            const donates = await prismaClient.donate.findMany()
            return res.json(donates)
        }


        const user = await prismaClient.users.findFirst({
            where: {
                donors: {
                    uid: userid
                }
            },
            include: {
                donors: true
            }
        })
        if (!user || !user.donors) {
            throw new Error(JSON.stringify({ message: 'Envie o uid válido', code: '07' }))
        }

        const donates = await prismaClient.donate.findMany({
            where: {
                donorID: userid
            },
            include: {
                bloodCollectors: {
                    include: {
                        users: true
                    }
                },
                donors: true
            },
            orderBy: {
                date: 'desc'
            }
        })

        if (donates.length === 0) {
            return res.json({ donates, waitDaysToDonate: 0 })
        }
        const lastDonateDaysDiff = differenceInCalendarDays(new Date(), donates[0].date)

        const waitDaysToDonate = this.getDaysToDonate(user.donors.gender, lastDonateDaysDiff)


        return res.json({ donates, waitDaysToDonate })
    }


}


export const donateController = new DonateController()