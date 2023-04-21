import { NextFunction, Request, Response } from "express";
import * as jwt from 'jsonwebtoken'

export async function isLogged(req: Request, res: Response, nxt: NextFunction) {
    const authorization = req.headers.authorization

    if (!authorization) {
        throw new Error(JSON.stringify({ message: 'Não autorizado', code: '12' }))
    }

    const token = authorization?.split(' ')[1]
    const isValide = jwt.verify(token, process.env.JWT_PASS ?? '')

    if (!isValide) {
        throw new Error(JSON.stringify({ message: 'Token inválido', code: '11' }))
    }

    return nxt()

}