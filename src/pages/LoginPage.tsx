import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');

        if (login(usuario, senha)) {
            navigate('/dashboard'); 
        } else {
            setErro('Credenciais inválidas. Tente novamente.');
        }
    };

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column' as 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#2746D4', 
            fontFamily: 'Arial, sans-serif',
        },
        card: {
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '400px',
            textAlign: 'center' as 'center',
        },
        iconContainer: {
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px',
        },
        icon: {
            backgroundColor: '#2746D4',
            color: 'white',
            borderRadius: '50%',
            padding: '10px 15px',
            fontSize: '24px',
            lineHeight: '1',
        },
        title: {
            fontSize: '24px',
            marginBottom: '30px',
            color: '#333',
        },
        form: {
            display: 'flex',
            flexDirection: 'column' as 'column',
            gap: '10px',
        },
        label: {
            textAlign: 'left' as 'left',
            fontWeight: 'bold' as 'bold',
            marginTop: '10px',
            marginBottom: '5px',
            fontSize: '14px',
            color: '#555',
        },
        input: {
            padding: '12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            backgroundColor: '#f9f9f9',
            fontSize: '16px',
            color: '#000',
        },
        button: {
            backgroundColor: '#1C1F28',
            color: 'white',
            padding: '12px',
            borderRadius: '4px',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            marginTop: '20px',
        },
        errorText: {
            color: 'red',
            marginTop: '10px',
        },
        tip: {
            marginTop: '20px',
            color: 'white',
            fontSize: '14px',
            textAlign: 'center' as 'center',
            maxWidth: '400px',
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.iconContainer}>
                    <span style={styles.icon}>✈️</span> 
                </div>
                <h1 style={styles.title}>SISTEMA AEROCODE</h1>
                
                <form onSubmit={handleSubmit} style={styles.form}>
                    <label style={styles.label}>Usuário</label>
                    <input
                        type="text"
                        placeholder="Digite seu usuário"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        style={styles.input}
                        required
                    />

                    <label style={styles.label}>Senha</label>
                    <input
                        type="password"
                        placeholder="Digite sua senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        style={styles.input}
                        required
                    />

                    {erro && <p style={styles.errorText}>{erro}</p>}

                    <button type="submit" style={styles.button}>
                        Entrar
                    </button>
                </form>
            </div>
            <p style={styles.tip}>
                Dicas de Login (Teste): Administrador: **admin/123** | Engenheiro: **engenheiro/123** | Operador: **operador/123**
            </p>
        </div>
    );
};

export default LoginPage;