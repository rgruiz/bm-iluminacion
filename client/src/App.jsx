import { useState, useEffect } from 'react';
import { verifyToken } from './utils/api';
import { ToastProvider, Sidebar } from './components/Shared';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Pedidos from './pages/Pedidos';
import Empresa from './pages/Empresa';

function AppContent() {
    const [authenticated, setAuthenticated] = useState(false);
    const [checking, setChecking] = useState(true);
    const [currentPath, setCurrentPath] = useState('/');

    useEffect(() => {
        const token = localStorage.getItem('bm_token');
        if (token) {
            verifyToken()
                .then(() => setAuthenticated(true))
                .catch(() => {
                    localStorage.removeItem('bm_token');
                    setAuthenticated(false);
                })
                .finally(() => setChecking(false));
        } else {
            setChecking(false);
        }
    }, []);

    const handleLogin = () => setAuthenticated(true);

    const handleLogout = () => {
        localStorage.removeItem('bm_token');
        setAuthenticated(false);
        setCurrentPath('/');
    };

    if (checking) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!authenticated) {
        return <Login onLogin={handleLogin} />;
    }

    const renderPage = () => {
        switch (currentPath) {
            case '/clientes': return <Clientes />;
            case '/pedidos': return <Pedidos />;
            case '/empresa': return <Empresa />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="app-layout">
            <Sidebar currentPath={currentPath} onNavigate={setCurrentPath} onLogout={handleLogout} />
            <main className="main-content">
                {renderPage()}
            </main>
        </div>
    );
}

export default function App() {
    return (
        <ToastProvider>
            <AppContent />
        </ToastProvider>
    );
}
