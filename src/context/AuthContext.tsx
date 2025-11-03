import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { type Funcionario, NivelPermissao } from '../models/AeroCodeTypes';
import { AuthService } from '../services/MockData';

interface AuthContextType {
    usuario: Funcionario | null;
    login: (user: string, pass: string) => boolean;
    logout: () => void;
    isAdmin: boolean;
    isEngineer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const storedUser = localStorage.getItem('aerocodeUser');
    const initialUser: Funcionario | null = storedUser ? JSON.parse(storedUser) : null;
    
    const [usuario, setUsuario] = useState<Funcionario | null>(initialUser);

    const login = (user: string, pass: string): boolean => {
        const loggedUser = AuthService.login(user, pass);
        if (loggedUser) {
            setUsuario(loggedUser);
            localStorage.setItem('aerocodeUser', JSON.stringify(loggedUser));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUsuario(null);
        localStorage.removeItem('aerocodeUser');
    };

    const isAdmin = usuario?.nivelPermissao === NivelPermissao.ADMINISTRADOR;
    const isEngineer = usuario?.nivelPermissao === NivelPermissao.ENGENHEIRO || isAdmin;

    const value: AuthContextType = {
        usuario,
        login,
        logout,
        isAdmin,
        isEngineer,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};