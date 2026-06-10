import mongoose from 'mongoose';
async function testDBconnection() {
    try {
        console.log(process.env.DB_URL_LOCAL);
        await mongoose.connect(process.env.DB_URL_LOCAL);
        console.log('MongoDB connected successfully');
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}
export default testDBconnection;
