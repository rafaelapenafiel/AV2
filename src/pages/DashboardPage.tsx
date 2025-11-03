import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { DataService } from '../services/MockData';
import { type Aeronave, StatusEtapa, StatusPeca } from '../models/AeroCodeTypes';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
    const [aeronaves, setAeronaves] = useState<Aeronave[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        setAeronaves(DataService.loadAeronaves());
    }, []);

    const getStatusGeral = (aeronave: Aeronave): StatusPeca => {
        if (aeronave.etapas.length === 0) return StatusPeca.EM_TRANSPORTE;
        
        const todasEtapasConcluidas = aeronave.etapas.every(e => e.status === StatusEtapa.CONCLUIDA);
        const algumaEtapaEmAndamento = aeronave.etapas.some(e => e.status === StatusEtapa.ANDAMENTO);

        if (todasEtapasConcluidas) return StatusPeca.PRONTA;
        if (algumaEtapaEmAndamento) return StatusPeca.EM_PRODUCAO;
        return StatusPeca.EM_TRANSPORTE;
    };

    const totalAeronaves = aeronaves.length;
    const emAndamentoCount = aeronaves.filter(a => getStatusGeral(a) === StatusPeca.EM_PRODUCAO).length;
    const pendenteCount = aeronaves.filter(a => getStatusGeral(a) === StatusPeca.EM_TRANSPORTE).length;
    
    const etapasData = {
        naoIniciado: 15,
        emAndamento: 30,
        concluido: 45,
    };
    
    const statusCardStyle: React.CSSProperties = {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        flexGrow: 1,
        minWidth: '200px',
    };
    
    const StatusTag: React.FC<{ status: StatusPeca }> = ({ status }) => {
        const colorMap = {
            [StatusPeca.PRONTA]: '#4CAF50',
            [StatusPeca.EM_PRODUCAO]: '#2746D4', 
            [StatusPeca.EM_TRANSPORTE]: '#FFC107',
        };
        const backgroundColor = colorMap[status];

        return (
            <span style={{ 
                backgroundColor: backgroundColor, 
                color: status === StatusPeca.EM_TRANSPORTE ? 'black' : 'white', 
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontSize: '12px',
                fontWeight: 'bold'
            }}>
                {status === StatusPeca.EM_TRANSPORTE ? "Pendente" : status}
            </span>
        );
    };


    return (
        <Layout>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div style={statusCardStyle}>
                    <h4 style={{ color: '#333' }}>Total de Aeronaves ✈️</h4>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#333' }}>{totalAeronaves}</p>
                </div>
                <div style={statusCardStyle}>
                    <h4 style={{ color: '#333' }}>Em Produção ⚙️</h4>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#333' }}>{emAndamentoCount}</p>
                </div>
                <div style={statusCardStyle}>
                    <h4 style={{ color: '#333' }}>Pendente ⚠️</h4>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#333' }}>{pendenteCount}</p>
                </div>
            </div>
            
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <h3 style={{ color: '#333' }}>Aeronaves em Produção</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #ddd' }}>
                            <th style={{ textAlign: 'left', padding: '10px 0', color: '#555' }}>Código</th>
                            <th style={{ textAlign: 'left', padding: '10px 0', color: '#555' }}>Modelo</th>
                            <th style={{ textAlign: 'left', padding: '10px 0', color: '#555' }}>Status Geral</th>
                            <th style={{ textAlign: 'left', padding: '10px 0', color: '#555' }}>Prazo Estimado</th>
                            <th style={{ textAlign: 'left', padding: '10px 0', color: '#555' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aeronaves.map((aero) => (
                            <tr key={aero.codigo} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px 0', color: '#333' }}>{aero.codigo}</td>
                                <td style={{ padding: '10px 0', color: '#333' }}>{aero.modelo}</td>
                                <td style={{ padding: '10px 0' }}>
                                    <StatusTag status={getStatusGeral(aero)} />
                                </td>
                                <td style={{ padding: '10px 0', color: '#333' }}>
                                    {aero.etapas.length > 0 ? aero.etapas[aero.etapas.length - 1].prazo.toLocaleDateString('pt-BR') : 'N/A'}
                                </td>
                                <td style={{ padding: '10px 0' }}>
                                    <button 
                                        onClick={() => navigate(`/aeronaves/${aero.codigo}`)}
                                        style={{ padding: '8px 15px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', background: '#f0f0f0', color: '#333' }}
                                    >
                                        Detalhes
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
                <h3 style={{ color: '#333' }}>Etapas por Status (Todas Aeronaves)</h3>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', height: '200px', marginTop: '30px' }}>
                    {Object.entries(etapasData).map(([label, height], index) => (
                        <div key={label} style={{ flexGrow: 1, textAlign: 'center' as 'center' }}>
                            <div style={{ 
                                height: `${height * 3}px`, 
                                backgroundColor: index === 0 ? '#B0BEC5' : index === 1 ? '#2746D4' : '#4CAF50',
                                width: '100%',
                            }}>
                            </div>
                            <p style={{ marginTop: '10px', fontSize: '14px', color: '#333' }}>{label.charAt(0).toUpperCase() + label.slice(1)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default DashboardPage;