import {
    type Aeronave, TipoAeronave, StatusEtapa, NivelPermissao,
    type Funcionario, TipoPeca, StatusPeca, TipoTeste, ResultadoTeste, type Etapa, type Peca, type Teste, type Relatorio
} from '../models/AeroCodeTypes';

const generateId = (): string => Math.random().toString(36).substring(2, 9);


const mockFuncionarios: Funcionario[] = [
    { id: 'F001', nome: 'Ozires Silva', telefone: '11987654321', endereco: 'Rua A, 123', usuario: 'admin', senha: '123', nivelPermissao: NivelPermissao.ADMINISTRADOR },
    { id: 'F002', nome: 'Eng. Chefe', telefone: '11999998888', endereco: 'Rua B, 456', usuario: 'engenheiro', senha: '123', nivelPermissao: NivelPermissao.ENGENHEIRO },
    { id: 'F003', nome: 'Operador Fabrica', telefone: '11977776666', endereco: 'Rua C, 789', usuario: 'operador', senha: '123', nivelPermissao: NivelPermissao.OPERADOR },
];


const mockPecas: Peca[] = [
    { id: 'P001', nome: 'Fuselage Dianteira', tipo: TipoPeca.IMPORTADA, fornecedor: 'China Aero', status: StatusPeca.EM_TRANSPORTE },
    { id: 'P002', nome: 'Asa Esquerda', tipo: TipoPeca.NACIONAL, fornecedor: 'Asas BR', status: StatusPeca.PRONTA },
    { id: 'P003', nome: 'Trem de Pouso', tipo: TipoPeca.IMPORTADA, fornecedor: 'Gear Inc', status: StatusPeca.PRONTA },
];


const etapasEmAndamento: Etapa[] = [
    { id: 'E001', nome: 'Montagem da Fuselagem', prazo: new Date(2025, 11, 15), status: StatusEtapa.CONCLUIDA, funcionariosDesignados: ['F002', 'F003'] },
    { id: 'E002', nome: 'Instalação da Asa', prazo: new Date(2026, 0, 20), status: StatusEtapa.ANDAMENTO, funcionariosDesignados: ['F002'] },
    { id: 'E003', nome: 'Instalação do Trem de Pouso', prazo: new Date(2026, 1, 10), status: StatusEtapa.PENDENTE, funcionariosDesignados: [] },
    { id: 'E004', nome: 'Testes Elétricos', prazo: new Date(2026, 2, 5), status: StatusEtapa.PENDENTE, funcionariosDesignados: [] },
];


export const mockAeronaves: Aeronave[] = [
    {
        codigo: 'E195-BR01',
        modelo: 'E195-E2',
        tipo: TipoAeronave.COMERCIAL,
        capacidade: 146,
        alcance: 4800,
        etapas: etapasEmAndamento,
        pecas: mockPecas,
        testes: [
            { id: 'T001', tipo: TipoTeste.ELETRICO, resultado: ResultadoTeste.REPROVADO }
        ],
        relatorio: null,
    },
    {
        codigo: 'C390-MIL02',
        modelo: 'KC-390 Millennium',
        tipo: TipoAeronave.MILITAR,
        capacidade: 80,
        alcance: 6000,
        etapas: [
            { id: 'E100', nome: 'Montagem Inicial', prazo: new Date(2026, 5, 1), status: StatusEtapa.PENDENTE, funcionariosDesignados: [] }
        ],
        pecas: [],
        testes: [],
        relatorio: null,
    }
];




export const allFuncionarios = mockFuncionarios;

export const AuthService = {
    login: (usuario: string, senha: string): Funcionario | null => {
        const funcionarios = DataService.loadFuncionarios();
        const funcionario = funcionarios.find(f => f.usuario === usuario && f.senha === senha);
        return funcionario || null;
    }
};

