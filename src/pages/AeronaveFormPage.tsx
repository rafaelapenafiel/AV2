import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../services/MockData';
import { type Aeronave, TipoAeronave, type Etapa, StatusEtapa } from '../models/AeroCodeTypes';

const initialAeronaveState: Aeronave = {
    codigo: '',
    modelo: '',
    tipo: TipoAeronave.COMERCIAL,
    capacidade: 0,
    alcance: 0,
    etapas: [
        { id: '', nome: 'Montagem Inicial da Estrutura', prazo: new Date(), status: StatusEtapa.PENDENTE, funcionariosDesignados: [] }
    ],
    pecas: [],
    testes: [],
    relatorio: null,
};

const AeronaveFormPage: React.FC = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [aeronaveData, setAeronaveData] = useState<Aeronave>(initialAeronaveState);
    const [erro, setErro] = useState('');
    const [mensagemSucesso, setMensagemSucesso] = useState('');

    if (!isAdmin) {
        return <Layout><h1>Acesso Negado</h1><p>Apenas administradores podem cadastrar aeronaves.</p></Layout>;
    }

    const handleAeronaveChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAeronaveData(prev => ({ 
            ...prev, 
            [name]: name === 'capacidade' || name === 'alcance' ? parseInt(value) || 0 : value 
        }));
        setErro('');
        setMensagemSucesso('');
    };

    const handleEtapaChange = (index: number, name: keyof Etapa, value: string | Date) => {
        const newEtapas = [...aeronaveData.etapas];
        const finalValue = name === 'prazo' ? new Date(value as string) : value;

        (newEtapas[index] as any)[name] = finalValue;
        setAeronaveData(prev => ({ ...prev, etapas: newEtapas }));
    };

    const handleAddEtapa = () => {
        const newEtapa: Etapa = {
            id: '', 
            nome: '',
            prazo: new Date(),
            status: StatusEtapa.PENDENTE,
            funcionariosDesignados: []
        };
        setAeronaveData(prev => ({ ...prev, etapas: [...prev.etapas, newEtapa] }));
    };

    const handleRemoveEtapa = (index: number) => {
        if (aeronaveData.etapas.length <= 1) return; 
        const newEtapas = aeronaveData.etapas.filter((_, i) => i !== index);
        setAeronaveData(prev => ({ ...prev, etapas: newEtapas }));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');
        setMensagemSucesso('');

        if (!aeronaveData.codigo || !aeronaveData.modelo || aeronaveData.capacidade <= 0) {
            setErro('Preencha Código, Modelo e Capacidade corretamente.');
            return;
        }

        
        if (DataService.getAeronaveByCodigo(aeronaveData.codigo)) {
            setErro('O código da aeronave já existe. Escolha outro código.');
            return;
        }

        try {
            DataService.saveAeronave(aeronaveData);
            setMensagemSucesso(`Aeronave ${aeronaveData.codigo} cadastrada com sucesso!`);
            setAeronaveData(initialAeronaveState); 
            navigate('/dashboard'); 
        } catch (error) {
            setErro('Erro ao salvar no sistema. Consulte o console.');
            console.error(error);
        }
    };

    return (
        <Layout>
            <h1 style={{ marginBottom: '20px' }}>✈️ Cadastro de Nova Aeronave</h1>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '800px', margin: '0 auto' }}>
                
                <h2>Informações Básicas da Aeronave</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label>Código Único:</label>
                        <input type="text" name="codigo" value={aeronaveData.codigo} onChange={handleAeronaveChange} required style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                        <label>Modelo:</label>
                        <input type="text" name="modelo" value={aeronaveData.modelo} onChange={handleAeronaveChange} required style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                        <label>Tipo:</label>
                        <select name="tipo" value={aeronaveData.tipo} onChange={handleAeronaveChange} style={{ width: '100%', padding: '8px' }}>
                            <option value={TipoAeronave.COMERCIAL}>{TipoAeronave.COMERCIAL}</option>
                            <option value={TipoAeronave.MILITAR}>{TipoAeronave.MILITAR}</option>
                        </select>
                    </div>
                    <div>
                        <label>Capacidade (Passageiros/Carga):</label>
                        <input type="number" name="capacidade" value={aeronaveData.capacidade} onChange={handleAeronaveChange} required style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                        <label>Alcance (km):</label>
                        <input type="number" name="alcance" value={aeronaveData.alcance} onChange={handleAeronaveChange} required style={{ width: '100%', padding: '8px' }} />
                    </div>
                </div>
                
                <hr />

                <h2>Etapas Iniciais de Produção</h2>
                <p style={{ fontSize: '12px', color: '#666' }}>Defina a sequência inicial das etapas. Elas serão controladas em ordem lógica.</p>

                {aeronaveData.etapas.map((etapa, index) => (
                    <div key={index} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '4px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                        
                        <span style={{ fontWeight: 'bold' }}>{index + 1}.</span>
                        
                        <div style={{ flex: 2 }}>
                            <label>Nome da Etapa:</label>
                            <input 
                                type="text" 
                                value={etapa.nome} 
                                onChange={(e) => handleEtapaChange(index, 'nome', e.target.value)} 
                                required 
                                style={{ width: '100%', padding: '8px' }} 
                            />
                        </div>

                        <div style={{ flex: 1 }}>
                            <label>Prazo (Estimado):</label>
                            <input 
                                type="date" 
                                value={etapa.prazo.toISOString().split('T')[0]} 
                                onChange={(e) => handleEtapaChange(index, 'prazo', e.target.value)} 
                                required 
                                style={{ width: '100%', padding: '8px' }} 
                            />
                        </div>
                        
                        {aeronaveData.etapas.length > 1 && (
                            <button type="button" onClick={() => handleRemoveEtapa(index)} style={{ padding: '8px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Remover
                            </button>
                        )}
                    </div>
                ))}
                
                <button type="button" onClick={handleAddEtapa} style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', alignSelf: 'flex-start' }}>
                    + Adicionar Etapa
                </button>

                {erro && <p style={{ color: 'red', fontWeight: 'bold' }}>{erro}</p>}
                {mensagemSucesso && <p style={{ color: 'green', fontWeight: 'bold' }}>{mensagemSucesso}</p>}

                <button type="submit" style={{ padding: '15px 30px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '18px', marginTop: '30px' }}>
                    Cadastrar Aeronave
                </button>
            </form>
        </Layout>
    );
};

export default AeronaveFormPage;