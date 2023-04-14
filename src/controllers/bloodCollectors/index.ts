import { Request, Response } from "express";
import { prismaClient } from "../../prisma";
import * as jwt from 'jsonwebtoken'

class BloodCollectorsController {
    async store(req: Request, res: Response) {
        const { email, username, password, imageURL, phoneNumber, adress } = req.body

        const bloodCollectors = await prismaClient.bloodCollectors.create({
            data: {
                email,
                username,
                password,
                imageURL,
                phoneNumber,
                adress
            }
        })

        const token = jwt.sign({ uid: bloodCollectors.uid }, process.env.JWT_PASS ?? '', { expiresIn: '15d' })
        
        return res.json({ ...bloodCollectors, token })
    }


}

export const bloodCollectorsController = new BloodCollectorsController()