const { AuthenticationError, UserInputError } = require("apollo-server");

const Post = require("../../models/Post");
const checkAuth = require("../../util/checkAuth");

module.exports = {
    Query: {
        getPosts: async () => {
            try {
                const posts = await Post.find().sort({ createdAt: -1 });
                return posts;
            } catch(err) {
                throw new Error(err);
            }
        },
        getPost: async (parent, {postId}, context, info) =>  {
            try {
                const post = await Post.findById(postId);
                if(post) {
                    return post;
                } else {
                    throw new Error("Post not found");
                }
            } catch(err) {
                throw new Error(err);
            }
        },
    },

    Mutation: {
        createPost: async (parent, {body}, context, info) => {
            const user = checkAuth(context);

            if(body.trim() === "") {
                throw new UserInputError("Empty post", {
                    errors: {
                        body: "Body must not be empty",
                    }
                });
            }

            const newPost = new Post({
                body,
                user: user.id,
                username: user.username,
                createdAt: new Date().toISOString(),
            });

            const post = await newPost.save();

            return post;
        },

        deletePost: async(parent, {postId}, context, info) => {
            const user = checkAuth(context);

            try {
                const post = await Post.findById(postId);
                if(post) {
                    if(user.username === post.username) {
                        await post.delete();
                        return "Post deleted successfully";
                    } else {
                        throw new AuthenticationError("Action not allowed");
                    }
                } else {
                    throw new Error("Post not found");
                }
            } catch(err) {
                throw new Error(err);
            }
        },

        likePost: async(parent, {postId}, context, info) => {
            const user = checkAuth(context);

            const post = await Post.findById(postId);
            if(post) {
                if(post.likes.find(like => like.username === user.username)) {
                    post.likes = post.likes.filter(like => like.username !== user.username);
                } else {
                    post.likes.push({
                        username: user.username,
                        createdAt: new Date().toISOString()
                    });
                }                

                await post.save();
                return post;
            } else {
                throw new UserInputError("Post not found");
            }
        }
    },
};