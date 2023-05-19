import express, { NextFunction, Request, Response } from 'express'
import 'express-async-errors'
import router from './routes'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())
app.use(router)

app.use((err: Error, req: Request, res: Response, nxt: NextFunction) => {
    if (err instanceof Error) {
        return res.status(400).json(err.message)
    }
    return res.status(500).json({
        status: 'error',
        message: 'Internal server errror'
    })
})


const port = process.env.PORT || 3333
app.listen(port, () => console.log('Server is running'))