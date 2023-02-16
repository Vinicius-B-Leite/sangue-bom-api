import express from 'express'
import router from './routes'


const app = express()
app.use(router)
app.use(express.json())

app.listen(3333, () => console.log('Server is running'))