import { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { Form, Button } from "semantic-ui-react";

import { useForm } from "../util/hooks";
import { GET_POSTS_QUERY } from "../util/graphql";

const PostForm = () => {
    const [errors, setErrors] = useState({});

    const {onSubmit, onChange, values} = useForm(createPostCallback, {
        body: ""
    });

    const [createPost, {loading}] = useMutation(CREATE_POST_MUTATION, {
        variables: values,
        update: (proxy, res) => {
            const data = proxy.readQuery({
                query: GET_POSTS_QUERY
            });
            const newPosts = [res.data.createPost, ...data.getPosts];
            proxy.writeQuery({
                query: GET_POSTS_QUERY,
                data: {
                    getPosts: newPosts
                },
            });

            values.body = "";
        },
        onError: err => {
            setErrors(err.graphQLErrors[0].extensions.exception.errors);
        },
    });

    function createPostCallback() {
        createPost();
    }

    return (
        <>
            <Form onSubmit={onSubmit} loading={loading}>
                <h2>Create a post</h2>
                <Form.Field>
                    <Form.Input 
                        placeholder="Hi World!"
                        name="body"
                        onChange={onChange}
                        value={values.body}
                        error={errors.body ? true : false}
                    />
                    <Button type="submit" color="teal">
                        Submit
                    </Button>
                </Form.Field>
            </Form>
            {Object.keys(errors).length > 0 && (
                <div className="ui error message" style={{marginBottom: 20}}>
                    <ul className="list">
                        {Object.values(errors).map(value => (
                            <li key={value}>{value}</li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
};

const CREATE_POST_MUTATION = gql`
    mutation createPost ($body: String!) {
        createPost(body: $body) {
            id
            body
            createdAt
            username
            likes {
                id
                username
                createdAt
            }
            likeCount
            comments {
                id
                body
                username
                createdAt
            }
            commentCount
        }
    }
`;

export default PostForm;