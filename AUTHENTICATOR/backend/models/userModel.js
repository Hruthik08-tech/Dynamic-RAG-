import mongoose from "mongoose";
const schema = mongoose.Schema;

const userSchema = new schema({
    username: {
        type: String, 
        required: true,
    }, 
    email: {
        type: String, 
        required: true, 

    }, 
    password: {
        type: String, 
        required: true,

    },  
    date: {
        type: String, 
    }, 
    role: {
        type: String, 
    }, 
    isVerified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
    }
})


const User = mongoose.model('User', userSchema);
export { User };


