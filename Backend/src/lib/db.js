import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Database Connected ${connect.connection.name}`);
  } catch (error) {
    console.log("Erorr in Connection with Database", error);
    process.exit(1);
  }
};

export default connectDb;