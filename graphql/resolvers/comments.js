const {UserInputError, AuthenticationError} = require("apollo-server");

const Post = require("../../models/Post");
const checkAuth = require("../../util/checkAuth");

module.exports = {
    Query: {

    },

    Mutation: {
        createComment: async (parent, {postId, body}, context, info) => {
            const user = checkAuth(context);

            if(body.trim() === "") {
                throw new UserInputError("Empty comment", {
                    errors: {
                        body: "Comment body must not be empty",
                    }
                });
            }

            const post = await Post.findById(postId);

            if(post) {
                post.comments.unshift({
                    body,
                    username: user.username,
                    createdAt: new Date().toISOString(),
                });

                await post.save();
                return post;
            } else {
                throw new UserInputError("Post not found");
            }
        },

        deleteComment: async (parent, {postId, commentId}, context, info) => {
            const user = checkAuth(context);

            const post = await Post.findById(postId);

            if(post) {
                const commentIndex = post.comments.findIndex(c => c.id === commentId);

                if(commentIndex !== -1) {
                    if(post.comments[commentIndex].username === user.username) {
                        post.comments.splice(commentIndex, 1);
                        await post.save();
                        return post;
                    } else {
                        throw new AuthenticationError("Action not allowed");
                    }
                } else {
                    throw new UserInputError("Comment not found");
                }
            } else {
                throw new UserInputError("Post not found");
            }
        }
    }
}