import mongoose from "mongoose";
const connectMongoDb = async () => {
  // console.log("IN MONGOOS FUNCTION");
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Mongodb connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error connection to mongodb: ${error.message}`);
    process.exit(1);
  }
};
export default connectMongoDb;
