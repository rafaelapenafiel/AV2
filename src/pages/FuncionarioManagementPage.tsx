import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import { DataService } from '../services/MockData';
import { type Funcionario, NivelPermissao } from '../models/AeroCodeTypes';
import { useAuth } from '../context/AuthContext'; 

const cardStyle: React.CSSProperties = { 
    backgroundColor: 'white', 
    padding: '20px', 
    borderRadius: '8px', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    marginBottom: '20px'
};

const inputStyle: React.CSSProperties = { 
    width: '100%', 
    padding: '8px', 
    border: '1px solid #ccc', 
    borderRadius: '4px',
    boxSizing: 'border-box',
    color: '#000', 
    backgroundColor: '#fff' 
};

const buttonPrimaryStyle: React.CSSProperties = { 
    backgroundColor: '#2746D4', 
    color: 'white', 
    padding: '10px 15px', 
    borderRadius: '4px', 
    border: 'none', 
    cursor: 'pointer',
    transition: 'background-color 0.15s'
};

const buttonDangerStyle: React.CSSProperties = { 
    backgroundColor: '#e74c3c', 
    color: 'white', 
    padding: '5px 10px', 
    borderRadius: '4px', 
    border: 'none', 
    cursor: 'pointer',
    transition: 'background-color 0.15s'
};


const initialNovoFuncionarioState: Omit<Funcionario, 'id'> = {
    nome: '',
    telefone: '',
    endereco: '',
    usuario: '',
    senha: '', 
    nivelPermissao: NivelPermissao.ENGENHEIRO,
};

const FuncionarioManagementPage: React.FC = () => {
    const { usuario } = useAuth();
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [novoFuncionario, setNovoFuncionario] = useState<Omit<Funcionario, 'id'>>(initialNovoFuncionarioState);
    const [erro, setErro] = useState('');

    const loadFuncionarios = useCallback(() => {
        const data = DataService.loadFuncionarios();
        setFuncionarios(data);
        setErro('');
    }, []);

    useEffect(() => {
        loadFuncionarios();
    }, [loadFuncionarios]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNovoFuncionario(prev => ({
            ...prev,
            [name]: value,
        } as Omit<Funcionario, 'id'>));
        setErro('');
    };

    const handleAddFuncionario = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (usuario?.nivelPermissao !== NivelPermissao.ADMINISTRADOR) {
            alert('Apenas Administradores podem adicionar novos funcionários.');
            return;
        }

        if (!novoFuncionario.nome || !novoFuncionario.usuario || !novoFuncionario.senha) {
            setErro('Os campos Nome, Usuário e Senha são obrigatórios.');
            return;
        }

        const success = DataService.addFuncionario(novoFuncionario);
        
        if (success) {
            alert(`Funcionário ${novoFuncionario.nome} adicionado com sucesso!`);
            loadFuncionarios(); 
            setNovoFuncionario(initialNovoFuncionarioState); 
            setErro('');
        } else {
            setErro('Falha ao adicionar: Usuário de login já existe.');
        }
    };

    const handleRemoveFuncionario = (id: string, nome: string) => {
        if (usuario?.nivelPermissao !== NivelPermissao.ADMINISTRADOR) {
            alert('Apenas Administradores podem remover funcionários.');
            return;
        }
        if (id === 'F001') {
            alert('Ação Bloqueada: O Administrador principal não pode ser removido.');
            return;
        }

        if (window.confirm(`Tem certeza que deseja remover o funcionário ${nome}?`)) {
            const success = DataService.deleteFuncionario(id);
            if (success) {
                alert('Funcionário removido com sucesso!');
                loadFuncionarios(); 
            } else {
                setErro('Falha ao remover funcionário.');
            }
        }
    };

    return (
        <Layout>
            <div style={{ padding: '20px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>Gestão de Funcionários (Admin)</h1>
                
                <div style={{ display: 'flex', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>

                    <div style={{ ...cardStyle, flex: 1, minWidth: '350px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'semibold', marginBottom: '15px', color: '#333' }}>Cadastrar Novo</h2>
                        
                        <form onSubmit={handleAddFuncionario} style={{ display: 'grid', gap: '15px' }}>
                            {erro && <p style={{ color: '#e74c3c', fontWeight: 'bold' }}>{erro}</p>}

                            <input type="text" name="nome" value={novoFuncionario.nome} onChange={handleInputChange} style={inputStyle} placeholder="Nome Completo" required />
                            <input type="text" name="usuario" value={novoFuncionario.usuario} onChange={handleInputChange} style={inputStyle} placeholder="Usuário de Login" required />
                            
                            <input type="password" name="senha" value={novoFuncionario.senha} onChange={handleInputChange} style={inputStyle} placeholder="Senha Inicial" required />
                            <select name="nivelPermissao" value={novoFuncionario.nivelPermissao} onChange={handleInputChange} style={inputStyle} required>
                                <option value={NivelPermissao.ENGENHEIRO}>Engenheiro</option>
                                <option value={NivelPermissao.OPERADOR}>Operador</option>
                            </select>
                            
                            <input type="text" name="telefone" value={novoFuncionario.telefone} onChange={handleInputChange} style={inputStyle} placeholder="Telefone (Opcional)" />
                            <input type="text" name="endereco" value={novoFuncionario.endereco} onChange={handleInputChange} style={inputStyle} placeholder="Endereço (Opcional)" />
                            
                            <button 
                                type="submit" 
                                style={{ ...buttonPrimaryStyle, marginTop: '10px' }}
                                disabled={usuario?.nivelPermissao !== NivelPermissao.ADMINISTRADOR}
                            >
                                Salvar Funcionário
                            </button>
                        </form>
                    </div>

                    <div style={{ ...cardStyle, flex: 2 }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'semibold', marginBottom: '15px', color: '#333' }}>Lista de Funcionários ({funcionarios.length})</h2>
                        
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ backgroundColor: '#f9f9f9' }}>
                                    <tr>
                                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd', color: '#555' }}>ID</th>
                                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd', color: '#555' }}>Nome</th>
                                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd', color: '#555' }}>Usuário</th>
                                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd', color: '#555' }}>Permissão</th>
                                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd', color: '#555' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {funcionarios.map((f) => (
                                        <tr key={f.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '10px', color: '#333' }}>{f.id}</td>
                                            <td style={{ padding: '10px', color: '#333' }}>{f.nome}</td>
                                            <td style={{ padding: '10px', color: '#333' }}>{f.usuario}</td>
                                            <td style={{ padding: '10px', color: '#333' }}>{f.nivelPermissao}</td>
                                            <td style={{ padding: '10px' }}>
                                                {f.id !== 'F001' && (
                                                    <button
                                                        onClick={() => handleRemoveFuncionario(f.id, f.nome)}
                                                        style={buttonDangerStyle}
                                                        disabled={usuario?.nivelPermissao !== NivelPermissao.ADMINISTRADOR}
                                                    >
                                                        Remover
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default FuncionarioManagementPage;