import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { DataService } from '../services/MockData';
import { type Relatorio } from '../models/AeroCodeTypes';

const RelatoriosPage: React.FC = () => {
    const [relatoriosGerados, setRelatoriosGerados] = useState<Relatorio[]>([]);

    useEffect(() => {
        const aeronavesComRelatorio = DataService.loadAeronaves().filter(a => a.relatorio);
        const relatorios = aeronavesComRelatorio.map(a => a.relatorio!); 
        setRelatoriosGerados(relatorios);
    }, []);

    const handleDownload = (content: string, filename: string) => {

        const blob = new Blob([content], { type: 'text/plain' });
        

        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename; 
        
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Layout>
            <div style={{ padding: '20px', backgroundColor: '#f4f7f9' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>
                    📄 Relatórios de Entrega Final ({relatoriosGerados.length})
                </h1>

                <div style={{ padding: '30px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    {relatoriosGerados.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #ddd' }}>
                                    <th style={{ padding: '10px 0', color: '#555' }}>Cód. Aeronave</th>
                                    <th style={{ padding: '10px 0', color: '#555' }}>Cliente</th>
                                    <th style={{ padding: '10px 0', color: '#555' }}>Data da Entrega</th>
                                    <th style={{ padding: '10px 0', color: '#555' }}>Ação</th> 
                                </tr>
                            </thead>
                            <tbody>
                                {relatoriosGerados.map((r, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px 0', color: '#333' }}>{r.aeronaveCodigo}</td>
                                        <td style={{ padding: '10px 0', color: '#333' }}>{r.clienteNome}</td>
                                        <td style={{ padding: '10px 0', color: '#333' }}>{r.dataEntrega.toLocaleDateString('pt-BR')}</td>
                                        <td style={{ padding: '10px 0', color: '#333' }}>
                                            <button 
                                                onClick={() => handleDownload(r.conteudoTexto, `RELATORIO_${r.aeronaveCodigo}.txt`)}
                                                style={{ 
                                                    backgroundColor: '#007bff', 
                                                    color: 'white', 
                                                    padding: '5px 10px', 
                                                    border: 'none', 
                                                    borderRadius: '4px', 
                                                    cursor: 'pointer' 
                                                }}
                                            >
                                                Baixar (.txt)
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ color: '#888' }}>Nenhum relatório final foi gerado ainda. Conclua a produção de uma aeronave para ver os dados aqui.</p>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default RelatoriosPage;