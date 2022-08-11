import axios from "axios";
import { createContext, useCallback, useState } from "react";
import { VerifyLoginResponse } from "../constants";

interface AuthData {
    isAuthenticated: boolean;
    verifyLogin: () => void;
}

const authContextDefaultData: AuthData = {
    isAuthenticated: false,
    verifyLogin: () => null
}

export const AuthContext = createContext<AuthData>(authContextDefaultData);

export const useAuthContext = () => {
    const [isAuthenticated, setisAuthenticated] = useState(false);

    const verifyLogin = useCallback(() => {
        (async() => {
            try {
                const resp = await axios.get<VerifyLoginResponse>('/verifyLogin');    
                setisAuthenticated(resp.data.isAuthenticated)
            } catch (error) {
                console.log('No Auth')
            }
        })()
    }, [setisAuthenticated])

    return {
        isAuthenticated,
        verifyLogin,
    }
}
