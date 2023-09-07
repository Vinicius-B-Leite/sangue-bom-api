import express, { NextFunction, Request, Response } from 'express'
import 'express-async-errors'
import router from './routes'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())
app.use(router)

app.use((err: Error, req: Request, res: Response, nxt: NextFunction) => {
    console.log(err);
    if (err instanceof Error) {
        try {
            return res.status(400).json(JSON.parse(err.message))
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Internal server errror'
            })
        }
    }
    
    return res.status(500).json({
        status: 'error',
        message: 'Internal server errror'
    })
})


const port = process.env.PORT || 3333
app.listen(port, () => console.log('Server is running'))