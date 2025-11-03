import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { DataService } from '../services/MockData';
import { 
    type Aeronave, StatusEtapa, type Etapa, type Peca, StatusPeca, TipoPeca, 
    type Teste, TipoTeste, ResultadoTeste, type Funcionario 
} from '../models/AeroCodeTypes';
import { useAuth } from '../context/AuthContext';

const todosFuncionarios: Funcionario[] = DataService.loadFuncionarios();

interface RelatorioGenerationProps {
    aeronave: Aeronave;
    onRelatorioGenerated: () => void;
}

const RelatorioGeneration: React.FC<RelatorioGenerationProps> = ({ aeronave, onRelatorioGenerated }) => {
    const { isAdmin } = useAuth();
    const [clienteNome, setClienteNome] = useState('');
    const [dataEntrega, setDataEntrega] = useState(new Date().toISOString().split('T')[0]);
    
    const isReadyForReport = aeronave.etapas.every(e => e.status === StatusEtapa.CONCLUIDA);
    const reportExists = aeronave.relatorio !== null;


    const downloadRelatorio = (conteudo: string | undefined) => {
        const finalContent = conteudo ?? 'Relatório vazio.';
        const element = document.createElement("a");
        const file = new Blob([finalContent], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        
        element.download = `Relatorio_Aeronave_${aeronave.codigo!}.txt`; 
        
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }


    const handleGenerateReport = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isAdmin) {
            alert('Apenas o Administrador pode gerar o Relatório Final.');
            return;
        }

        if (!isReadyForReport) {
            alert('Não é possível gerar o relatório. Todas as etapas de produção devem estar CONCLUÍDAS.');
            return;
        }
        if (!clienteNome) {
             alert('O nome do cliente é obrigatório.');
            return;
        }

        const dataEntregaObj = new Date(dataEntrega);
        
        const relatorioConteudo = DataService.generateAndSaveRelatorio(aeronave.codigo!, clienteNome, dataEntregaObj); 

        if (typeof relatorioConteudo === 'string') {
            downloadRelatorio(relatorioConteudo);
            alert('Relatório Final gerado e salvo com sucesso!');
            onRelatorioGenerated(); 
        } else {
            alert('Falha ao gerar o relatório. Verifique o status das etapas.');
        }
    };
    
    if (reportExists) {
        return (
            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #4CAF50', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#4CAF50' }}>Produção Concluída</h3>
                <p>Relatório Final gerado em: {aeronave.relatorio?.dataEntrega.toLocaleDateString('pt-BR')}</p>
                <button 
                    onClick={() => downloadRelatorio(aeronave.relatorio?.conteudoTexto ?? 'Relatório vazio.')} 
                    style={{ padding: '8px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Baixar Relatório (TXT)
                </button>
            </div>
        );
    }

    return (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #2746D4', borderRadius: '4px' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Geração de Relatório Final</h3>
            
            {!isReadyForReport && (
                 <p style={{ color: 'red', fontWeight: 'bold' }}>Necessário concluir TODAS as etapas para liberar o relatório.</p>
            )}

            <form onSubmit={handleGenerateReport} style={{ display: 'grid', gap: '10px' }}>
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold' }}>Nome do Cliente:</label>
                    <input 
                        type="text" 
                        value={clienteNome} 
                        onChange={(e) => setClienteNome(e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                        disabled={!isAdmin || !isReadyForReport}
                        required
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold' }}>Data de Entrega:</label>
                    <input 
                        type="date" 
                        value={dataEntrega} 
                        onChange={(e) => setDataEntrega(e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                        disabled={!isAdmin || !isReadyForReport}
                        required
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={!isAdmin || !isReadyForReport}
                    style={{ padding: '10px 20px', backgroundColor: '#2746D4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}
                >
                    Gerar e Finalizar Entrega
                </button>
            </form>
        </div>
    );
};

interface PecaManagementProps {
    aeronaveCodigo: string;
    pecas: Peca[];
    onPecaUpdate: () => void;
}

const PecaManagement: React.FC<PecaManagementProps> = ({ aeronaveCodigo, pecas, onPecaUpdate }) => {
    const { isAdmin, isEngineer } = useAuth();
    const [novaPeca, setNovaPeca] = useState<Omit<Peca, 'id' | 'status'>>({
        nome: '',
        tipo: TipoPeca.NACIONAL,
        fornecedor: '',
    });
    
    const [statusChange, setStatusChange] = useState<{[id: string]: StatusPeca}>({});

    const handleAddPeca = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin || !novaPeca.nome || !novaPeca.fornecedor) {
            alert('Apenas o Administrador pode adicionar peças e todos os campos devem ser preenchidos.');
            return;
        }

        const pecaToSave: Peca = {
            ...novaPeca,
            id: '', 
            status: StatusPeca.EM_PRODUCAO,
        };

        DataService.addPecaToAeronave(aeronaveCodigo, pecaToSave);
        setNovaPeca({ nome: '', tipo: TipoPeca.NACIONAL, fornecedor: '' });
        onPecaUpdate();
    };
    
    const handleUpdateStatus = (pecaId: string) => {
        const novoStatus = statusChange[pecaId];
        if (!novoStatus) return;

        if (!isEngineer) {
            alert('Você não tem permissão para alterar o status das peças.');
            return;
        }

        const success = DataService.updatePecaStatus(aeronaveCodigo, pecaId, novoStatus);
        if (success) {
            alert(`Status da peça atualizado com sucesso para: ${novoStatus}`);
            setStatusChange(prev => { 
                const newState = { ...prev };
                delete newState[pecaId];
                return newState;
            });
            onPecaUpdate();
        } else {
            alert('Falha ao atualizar o status da peça.');
        }
    };


    const StatusPecaTag: React.FC<{ status: StatusPeca }> = ({ status }) => {
        const colorMap = {
            [StatusPeca.PRONTA]: '#4CAF50', 
            [StatusPeca.EM_PRODUCAO]: '#2746D4', 
            [StatusPeca.EM_TRANSPORTE]: '#FFC107', 
        };
        return (
            <span style={{ 
                backgroundColor: colorMap[status], 
                color: status === StatusPeca.EM_TRANSPORTE ? 'black' : 'white', 
                padding: '3px 8px', 
                borderRadius: '4px', 
                fontSize: '12px'
            }}>
                {status}
            </span>
        );
    };

    return (
        <div style={{ marginTop: '30px' }}>
            <h3>Gestão de Peças Associadas</h3>

            {isAdmin && (
                <form onSubmit={handleAddPeca} style={{ border: '1px dashed #ddd', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
                    <h4 style={{ marginTop: 0 }}>Adicionar Nova Peça (Admin)</h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            type="text" 
                            placeholder="Nome da Peça"
                            value={novaPeca.nome} 
                            onChange={(e) => setNovaPeca(p => ({ ...p, nome: e.target.value }))} 
                            required style={{ flex: 2, padding: '8px' }} 
                        />
                         <input 
                            type="text" 
                            placeholder="Fornecedor"
                            value={novaPeca.fornecedor} 
                            onChange={(e) => setNovaPeca(p => ({ ...p, fornecedor: e.target.value }))} 
                            required style={{ flex: 1.5, padding: '8px' }} 
                        />
                        <select 
                            value={novaPeca.tipo} 
                            onChange={(e) => setNovaPeca(p => ({ ...p, tipo: e.target.value as TipoPeca }))} 
                            style={{ flex: 1, padding: '8px' }}
                        >
                            <option value={TipoPeca.NACIONAL}>Nacional</option>
                            <option value={TipoPeca.IMPORTADA}>Importada</option>
                        </select>
                        <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Adicionar
                        </button>
                    </div>
                </form>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #ddd' }}>
                        <th style={{ textAlign: 'left', padding: '10px 0' }}>Nome</th>
                        <th style={{ textAlign: 'left', padding: '10px 0' }}>Tipo</th>
                        <th style={{ textAlign: 'left', padding: '10px 0' }}>Fornecedor</th>
                        <th style={{ textAlign: 'left', padding: '10px 0' }}>Status Atual</th>
                        <th style={{ textAlign: 'left', padding: '10px 0' }}>Ação (Engenheiro)</th>
                    </tr>
                </thead>
                <tbody>
                    {pecas.map((peca) => (
                        <tr key={peca.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px 0' }}>{peca.nome}</td>
                            <td style={{ padding: '10px 0' }}>{peca.tipo}</td>
                            <td style={{ padding: '10px 0' }}>{peca.fornecedor}</td>
                            <td style={{ padding: '10px 0' }}>
                                <StatusPecaTag status={peca.status} />
                            </td>
                            <td style={{ padding: '10px 0', display: 'flex', gap: '5px' }}>
                                {(isEngineer && peca.status !== StatusPeca.PRONTA) ? (
                                    <>
                                        <select
                                            value={statusChange[peca.id] || peca.status}
                                            onChange={(e) => setStatusChange(prev => ({ ...prev, [peca.id]: e.target.value as StatusPeca }))}
                                            style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                                        >
                                            {Object.values(StatusPeca).map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                        <button 
                                            onClick={() => handleUpdateStatus(peca.id)}
                                            disabled={statusChange[peca.id] === peca.status || !statusChange[peca.id] || statusChange[peca.id] === peca.status}
                                            style={{ padding: '5px 10px', backgroundColor: '#2980b9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Mudar Status
                                        </button>
                                    </>
                                ) : (
                                    <span>{peca.status === StatusPeca.PRONTA ? 'Pronta' : 'Ação indisponível'}</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

interface TesteManagementProps {
    aeronaveCodigo: string;
    testes: Teste[];
    onTestUpdate: () => void;
}

const TesteManagement: React.FC<TesteManagementProps> = ({ aeronaveCodigo, testes, onTestUpdate }) => {
    const { isEngineer } = useAuth();
    const [tipoTeste, setTipoTeste] = useState<TipoTeste>(TipoTeste.ELETRICO);
    const [resultado, setResultado] = useState<ResultadoTeste>(ResultadoTeste.APROVADO);

    const handleAddTeste = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isEngineer) {
            alert('Você não tem permissão para registrar testes.');
            return;
        }

        DataService.addTesteToAeronave(aeronaveCodigo, tipoTeste, resultado);
        onTestUpdate();
        alert(`Teste ${tipoTeste} registrado como ${resultado}.`);
    };

    const isTestFailed = testes.some(t => t.resultado === ResultadoTeste.REPROVADO);

    return (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>Registro de Testes</h3>

            {isEngineer && (
                <form onSubmit={handleAddTeste} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <select 
                        value={tipoTeste} 
                        onChange={(e) => setTipoTeste(e.target.value as TipoTeste)} 
                        style={{ padding: '8px', flex: 1 }}
                    >
                        {Object.values(TipoTeste).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    
                    <select 
                        value={resultado} 
                        onChange={(e) => setResultado(e.target.value as ResultadoTeste)} 
                        style={{ padding: '8px', flex: 1 }}
                    >
                        <option value={ResultadoTeste.APROVADO}>Aprovado</option>
                        <option value={ResultadoTeste.REPROVADO}>Reprovado</option>
                    </select>

                    <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Registrar
                    </button>
                </form>
            )}

            {isTestFailed && (
                <p style={{ color: 'red', fontWeight: 'bold' }}>ATENÇÃO: Falha em um ou mais testes! Necessário reavaliação.</p>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #ddd' }}>
                        <th style={{ textAlign: 'left', padding: '10px 0' }}>Tipo de Teste</th>
                        <th style={{ textAlign: 'left', padding: '10px 0' }}>Resultado</th>
                        <th style={{ textAlign: 'left', padding: '10px 0' }}>Data</th>
                    </tr>
                </thead>
                <tbody>
                    {testes.map((t) => (
                        <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px 0' }}>{t.tipo}</td>
                            <td style={{ padding: '10px 0', color: t.resultado === ResultadoTeste.APROVADO ? 'green' : 'red', fontWeight: 'bold' }}>
                                {t.resultado}
                            </td>
                            <td style={{ padding: '10px 0' }}>{new Date().toLocaleDateString('pt-BR')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AeronaveDetailsPage: React.FC = () => {
    const { codigo } = useParams<{ codigo: string }>();
    const { isAdmin, isEngineer } = useAuth();
    
    const [aeronave, setAeronave] = useState<Aeronave | null>(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [funcionarioSelecionado, setFuncionarioSelecionado] = useState('');

    const todosFuncionarios: Funcionario[] = DataService.loadFuncionarios();

    const loadAeronaveData = useCallback(() => {
        if (codigo) {
            const loadedAeronave = DataService.getAeronaveByCodigo(codigo);
            if (loadedAeronave?.relatorio) {
                loadedAeronave.relatorio.dataEntrega = new Date(loadedAeronave.relatorio.dataEntrega);
            }

            if (loadedAeronave) {
                setAeronave(loadedAeronave);
            } else {
                setErro(`Aeronave com código ${codigo} não encontrada.`);
            }
        }
        setLoading(false);
    }, [codigo]);

    useEffect(() => {
        loadAeronaveData();
    }, [loadAeronaveData]);
    
    const handleUpdateEtapaStatus = (etapaId: string, statusAtual: StatusEtapa) => {
        if (!aeronave || !codigo) return;

        if (!isEngineer) {
            alert('Você não tem permissão para alterar o status das etapas.');
            return;
        }

        const etapaIndex = aeronave.etapas.findIndex(e => e.id === etapaId);
        let novaStatus: StatusEtapa;

        if (statusAtual === StatusEtapa.PENDENTE) {
            novaStatus = StatusEtapa.ANDAMENTO;
        } else if (statusAtual === StatusEtapa.ANDAMENTO) {
            novaStatus = StatusEtapa.CONCLUIDA;
        } else {
            return;
        }

        if (novaStatus === StatusEtapa.CONCLUIDA) {
            if (etapaIndex > 0) {
                const etapaAnterior = aeronave.etapas[etapaIndex - 1];
                if (etapaAnterior.status !== StatusEtapa.CONCLUIDA) {
                    alert('Erro: A etapa anterior deve ser concluída antes de finalizar esta!');
                    return; 
                }
            }
        }
        
        const success = DataService.updateEtapaStatus(codigo!, etapaId, novaStatus);

        if (success) {
            loadAeronaveData();
        } else {
            alert('Falha ao atualizar o status da etapa. Verifique a ordem lógica.');
        }
    };

    const handleAssociateFuncionario = (etapaId: string) => {
        if (!aeronave || !codigo || !funcionarioSelecionado) {
            alert('Selecione um funcionário.');
            return;
        }
        if (!isEngineer) {
             alert('Você não tem permissão para associar funcionários.');
            return;
        }
        
        const success = DataService.addFuncionarioToEtapa(codigo!, etapaId, funcionarioSelecionado);

        if (success) {
            alert('Funcionário associado com sucesso!');
            setFuncionarioSelecionado('');
            loadAeronaveData();
        } else {
            alert('Falha: Funcionário já está associado a esta etapa.');
        }
    };
    
    const handleRemoveFuncionario = (etapaId: string, funcionarioId: string) => {
        if (!isEngineer) {
             alert('Você não tem permissão para desassociar funcionários.');
            return;
        }
        
        const success = DataService.removeFuncionarioFromEtapa(codigo!, etapaId, funcionarioId);
        if (success) {
            alert('Funcionário removido com sucesso!');
            loadAeronaveData();
        } else {
            alert('Falha ao remover funcionário.');
        }
    };
    
    const handleSaveDetails = () => {
        if (!aeronave) return;
        
        if (!isAdmin) {
            alert('Você não tem permissão para editar os detalhes da aeronave.');
            return;
        }
        
        DataService.saveAeronave(aeronave);
        alert('Detalhes da aeronave salvos com sucesso!');
    };


    if (loading) return <Layout><h1>Carregando...</h1></Layout>;
    if (erro) return <Layout><h1>Erro: {erro}</h1></Layout>;
    if (!aeronave) return <Layout><h1>Aeronave não especificada.</h1></Layout>;
  
    const EtapasList: React.FC<{ etapas: Etapa[] }> = ({ etapas }) => (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2>Etapas de Produção</h2>
            {etapas.map((etapa, index) => {
                const etapaAnteriorConcluida = index === 0 || etapas[index - 1].status === StatusEtapa.CONCLUIDA;
                const isNextEtapaReady = etapa.status === StatusEtapa.PENDENTE && etapaAnteriorConcluida;
                
                let buttonText = '';
                let buttonAction = StatusEtapa.PENDENTE; 

                if (etapa.status === StatusEtapa.PENDENTE && isNextEtapaReady) {
                    buttonText = 'Iniciar';
                    buttonAction = StatusEtapa.PENDENTE;
                } else if (etapa.status === StatusEtapa.ANDAMENTO) {
                    buttonText = 'Finalizar';
                    buttonAction = StatusEtapa.ANDAMENTO;
                }
                
                const funcionariosAssociados = etapa.funcionariosDesignados.map(id => 
                    todosFuncionarios.find(f => f.id === id)?.nome || `ID Desconhecido (${id})`
                );

                return (
                    <div key={etapa.id} style={{ marginBottom: '15px', border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 2 }}>
                                <strong style={{ color: etapa.status === StatusEtapa.CONCLUIDA ? '#4CAF50' : '#333' }}>
                                    {index + 1}. {etapa.nome}
                                </strong>
                                <p style={{ fontSize: '12px', color: '#666' }}>Prazo: {etapa.prazo.toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div style={{ flex: 1 }}>
                                <span style={{ fontWeight: 'bold', color: etapa.status === StatusEtapa.CONCLUIDA ? '#4CAF50' : etapa.status === StatusEtapa.ANDAMENTO ? '#2746D4' : '#666' }}>
                                    {etapa.status}
                                </span>
                            </div>
                            
                            <div style={{ flex: 1, textAlign: 'right' as 'right' }}>
                                {buttonText && isEngineer ? (
                                    <button
                                        onClick={() => handleUpdateEtapaStatus(etapa.id, buttonAction)}
                                        disabled={!isEngineer}
                                        style={{ padding: '5px 10px', borderRadius: '4px', border: 'none', fontWeight: 'bold', 
                                                 backgroundColor: etapa.status === StatusEtapa.PENDENTE ? '#FFC107' : '#2746D4',
                                                 color: etapa.status === StatusEtapa.PENDENTE ? 'black' : 'white',
                                                 cursor: 'pointer' }}
                                    >
                                        {buttonText}
                                    </button>
                                ) : etapa.status === StatusEtapa.CONCLUIDA ? (
                                    <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>Concluída</span>
                                ) : (
                                    <span style={{ color: '#B0BEC5', fontWeight: 'bold' }}>Bloqueada</span>
                                )}
                            </div>
                        </div>

                        <div style={{ marginTop: '10px', borderTop: '1px dashed #eee', paddingTop: '10px' }}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '12px', fontWeight: 'bold' }}>Responsáveis:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                                {funcionariosAssociados.map((nome, i) => (
                                    <span key={i} style={{ backgroundColor: '#f0f8ff', padding: '3px 8px', borderRadius: '15px', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                                        {nome}
                                        {isEngineer && (
                                            <button 
                                                type="button"
                                                onClick={() => handleRemoveFuncionario(etapa.id, etapa.funcionariosDesignados[i])}
                                                style={{ marginLeft: '5px', background: 'none', border: 'none', color: '#c0392b', fontSize: '10px', cursor: 'pointer', padding: 0 }}
                                            >
                                                x
                                            </button>
                                        )}
                                    </span>
                                ))}
                            </div>
                            
                            {isEngineer && (
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <select 
                                        value={funcionarioSelecionado} 
                                        onChange={(e) => setFuncionarioSelecionado(e.target.value)} 
                                        style={{ padding: '5px', borderRadius: '4px', flex: 1 }}
                                    >
                                        <option value="">Selecione Funcionário...</option>
                                        {todosFuncionarios.map(f => (
                                            <option key={f.id} value={f.id}>{f.nome} ({f.nivelPermissao})</option>
                                        ))}
                                    </select>
                                    <button 
                                        type="button"
                                        onClick={() => handleAssociateFuncionario(etapa.id)}
                                        disabled={!funcionarioSelecionado}
                                        style={{ padding: '5px 10px', backgroundColor: '#5cb85c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Associar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <Layout>
            <h1 style={{ marginBottom: '20px' }}>Detalhes da Aeronave: {aeronave.codigo} ({aeronave.modelo})</h1>
            
            <div style={{ display: 'flex', gap: '30px' }}>
                
                <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    
                    <RelatorioGeneration aeronave={aeronave} onRelatorioGenerated={loadAeronaveData} />
                    
                    <hr style={{ margin: '20px 0' }} />
                    
                    <h2>Informações Básicas</h2>
                    
                    <div style={{ marginTop: '15px', display: 'grid', gap: '10px' }}>
                       
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold' }}>Modelo:</label>
                            {isAdmin ? (
                                <input type="text" value={aeronave.modelo} onChange={(e) => setAeronave(prev => (prev ? { ...prev, modelo: e.target.value } : null))} style={{ width: '100%', padding: '8px' }} />
                            ) : (
                                <p style={{ padding: '8px', border: '1px solid #eee' }}>{aeronave.modelo}</p>
                            )}
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold' }}>Capacidade:</label>
                            {isAdmin ? (
                                <input type="number" value={aeronave.capacidade} onChange={(e) => setAeronave(prev => (prev ? { ...prev, capacidade: parseInt(e.target.value) } : null))} style={{ width: '100%', padding: '8px' }} />
                            ) : (
                                <p style={{ padding: '8px', border: '1px solid #eee' }}>{aeronave.capacidade} passageiros</p>
                            )}
                        </div>
                    </div>

                    {isAdmin && (
                        <button onClick={handleSaveDetails} style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}>
                            Salvar Detalhes
                        </button>
                    )}
                </div>
                
                <div style={{ flex: 2, backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    
                    <EtapasList etapas={aeronave.etapas} />
                    
                    <hr style={{ margin: '30px 0' }} />
                    
                    <PecaManagement aeronaveCodigo={aeronave.codigo} pecas={aeronave.pecas} onPecaUpdate={loadAeronaveData} />
                    
                    <hr style={{ margin: '30px 0' }} />
                    
                    <TesteManagement aeronaveCodigo={aeronave.codigo} testes={aeronave.testes} onTestUpdate={loadAeronaveData} />
                </div>
            </div>
        </Layout>
    );
};

export default AeronaveDetailsPage;