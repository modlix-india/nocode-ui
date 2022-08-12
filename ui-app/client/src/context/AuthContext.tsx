import axios from "axios";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { VerifyLoginResponse } from "../constants";

interface AuthData {
    isAuthenticated: boolean;
    verifyLogin: () => void;
}

const authContextDefaultData: AuthData = {
    isAuthenticated: false,
    verifyLogin: () => null
}

export const AuthContext = createContext<AuthData | undefined>(undefined);

export const useAuthContextData = () => {
    const [isAuthenticated, setisAuthenticated] = useState(false);

    const verifyLogin = useCallback(() => {
        (async () => {
            try {
                const resp = await axios.get<VerifyLoginResponse>('/verifyLogin');
                setisAuthenticated(resp.data.isAuthenticated)
            } catch (error) {
                console.log('No Auth')
            }
        })()
    }, [setisAuthenticated])

    return useMemo(() => ({
        isAuthenticated,
        verifyLogin,
    }), [
        isAuthenticated,
        verifyLogin,
    ])
}

export const useAuthContext = () => {
    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error('usePostsContext must be used within the PostsContext.Provider');
    }

    return authContext;
}
