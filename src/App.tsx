import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AeronaveDetailsPage from './pages/AeronaveDetailsPage';
import AeronaveFormPage from './pages/AeronaveFormPage';
import Layout from './components/layout/Layout';
import { useAuth } from './context/AuthContext';
import { NivelPermissao } from './models/AeroCodeTypes';
import FuncionarioManagementPage from './pages/FuncionarioManagementPage';
import AeronavesListPage from './pages/AeronavesListPage'; 
import RelatoriosPage from './pages/RelatoriosPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { usuario } = useAuth();
  if (!usuario) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

interface PermissionRouteProps extends ProtectedRouteProps {
  allowedPermissions: NivelPermissao[];
}

const PermissionRoute: React.FC<PermissionRouteProps> = ({ children, allowedPermissions }) => {
  const { usuario } = useAuth();
  
  if (!usuario) return <Navigate to="/" replace />;
  
  if (!allowedPermissions.includes(usuario.nivelPermissao)) {
    return <Layout><h1>Acesso Negado</h1><p>Você não tem permissão para visualizar ou editar este recurso.</p></Layout>;
  }
  
  return <>{children}</>;
};


const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/aeronaves/:codigo" 
        element={
          <ProtectedRoute>
            <AeronaveDetailsPage />
          </ProtectedRoute>
        }
      />
      
      <Route path="/aeronaves/cadastro" element={
        <PermissionRoute allowedPermissions={[NivelPermissao.ADMINISTRADOR]}> 
            <AeronaveFormPage /> 
        </PermissionRoute>
      } />
      
      
      <Route path="/funcionarios" element={
        <PermissionRoute allowedPermissions={[NivelPermissao.ADMINISTRADOR]}> 
            <FuncionarioManagementPage /> 
        </PermissionRoute>
      } />
      
      <Route path="/aeronaves" element={
    <ProtectedRoute> 
        <AeronavesListPage /> 
    </ProtectedRoute>
} />

    <Route path="/relatorios" element={
    <ProtectedRoute> 
        <RelatoriosPage /> 
    </ProtectedRoute>
} />
      
      
      <Route path="*" element={<h1>404 - Página Não Encontrada</h1>} />
    </Routes>
  );
};

export default App;