export const DataService = {



    loadAeronaves: (): Aeronave[] => {
        const stored = localStorage.getItem('aerocodeAeronaves');
        if (!stored) return mockAeronaves; 
        
        const aeronaves: Aeronave[] = JSON.parse(stored);
        

        aeronaves.forEach(aero => {
            aero.etapas.forEach(etapa => {
                etapa.prazo = new Date(etapa.prazo);
            });
            if (aero.relatorio) {
                 aero.relatorio.dataEntrega = new Date(aero.relatorio.dataEntrega);
            }
        });

        return aeronaves;
    },
    
    saveAeronaves: (aeronaves: Aeronave[]): void => {
        localStorage.setItem('aerocodeAeronaves', JSON.stringify(aeronaves));
    },

  

    getAeronaveByCodigo: (codigo: string): Aeronave | undefined => {
        return DataService.loadAeronaves().find(a => a.codigo === codigo);
    },

    saveAeronave: (newAeronave: Aeronave): void => {
        const aeronaves = DataService.loadAeronaves();
        const index = aeronaves.findIndex(a => a.codigo === newAeronave.codigo);
        
        newAeronave.etapas = newAeronave.etapas.map(e => e.id ? e : { ...e, id: generateId() });
        newAeronave.pecas = newAeronave.pecas.map(p => p.id ? p : { ...p, id: generateId() });


        if (index > -1) {
          
            aeronaves[index] = newAeronave;
        } else {
          
            aeronaves.push(newAeronave);
        }

        DataService.saveAeronaves(aeronaves);
    },
    

    
    updateEtapaStatus: (aeronaveCodigo: string, etapaId: string, novoStatus: StatusEtapa): boolean => {
        const aeronaves = DataService.loadAeronaves();
        const aeroIndex = aeronaves.findIndex(a => a.codigo === aeronaveCodigo);
        
        if (aeroIndex === -1) return false;

        const aeronave = aeronaves[aeroIndex];
        const etapaIndex = aeronave.etapas.findIndex(e => e.id === etapaId);

        if (etapaIndex === -1) return false;


        if (novoStatus === StatusEtapa.CONCLUIDA) {
            if (etapaIndex > 0) {
                const etapaAnterior = aeronave.etapas[etapaIndex - 1];
                if (etapaAnterior.status !== StatusEtapa.CONCLUIDA) {
                    return false; 
                }
            }
        }
        
        aeronave.etapas[etapaIndex].status = novoStatus;
        
        DataService.saveAeronaves(aeronaves);
        return true;
    },


    addFuncionarioToEtapa: (aeronaveCodigo: string, etapaId: string, funcionarioId: string): boolean => {
        const aeronaves = DataService.loadAeronaves();
        const aeroIndex = aeronaves.findIndex(a => a.codigo === aeronaveCodigo);
        
        if (aeroIndex === -1) return false;

        const aeronave = aeronaves[aeroIndex];
        const etapa = aeronave.etapas.find(e => e.id === etapaId);

        if (!etapa) return false;

 
        if (!etapa.funcionariosDesignados.includes(funcionarioId)) {
            etapa.funcionariosDesignados.push(funcionarioId);
            DataService.saveAeronaves(aeronaves);
            return true;
        }
        return false;
    },


    removeFuncionarioFromEtapa: (aeronaveCodigo: string, etapaId: string, funcionarioId: string): boolean => {
        const aeronaves = DataService.loadAeronaves();
        const aeroIndex = aeronaves.findIndex(a => a.codigo === aeronaveCodigo);
        
        if (aeroIndex === -1) return false;

        const aeronave = aeronaves[aeroIndex];
        const etapa = aeronave.etapas.find(e => e.id === etapaId);

        if (!etapa) return false;

        const initialLength = etapa.funcionariosDesignados.length;
        etapa.funcionariosDesignados = etapa.funcionariosDesignados.filter(id => id !== funcionarioId);

        if (etapa.funcionariosDesignados.length < initialLength) {
            DataService.saveAeronaves(aeronaves);
            return true;
        }
        return false;
    },

  

    addPecaToAeronave: (aeronaveCodigo: string, novaPeca: Peca): void => {
        const aeronaves = DataService.loadAeronaves();
        const aeroIndex = aeronaves.findIndex(a => a.codigo === aeronaveCodigo);

        if (aeroIndex === -1) return;

 
        novaPeca.id = generateId();

        aeronaves[aeroIndex].pecas.push(novaPeca);
        DataService.saveAeronaves(aeronaves);
    },

    updatePecaStatus: (aeronaveCodigo: string, pecaId: string, novoStatus: StatusPeca): boolean => {
        const aeronaves = DataService.loadAeronaves();
        const aeroIndex = aeronaves.findIndex(a => a.codigo === aeronaveCodigo);

        if (aeroIndex === -1) return false;

        const aeronave = aeronaves[aeroIndex];
        const pecaIndex = aeronave.pecas.findIndex(p => p.id === pecaId);

        if (pecaIndex === -1) return false;

    
        aeronave.pecas[pecaIndex].status = novoStatus;

        DataService.saveAeronaves(aeronaves);
        return true;
    },
    


    addTesteToAeronave: (aeronaveCodigo: string, tipo: TipoTeste, resultado: ResultadoTeste): void => {
        const aeronaves = DataService.loadAeronaves();
        const aeroIndex = aeronaves.findIndex(a => a.codigo === aeronaveCodigo);

        if (aeroIndex === -1) return;

        const novoTeste: Teste = {
            id: generateId(),
            tipo: tipo,
            resultado: resultado,
        };

        aeronaves[aeroIndex].testes.push(novoTeste);
        DataService.saveAeronaves(aeronaves);
    },
    
    
    generateAndSaveRelatorio: (aeronaveCodigo: string, clienteNome: string, dataEntrega: Date): string | false => {
        const aeronaves = DataService.loadAeronaves();
        const aeroIndex = aeronaves.findIndex(a => a.codigo === aeronaveCodigo);

        if (aeroIndex === -1) return false;

        const aeronave = aeronaves[aeroIndex];
        
        const allEtapasDone = aeronave.etapas.every(e => e.status === StatusEtapa.CONCLUIDA);
        if (!allEtapasDone) {
             console.error("Relatório não pode ser gerado: Nem todas as etapas estão concluídas.");
             return false;
        }

        const conteudoTexto = `
--- RELATÓRIO FINAL DE ENTREGA DA AERONAVE ${aeronave.codigo} ---
        CLIENTE: ${clienteNome}
        DATA DE ENTREGA: ${dataEntrega.toLocaleDateString('pt-BR')}

    DADOS DA AERONAVE:
        Modelo: ${aeronave.modelo} (${aeronave.tipo})
        Capacidade: ${aeronave.capacidade}
        Alcance: ${aeronave.alcance} km

    ETAPAS DE PRODUÇÃO REALIZADAS:
        ${aeronave.etapas.map(e => `    - ${e.nome} (Status: ${e.status}, Prazo: ${e.prazo.toLocaleDateString()})`).join('\n')}

    PEÇAS UTILIZADAS:
        ${aeronave.pecas.map(p => `    - ${p.nome} (Fornecedor: ${p.fornecedor}, Status: ${p.status})`).join('\n')}

    RESULTADOS DOS TESTES:
        ${aeronave.testes.map(t => `    - ${t.tipo}: ${t.resultado}`).join('\n')}

    --- FIM DO RELATÓRIO ---
`;

        const relatorioFinal: Relatorio = {
            clienteNome,
            dataEntrega,
            aeronaveCodigo: aeronave.codigo,
            aeronaveModelo: aeronave.modelo,
            aeronaveTipo: aeronave.tipo,
            aeronaveCapacidade: aeronave.capacidade,
            aeronaveAlcance: aeronave.alcance,
            etapasRealizadas: [...aeronave.etapas],
            pecasUtilizadas: [...aeronave.pecas],
            resultadosTestes: [...aeronave.testes],
            conteudoTexto,
        };

        aeronave.relatorio = relatorioFinal;
        DataService.saveAeronaves(aeronaves);
        
        return conteudoTexto; 
    },



    
    loadFuncionarios: (): Funcionario[] => {
        const stored = localStorage.getItem('aerocodeFuncionarios');
        
        return stored ? JSON.parse(stored) : mockFuncionarios;
    },

    saveFuncionarios: (funcionarios: Funcionario[]): void => {
        localStorage.setItem('aerocodeFuncionarios', JSON.stringify(funcionarios));
    },

    addFuncionario: (newFuncionarioData: Omit<Funcionario, 'id'>): boolean => {
        
        const newFuncionario: Funcionario = {
            ...newFuncionarioData,
            id: generateId(), 
            senha: newFuncionarioData.senha || '123', 
        };
        
        const funcionarios = DataService.loadFuncionarios();
        
        if (funcionarios.some(f => f.usuario === newFuncionario.usuario)) {
            return false; 
        }

        funcionarios.push(newFuncionario);
        DataService.saveFuncionarios(funcionarios);
        return true;
    },

    deleteFuncionario: (id: string): boolean => {
        const funcionarios = DataService.loadFuncionarios();
        const initialLength = funcionarios.length;
        
        if (id === 'F001') return false; 
        
        const newFuncionarios = funcionarios.filter(f => f.id !== id);
        
        if (newFuncionarios.length < initialLength) {
            DataService.saveFuncionarios(newFuncionarios);
            return true;
        }
        return false;
    }
};

if (!localStorage.getItem('aerocodeAeronaves')) {
    DataService.saveAeronaves(mockAeronaves);
}

if (!localStorage.getItem('aerocodeFuncionarios')) {
    DataService.saveFuncionarios(mockFuncionarios);
}