import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const createSecretToken = (id) => {
    const secretToken = jwt.sign({id}, process.env.SECRET_TOKEN_AUTHENTICATOR_KEY, {
        expiresIn: 3 * 24 * 60 * 60 
    });

    return secretToken;
    

};

export {createSecretToken};




