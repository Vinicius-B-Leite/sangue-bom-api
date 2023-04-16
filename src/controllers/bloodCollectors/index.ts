import { Request, Response } from "express";
import { prismaClient } from "../../prisma";
import * as jwt from 'jsonwebtoken'

class BloodCollectorsController {
    async store(req: Request, res: Response) {
        const { email, username, password, phoneNumber, adress } = req.body

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

            return res.json(bloodCollectors)
        }
        const bloodCollectors = await prismaClient.bloodCollectors.findMany({
            include: {
                alert: true
            }
        })


        return res.json(bloodCollectors)
    }

}

export const bloodCollectorsController = new BloodCollectorsController()