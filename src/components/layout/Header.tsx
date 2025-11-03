import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
    const { usuario, logout, isAdmin } = useAuth();
    const headerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 30px',
        backgroundColor: '#1C1F28', 
        color: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    };
    const logoStyle: React.CSSProperties = {
        fontSize: '20px',
        fontWeight: 'bold',
        textDecoration: 'none',
        color: 'white',
    };
    const navStyle: React.CSSProperties = {
        display: 'flex',
        gap: '20px',
    };
    const linkStyle: React.CSSProperties = {
        color: 'white',
        textDecoration: 'none',
        padding: '5px 0',
        borderBottom: '2px solid transparent',
        transition: 'border-bottom 0.2s',
    };
    const activeLinkStyle: React.CSSProperties = {
        ...linkStyle,
        borderBottom: '2px solid #2746D4', 
        fontWeight: 'bold' as 'bold',
    };
    const logoutBtnStyle: React.CSSProperties = {
        color: 'white',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        marginLeft: '20px',
    };

    return (
        <header style={headerStyle}>
            <NavLink to="/dashboard" style={logoStyle}>
                ✈️ Aerocode | Sistema de Produção
            </NavLink>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <nav style={navStyle}>
                    <NavLink to="/dashboard" style={({ isActive }: { isActive: boolean }) => isActive ? activeLinkStyle : linkStyle}>
                        Dashboard
                    </NavLink>
                    
                    <NavLink to="/aeronaves" style={({ isActive }: { isActive: boolean }) => isActive ? activeLinkStyle : linkStyle}>
                        Aeronaves
                    </NavLink>
                    
                    {isAdmin && (
                        <NavLink to="/aeronaves/cadastro" style={({ isActive }: { isActive: boolean }) => isActive ? activeLinkStyle : linkStyle}>
                            Cadastrar Aeronave
                        </NavLink>
                    )}
                    
                    {isAdmin && (
                        <NavLink to="/funcionarios" style={({ isActive }: { isActive: boolean }) => isActive ? activeLinkStyle : linkStyle}>
                            Funcionários
                        </NavLink>
                    )}
                    
                    <NavLink to="/relatorios" style={({ isActive }: { isActive: boolean }) => isActive ? activeLinkStyle : linkStyle}>
                        Relatórios
                    </NavLink>
                </nav>
                
                <span style={{ marginLeft: '20px', fontSize: '14px' }}>
                    Olá, **{usuario?.nome}**
                </span>

                <button onClick={logout} style={logoutBtnStyle}>
                    Sair
                </button>
            </div>
        </header>
    );
};

export default Header;