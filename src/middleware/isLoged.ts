import { NextFunction, Request, Response } from "express";
import * as jwt from 'jsonwebtoken'
import { prismaClient } from "../prisma";

type Payload = {
    uid: string
}

export async function isLogged(req: Request, res: Response, nxt: NextFunction) {
    const authorization = req.headers.authorization

    if (!authorization) {
        throw new Error(JSON.stringify({ message: 'Não autorizado', code: '12' }))
    }

    const token = authorization?.split(' ')[1]
    if (!token) {
        throw new Error(JSON.stringify({ message: 'Não autorizado', code: '12' }))
    }

    try {
        jwt.verify(token, process.env.JWT_PASS ?? '') as Payload

        return nxt()

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error(JSON.stringify({ message: 'Token expirado', code: '14' }))
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error(JSON.stringify({ message: 'Token inválido', code: '11' }))
        }
        return res.status(500).json({
            status: 'error',
            message: 'Internal server errror'
        })
    }




}