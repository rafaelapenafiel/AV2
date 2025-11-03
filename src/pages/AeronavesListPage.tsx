import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { DataService } from '../services/MockData';
import { type Aeronave } from '../models/AeroCodeTypes';

const AeronavesListPage: React.FC = () => {
    const [aeronaves, setAeronaves] = useState<Aeronave[]>([]);

    useEffect(() => {
        setAeronaves(DataService.loadAeronaves());
    }, []);

    return (
        <Layout>
            <div style={{ padding: '20px', backgroundColor: '#f4f7f9' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>
                    Lista de Aeronaves ({aeronaves.length})
                </h1>
                
                <div style={{ padding: '30px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #ddd' }}>
                                <th style={{ padding: '10px 0', color: '#555' }}>Código</th>
                                <th style={{ padding: '10px 0', color: '#555' }}>Modelo</th>
                                <th style={{ padding: '10px 0', color: '#555' }}>Tipo</th>
                                <th style={{ padding: '10px 0', color: '#555' }}>Capacidade</th>
                                <th style={{ padding: '10px 0', color: '#555' }}>Alcance (km)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {aeronaves.map(aero => (
                                <tr key={aero.codigo} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px 0', color: '#333' }}>{aero.codigo}</td>
                                    <td style={{ padding: '10px 0', color: '#333' }}>{aero.modelo}</td>
                                    <td style={{ padding: '10px 0', color: '#333' }}>{aero.tipo}</td>
                                    <td style={{ padding: '10px 0', color: '#333' }}>{aero.capacidade}</td>
                                    <td style={{ padding: '10px 0', color: '#333' }}>{aero.alcance}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {aeronaves.length === 0 && (
                        <p style={{ marginTop: '20px', color: '#888' }}>Nenhuma aeronave cadastrada para exibição.</p>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default AeronavesListPage;