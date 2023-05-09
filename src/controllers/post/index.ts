import { Request, Response } from "express";
import { prismaClient } from "../../prisma";
import fs from 'fs'
import path from 'path'

class PostController {
    async store(req: Request, res: Response) {
        const { linkRedirect, adress, description, bloodCollectorsID } = req.body
        if (!linkRedirect || !adress || !description || !bloodCollectorsID || !req.file) {
            throw new Error(JSON.stringify({ message: 'Envie todos os dados do post', code: '08' }))
        }

        const hasBloodCollector = await prismaClient.bloodCollectors.findFirst({ where: { uid: bloodCollectorsID } })

        if (!hasBloodCollector) {
            throw new Error(JSON.stringify({ message: 'Nenhum usuário encontrado', code: '05' }))
        }
        const post = await prismaClient.posts.create({
            data: {
                adress,
                bannerURL: `images/${req.file?.filename}`,
                description,
                linkRedirect,
                bloodCollectorsID
            }
        })


        const users = await prismaClient.users.findMany()

        if (users.length > 0) {

            for (const user of users) {
                await prismaClient.notification.create({
                    data: {
                        title: `Nova publicação do ponto ${user.username}`,
                        description: description,
                        userUID: user.uid,
                        type: 'post',
                        postID: post.id
                    }
                })
            }
        }

        return res.json(post)
    }

    async update(req: Request, res: Response) {
        const { linkRedirect, adress, description, id } = req.body

        if (!id) {
            throw new Error(JSON.stringify({ message: 'Envie o id do post', code: '09' }))
        }


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

    async index(req: Request, res: Response) {
        const page = Number(req.query.page as string)
        const take = 4
        const prevPage = page - 1


        const allPosts = await prismaClient.posts.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                bloodCollectors: true
            }
        })

        const maxPage = Math.ceil(allPosts.length / take)

        if (page) {
            const posts = await prismaClient.posts.findMany({
                orderBy: {
                    createdAt: 'desc'
                },
                skip: page === 1 ? 0 : prevPage * take,
                take,
                include: {
                    bloodCollectors: true
                }
            })
            return res.json({ data: posts, maxPage })
        }


        return res.json({ data: allPosts, maxPage })

    }
}


export const postController = new PostController()