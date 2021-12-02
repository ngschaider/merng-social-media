import { useContext, useState, useRef } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Loader, Grid, Image, Form, Icon, Label, Card, Button } from "semantic-ui-react";
import moment from "moment";
import { Redirect } from "react-router-dom";

import { AuthContext } from "../context/auth";
import LikeButton from "../components/LikeButton";
import DeleteButton from "../components/DeleteButton";
import Popup from "../components/Popup";

const SinglePost = (props) => {
    const postId = props.match.params.postId;

    const {user} = useContext(AuthContext);
    const commentInputRef = useRef(null);

    const [commentText, setCommentText] = useState("");

    const {loading, data} = useQuery(GET_POST_QUERY, {
        variables: {
            postId: postId,
        }
    });

    const [createComment, {commentLoading}] = useMutation(CREATE_COMMENT_MUTATION, {
        variables: {
            postId,
            body: commentText,
        },
        update: (proxy, res) => {
            setCommentText("");
            commentInputRef.current.blur();
        },
    });

    if(loading) return <Loader active={true} />;
    if(!data) return <Redirect to="/" />;

    const {id, body, createdAt, username, comments, likes, likeCount, commentCount} = data.getPost;

    const commentOnPost = () => {

    }

    const onDelete = () => {
        props.history.push("/");
    };

    return (
        <Grid>
            <Grid.Row>
                <Grid.Column width={2}>
                    <Image src="https://react.semantic-ui.com/images/avatar/large/molly.png" size="small" floated="right" />
                </Grid.Column>
                <Grid.Column width={10}>
                    <Card fluid>
                        <Card.Content>
                            <Card.Header>{username}</Card.Header>
                            <Card.Meta>{moment(createdAt).fromNow()}</Card.Meta>
                            <Card.Description>{body}</Card.Description>
                        </Card.Content>
                        <Card.Content>
                            <LikeButton post={{id, likeCount, likes}} />
                            <Popup content="Comment on post">
                                <Button as="div" labelPosition="right" onClick={commentOnPost}>
                                    <Button basic color="blue">
                                        <Icon name="comments" />
                                    </Button>
                                    <Label basic color="blue">{commentCount}</Label>
                                </Button>
                            </Popup>
                            {user && user.username === username && <DeleteButton postId={id} onDelete={onDelete} />}
                        </Card.Content>
                    </Card>
                    {user && (
                        <Card fluid>
                            <Card.Content>
                                <p>Post a comment</p>
                                <Form loading={commentLoading}>
                                    <div className="ui action input fluid">
                                        <input type="text" value={commentText} placeholder="Comment.." name="comment" onChange={e => setCommentText(e.target.value)} ref={commentInputRef} />
                                        <button type="submit" className="ui button teal" disabled={commentText.trim() === ""} onClick={createComment}>
                                            Submit
                                        </button>
                                    </div>
                                </Form>
                            </Card.Content>
                        </Card>
                    )}
                    {comments.map(comment => (
                        <Card fluid key={comment.id}>
                            <Card.Content>
                                {user && user.username === comment.username && (
                                    <DeleteButton postId={id} commentId={comment.id} />
                                )}
                                <Card.Header>{comment.username}</Card.Header>
                                <Card.Meta>{moment(comment.createdAt).fromNow()}</Card.Meta>
                                <Card.Description>{comment.body}</Card.Description>
                            </Card.Content>
                        </Card>
                    ))}
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}

const CREATE_COMMENT_MUTATION = gql`
    mutation($postId: ID!, $body: String!){
        createComment(postId: $postId, body: $body) {
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

const GET_POST_QUERY = gql`
    query($postId: ID!) {
        getPost(postId: $postId) {
            id
            body
            createdAt
            username
            likeCount
            likes {
                username
            }
            commentCount
            comments {
                id
                username
                createdAt
                body
            }
        }
    }
`;

export default SinglePost;