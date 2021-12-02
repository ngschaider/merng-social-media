const { AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");

const config = require("../config");

module.exports = context => {
    const authHeader = context.req.headers.authorization;

    if(authHeader) {
        // Bearer .....
        const token = authHeader.split("Bearer ")[1];
        if(token) {
            try {
                const user = jwt.verify(token, config.JWT_SECRET);
                return user;
            } catch(err) {
                throw new AuthenticationError("Invalid/Expired token");
            }
        } else {
            throw new Error("Authentication token must be 'Bearer [TOKEN]'");
        }
    } else {
        throw new Error("Authorization header must be provided");
    }
};