const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");

const validators = require("../../util/validators");
const User = require("../../models/User");
const config = require("../../config");

const generateToken = (user) => {
    return jwt.sign({
        id: user._id,
        email: user.email,
        username: user.username,
    }, config.JWT_SECRET, {expiresIn: "1h"});
}

module.exports = {
    Query: {

    },
    
    Mutation: {
        login: async(parent, args, context, info) => {
            const {username, password} = args;

            const {errors, valid} = validators.validateLoginInput(username, password);

            if(!valid) {
                throw new UserInputError("Errors", {errors});
            }

            const user = await User.findOne({username});

            const match = user ? await bcrypt.compare(password, user.password) : false;
            if(!match) {
                errors.general = "Wrong username or password";
                throw new UserInputError("Wrong username or password", {errors});
            }

            const token = generateToken(user);

            return {
                ...user._doc,
                id: user._id,
                token
            };
        },

        register: async (parent, args, context, info) => {
            const {username, email, password, confirmPassword } = args.registerInput;
            
            const {valid, errors} = validators.validateRegisterInput(username, email, password, confirmPassword);
            if(!valid) {
                throw new UserInputError("Errors", { errors });
            }

            const user = await User.findOne({username});
            if(user) {
                throw new UserInputError("Username already taken");
            }

            const passwordHash = await bcrypt.hash(password, 12);

            const newUser = new User({
                username,
                email,
                password: passwordHash,
                createdAt: new Date().toISOString(),
            });

            const res = await newUser.save();

            const token = generateToken(res);
            
            return {
                ...res._doc,
                id: res._id,
                token,
            }
        },
    }
}