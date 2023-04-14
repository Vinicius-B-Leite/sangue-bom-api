import { Request, Response } from "express";
import { prismaClient } from "../../prisma";



class QuestionsController {
    async store(req: Request, res: Response) {
        const { questions, answare } = req.body

        const q = await prismaClient.questions.create({
            data: {
                answare,
                questions
            }
        })

        return res.json(q)
    }

    async index(req: Request, res: Response){
        const posts = await prismaClient.questions.findMany()

        return res.json(posts)
    }
}

export const questionsController = new QuestionsController()