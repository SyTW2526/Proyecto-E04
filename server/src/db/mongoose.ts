import { connect } from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

export const mongoConnectionPromise = connect(process.env.MONGODB_URL!)
	.then(() => {
		console.log("Connection to MongoDB server established");
		return true; 
	})
	.catch((error) => {
		console.error("Error connecting to MongoDB:", error);
		throw error; 
	});