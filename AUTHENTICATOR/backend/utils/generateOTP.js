import randomize from 'randomatic';

const generateOTP = () => {
    return randomize('0', 6);
};

export { generateOTP };

