import { connect } from "mongoose";

export const connectDB = async () => {
  try {
    await connect(process.env.MONGODB_URL!);
    console.log("Connection to MongoDB server established");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

