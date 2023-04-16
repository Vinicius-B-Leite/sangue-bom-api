import { Request, Response } from "express";
import { prismaClient } from "../../prisma";
import fs from 'fs'
import path from 'path'

class PostController {
    async store(req: Request, res: Response) {
        const { linkRedirect, adress, description, bloodCollectorsID } = req.body

        const post = await prismaClient.posts.create({
            data: {
                adress,
                bannerURL: `images/${req.file?.filename}`,
                description,
                linkRedirect,
                bloodCollectorsID
            }
        })

        return res.json(post)
    }

    async update(req: Request, res: Response) {
        const { linkRedirect, adress, description, id } = req.body

        const oldPost = await prismaClient.posts.findFirst({
            where: {
                id
            }
        })

        if (oldPost && oldPost?.bannerURL.length > 0 && req.file?.filename) {
            const filePath = path.resolve(__dirname, '..', '..', '..', 'uploads')
            fs.unlink(`${filePath}/${oldPost?.bannerURL.split('/')[1]}`, () => { })
        }

        const post = await prismaClient.posts.update({
            where: {
                id
            },
            data: {
                bannerURL: req.file?.filename ? `images/${req.file?.filename}` : oldPost?.bannerURL,
                linkRedirect,
                adress,
                description
            }
        })

        return res.json(post)
    }

}


export const postController = new PostController()