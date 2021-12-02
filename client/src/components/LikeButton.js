import { useState, useContext, useEffect } from "react";
import { useMutation, gql } from "@apollo/client";
import { Button, Icon, Label } from "semantic-ui-react";

import { AuthContext } from "../context/auth";
import Popup from "./Popup";

const LikeButton = ({post: {id, likeCount, likes}}) => {
    const { user } = useContext(AuthContext);

    const [liked, setLiked] = useState(false);

    const [likePost] = useMutation(LIKE_POST_MUTATION, {
        variables: {postId: id},
    });

    useEffect(() => {
        if(user && likes.find(like => like.username === user.username)) {
            setLiked(true);
        } else {
            setLiked(false);
        }
    }, [user, likes]);

    return (
        <Popup content={liked ? "Unlike" : "Like"}>
            <Button as="div" labelPosition="right" onClick={likePost} className="like-button">
                {user ? (
                    liked ? (
                        <Button color="teal">
                            <Icon name="heart" />
                        </Button>
                    ) : (
                        <Button color="teal" basic>
                            <Icon name="heart" />
                        </Button>
                    )
                ) : (
                    <Button color="teal" basic>
                        <Icon name="heart" />
                    </Button>
                )}
                <Label basic color="teal" pointing="left">
                    {likeCount}
                </Label>
            </Button>
        </Popup>
    )
}

const LIKE_POST_MUTATION = gql`
    mutation likePost ($postId: ID!) {
        likePost(postId: $postId) {
            id
            likes {
                id
                username
            }
            likeCount
        }
    }
`;

export default LikeButton;