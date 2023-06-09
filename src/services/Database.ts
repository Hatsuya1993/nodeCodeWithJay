import mongoose from "mongoose";
import { MONGO_URI } from "../config/index";

export default async () => {
    try {
        mongoose.connect(MONGO_URI).then(result => {
            console.log("Successfully connect to Mongodb")
        })
    } catch (error) {
        console.log('Error ' + error)
    }
}
