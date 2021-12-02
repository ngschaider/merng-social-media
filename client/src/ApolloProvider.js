import { setContext } from "@apollo/client/link/context";
import { ApolloProvider, ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";

import App from "./App"

const httpLink = createHttpLink({
    uri: "http://localhost:5000",
});

const authLink = setContext(() => {
    const token = localStorage.getItem("jwtToken");

    return {
        headers: {
            authorization: token ? "Bearer " + token : "",
        }
    };
});

const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});

export default (
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>
);