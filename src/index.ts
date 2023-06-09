import express from 'express'
import App from './services/ExpressApp'
import dbconnection from './services/Database'
import { PORT } from './config'

const StartServer = async () => {

    const app = express()

    await dbconnection()

    await App(app)

    app.listen(PORT, () => {
        console.log("Listening to port " + PORT)
    })

}

StartServer()