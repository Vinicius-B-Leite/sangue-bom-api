import { Request, Response } from "express";
import { prismaClient } from "../../prisma";


class PostController {
    async store(req: Request, res: Response) {
        const { bannerURL, linkRedirect, adress, description, bloodCollectorsID } = req.body

        const post = await prismaClient.posts.create({
            data: {
                adress,
                bannerURL,
                description,
                linkRedirect,
                bloodCollectorsID
            }
        })

        return res.json(post)
    }

    async update(req: Request, res: Response) {
        const { bannerURL, linkRedirect, adress, description, id } = req.body

        const post = await prismaClient.posts.update({
            where:{
                id
            },
            data:{
                bannerURL,
                linkRedirect,
                adress,
                description
            }
        })

        return res.json(post)
    }
}


export const postController = new PostController()