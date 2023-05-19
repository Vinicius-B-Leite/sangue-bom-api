import { Request, Response } from "express";
import { prismaClient } from "../../prisma";



class QuestionsController {
    async store(req: Request, res: Response) {
        const { questions, answare } = req.body

        if (!questions || !answare) {
            throw new Error(JSON.stringify({ message: 'Senha incorreta', code: '06' }))
        }

        const q = await prismaClient.questions.create({
            data: {
                answare,
                questions
            }
        })

        return res.json(q)
    }

    async index(req: Request, res: Response) {
        const posts = await prismaClient.questions.findMany()

        return res.json(posts)
    }

    async destory(req: Request, res: Response) {
        const id = req.query.id as string

        if (!id) {
            throw new Error(JSON.stringify({ code: '15', message: 'Envie um id válido' }))
        }

        await prismaClient.questions.delete({
            where: {
                id
            }
        })

        return res.status(200)
    }
}

export const questionsController = new QuestionsController()