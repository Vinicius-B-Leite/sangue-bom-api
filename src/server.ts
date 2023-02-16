import express from 'express'
import router from './routes'


const app = express()
app.use(router)
app.use(express.json())

const port = process.env.PORT || 3333
app.listen(port, () => console.log('Server is running'))