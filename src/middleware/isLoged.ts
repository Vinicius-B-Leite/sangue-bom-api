import { NextFunction, Request, Response } from "express";
import * as jwt from 'jsonwebtoken'

export async function isLogged(req: Request, res: Response, nxt: NextFunction) {
    const authorization = req.headers.authorization

    if (!authorization) return res.status(401).json({ error: 'Não autorizado' })

    const token = authorization?.split(' ')[1]
    const isValide = jwt.verify(token, process.env.JWT_PASS ?? '')

    if (!isValide) return res.status(401).json({ error: 'Token inválido' })

    return nxt()

}