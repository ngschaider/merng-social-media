import { useReducer, createContext } from "react";
import jwtDecode from "jwt-decode";

const initialState = {
    user: null
};

const token = localStorage.getItem("jwtToken");
if(token) {
    const decodedToken = jwtDecode(token);

    if(decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem("jwtToken");
    } else {
        initialState.user = decodedToken;
    }
}

const AuthContext = createContext({
    user: null,
    login: user => {},
    logout: () => {},
});

const authReducer = (state, action) => {
    switch(action.type) {
        case "LOGIN":
            return {
                ...state,
                user: action.payload,
            };
        case "LOGOUT":
            return {
                ...state,
                user: null,
            };
        default:
            return state;
    }
};

const AuthProvider = props => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    const login = user => {
        localStorage.setItem("jwtToken", user.token);
        dispatch({
            type: "LOGIN",
            payload: user,
        });
    }

    const logout = () => {
        localStorage.removeItem("jwtToken");
        dispatch({
            type: "LOGOUT"
        });
    };

    return (
        <AuthContext.Provider value={{
                user: state.user,
                login,
                logout
            }}
            {...props}
        />
    )
}

export { 
    AuthContext, 
    AuthProvider,
};