import { gql, useMutation } from "@apollo/client";
import { useState } from "react";
import { Button, Icon, Confirm } from "semantic-ui-react";

import Popup from "./Popup";
import { GET_POSTS_QUERY } from "../util/graphql";

const DeleteButton = ({postId, onDelete, commentId}) => {
    const [confirmOpen, setConfirmOpen] = useState(false);

    const mutation = commentId ? DELETE_COMMENT_MUTATION : DELETE_POST_MUTATION;
    console.log(commentId);
    const [deletePostOrComment] = useMutation(mutation, {
        variables: {
            postId: postId,
            commentId: commentId,
        },
        update: (proxy, res) => {
            if(commentId) {
                
            } else {
                const data = proxy.readQuery({
                    query: GET_POSTS_QUERY,
                });
    
                const newPosts = data.getPosts.filter(post => post.id !== postId);
                proxy.writeQuery({
                    query: GET_POSTS_QUERY, 
                    data: {
                        getPosts: newPosts,
                    },
                });
            }

            setConfirmOpen(false);
            if(onDelete) {
                onDelete();
            }
        },
    });   

    return (
        <>
            <Popup content={commentId ? "Delete comment" : "Delete post"}>
                <Button as="div" color="red" onClick={() => setConfirmOpen(true)} floated="right" >
                    <Icon name="trash" style={{margin: 0}} />
                </Button>
            </Popup>
            <Confirm open={confirmOpen} onConfirm={deletePostOrComment} onCancel={() => setConfirmOpen(false)} />
        </>
    );
}

const DELETE_POST_MUTATION = gql`
    mutation($postId: ID!){
        deletePost(postId: $postId)
    }
`;

const DELETE_COMMENT_MUTATION = gql`
    mutation($postId: ID!, $commentId: ID!) {
        deleteComment(postId: $postId, commentId: $commentId) {
            id
            comments {
                id
                username
                createdAt
                body
            }
            commentCount
        }
    }
`;

export default DeleteButton;