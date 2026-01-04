import bcrypt from 'bcryptjs';

const comparePassword = (password, hashedpassword) => {
    return bcrypt.compare(password, hashedpassword)
};

export { comparePassword };

