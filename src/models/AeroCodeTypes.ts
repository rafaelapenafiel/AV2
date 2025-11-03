export enum TipoAeronave {
    COMERCIAL = "Comercial",
    MILITAR = "Militar",
}

export enum TipoPeca {
    NACIONAL = "Nacional",
    IMPORTADA = "Importada",
}

export enum StatusPeca {
    EM_PRODUCAO = "Em Produção",
    EM_TRANSPORTE = "Em Transporte",
    PRONTA = "Pronta para Uso",
}

export enum StatusEtapa {
    PENDENTE = "Pendente",
    ANDAMENTO = "Em Andamento",
    CONCLUIDA = "Concluída",
}

export enum NivelPermissao {
    ADMINISTRADOR = "Administrador",
    ENGENHEIRO = "Engenheiro",
    OPERADOR = "Operador",
}

export enum TipoTeste {
    ELETRICO = "Elétrico",
    HIDRAULICO = "Hidráulico",
    AERODINAMICO = "Aerodinâmico",
}

export enum ResultadoTeste {
    APROVADO = "Aprovado",
    REPROVADO = "Reprovado",
}


export interface Funcionario {
    id: string; 
    nome: string;
    telefone: string;
    endereco: string;
    usuario: string;
    senha: string; 
    nivelPermissao: NivelPermissao;
}

export interface Peca {
    id: string;
    nome: string;
    tipo: TipoPeca;
    fornecedor: string;
    status: StatusPeca;
}

export interface Teste {
    id: string;
    tipo: TipoTeste;
    resultado: ResultadoTeste;
}

export interface Etapa {
    id: string; 
    nome: string;
    prazo: Date; 
    status: StatusEtapa;
    funcionariosDesignados: Funcionario['id'][]; 
}

export interface Relatorio {
    clienteNome: string;
    dataEntrega: Date;
    
    aeronaveCodigo: string;
    aeronaveModelo: string;
    aeronaveTipo: TipoAeronave;
    aeronaveCapacidade: number;
    aeronaveAlcance: number;
    
    etapasRealizadas: Etapa[]; 
    pecasUtilizadas: Peca[];   
    resultadosTestes: Teste[]; 
    conteudoTexto: string; 
}

export interface Aeronave {
    codigo: string; 
    modelo: string;
    tipo: TipoAeronave;
    capacidade: number;
    alcance: number;
    etapas: Etapa[];
    pecas: Peca[];
    testes: Teste[];
    relatorio: Relatorio | null; 
}