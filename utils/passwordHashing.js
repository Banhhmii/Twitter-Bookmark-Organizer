const bcrypt = require("bcrypt");
const saltRounds = 10;

async function hashPassword(plainPassword){
    try{
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
        return hashedPassword;
    } catch (error) {
        throw new Error("Error occurred while hashing password");
    }
}

async function verifyPassword(plainPassword, hashedPassword){
    try{
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        return isMatch;
    } catch (error) {
        throw new Error("Error occurred while verifying password");
    }
}

module.exports = {
    hashPassword,
    verifyPassword
};