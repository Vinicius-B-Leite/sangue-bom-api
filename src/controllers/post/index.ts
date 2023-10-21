import { Request, Response } from "express";
import { prismaClient } from "../../prisma";

import fs from 'fs'
import path from 'path'
import { sendNotification } from "../../services/onesignal/sendNotification";

class PostController {
    async store(req: Request, res: Response) {
        const { linkRedirect, adress, description, bloodCollectorsID } = req.body

        if (!adress || !description || !bloodCollectorsID || !req.file) {
            throw new Error(JSON.stringify({ message: 'Envie todos os dados do post', code: '08' }))
        }

        const hasBloodCollector = await prismaClient.users.findFirst({
            where: {
                bloodCollectors: {
                    uid: bloodCollectorsID
                },
                type: 'bloodCollectors'
            },
            include: {
                bloodCollectors: true
            }
        })

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


        const users = await prismaClient.users.findMany({
            where: {
                type: 'donors'
            },
            include: {
                donors: true
            }
        })

        if (users.length > 0) {
            await sendNotification({
                bodyMessage: `Nova publicação do ponto  de coleta ${hasBloodCollector.username}`,
                campaingName: 'Nova publicação',
                data: JSON.stringify({
                    postID: post.id
                }),
                deeplink: `sanguebom://post/${post.id}`,
                title: 'Nova publicação'
            })

            for (const user of users) {

                const userIDToSendNotification = user.donors?.uid


                await prismaClient.notification.create({
                    data: {
                        title: `Nova publicação do ponto ${hasBloodCollector.username}`,
                        description: description,
                        donorsUID: userIDToSendNotification || '',
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

        if (!oldPost) {
            throw new Error(JSON.stringify({ message: 'Envie um post id válido', code: '22' }))
        }

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
        const page = Number(req.query.page)
        const take = 4
        const prevPage = page - 1


        const allPosts = await prismaClient.posts.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                bloodCollectors: {
                    include: {
                        users: true
                    }
                }
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
                    bloodCollectors: {
                        include: {
                            users: true
                        }
                    }
                }
            })
            let postsFormated = posts.map(post => ({
                ...post,
                bloodCollectors: {
                    ...post.bloodCollectors,
                    username: post.bloodCollectors.users.username
                }
            }))

            return res.json({ data: postsFormated, maxPage })
        }

        let posts = allPosts.map(post => ({ ...post, bloodCollectors: { ...post.bloodCollectors.users } }))
        return res.json({ data: posts, maxPage })

    }

    async show(req: Request, res: Response) {
        const postID = req.query.postid as string

        if (!postID) {
            throw new Error(JSON.stringify({ message: 'Envie o id do post', code: '09' }))
        }
        const post = await prismaClient.posts.findFirst({
            where: {
                id: postID
            },
            include: {
                bloodCollectors: {
                    include: {
                        users: true
                    }
                }
            }
        })


        if (!post) {
            throw new Error(JSON.stringify({ message: 'Envie um id válido', code: '15' }))
        }

        let postsFormated = ({ ...post, bloodCollectors: { ...post.bloodCollectors, ...post.bloodCollectors.users } })
        return res.json(postsFormated)
    }

    async destroy(req: Request, res: Response) {
        const id = req.query.id as string

        const post = await prismaClient.posts.findFirst({ where: { id } })

        if (!post) {
            throw new Error(JSON.stringify({ message: 'Esta campanha não existe', code: '23' }))
        }

        await prismaClient.posts.delete({ where: { id } })

        return res.json({ status: 'success' })
    }
}


export const postController = new PostController()