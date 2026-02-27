import { useState, useEffect, useCallback, createContext, useContext } from 'react';

// ========== TOAST CONTEXT ==========
const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    return (
        <ToastContext.Provider value={addToast}>
            {children}
            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`toast ${t.type}`}>
                        <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : '⚠'}</span>
                        <span>{t.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);

// ========== MODAL ==========
export function Modal({ isOpen, onClose, title, children, footer, wide }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                style={wide ? { maxWidth: '900px' } : {}}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
}

// ========== CONFIRM MODAL ==========
export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', danger }) {
    if (!isOpen) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <p className="confirm-message">{message}</p>
            <div className="confirm-actions">
                <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
}

// ========== SIDEBAR ==========
export function Sidebar({ currentPath, onNavigate, onLogout }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const links = [
        { path: '/', icon: '📊', label: 'Dashboard' },
        { path: '/clientes', icon: '👥', label: 'Clientes' },
        { path: '/pedidos', icon: '📦', label: 'Pedidos' }
    ];

    const handleNav = (path) => {
        onNavigate(path);
        setMobileOpen(false);
    };

    return (
        <>
            <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? '✕' : '☰'}
            </button>
            <div className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />
            <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
                <div className="sidebar-brand" onClick={() => handleNav('/empresa')} style={{ cursor: 'pointer' }} title="Datos de la empresa">
                    <div className="brand-icon">💡</div>
                    <div>
                        <h1>BM Iluminación</h1>
                        <span>Sistema de Gestión</span>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    {links.map(link => (
                        <a
                            key={link.path}
                            href={link.path}
                            className={currentPath === link.path ? 'active' : ''}
                            onClick={e => { e.preventDefault(); handleNav(link.path); }}
                        >
                            <span className="nav-icon">{link.icon}</span>
                            {link.label}
                        </a>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button onClick={onLogout}>
                        <span>🚪</span>
                        Cerrar Sesión
                    </button>
                </div>
            </aside>
        </>
    );
}

// ========== PAGINATION ==========
export function Pagination({ pagination, onPageChange }) {
    if (!pagination || pagination.pages <= 1) return null;
    const { page, pages, total } = pagination;

    return (
        <div className="table-pagination">
            <span>Mostrando página {page} de {pages} ({total} registros)</span>
            <div className="pagination-buttons">
                <button
                    className="btn btn-secondary btn-sm"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    ← Anterior
                </button>
                <button
                    className="btn btn-secondary btn-sm"
                    disabled={page >= pages}
                    onClick={() => onPageChange(page + 1)}
                >
                    Siguiente →
                </button>
            </div>
        </div>
    );
}

// ========== LOADING ==========
export function Loading() {
    return (
        <div className="loading">
            <div className="spinner"></div>
        </div>
    );
}
