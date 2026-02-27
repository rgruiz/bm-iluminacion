const API_BASE = '/api';

const getToken = () => localStorage.getItem('bm_token');

const api = async (endpoint, options = {}) => {
    const token = getToken();
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers
        },
        ...options
    };

    const res = await fetch(`${API_BASE}${endpoint}`, config);

    if (res.status === 401) {
        localStorage.removeItem('bm_token');
        window.location.href = '/';
        throw new Error('No autorizado');
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error del servidor');
    return data;
};

export const login = (username, password) =>
    api('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });

export const verifyToken = () => api('/auth/verify');

export const getClientes = (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api(`/clientes?${q}`);
};

export const getClientesAll = () => api('/clientes/all');

export const getCliente = (id) => api(`/clientes/${id}`);

export const createCliente = (data) =>
    api('/clientes', { method: 'POST', body: JSON.stringify(data) });

export const updateCliente = (id, data) =>
    api(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteCliente = (id) =>
    api(`/clientes/${id}`, { method: 'DELETE' });

export const reactivarCliente = (id) =>
    api(`/clientes/${id}/reactivar`, { method: 'PATCH' });

export const getPedidos = (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api(`/pedidos?${q}`);
};

export const getStats = () => api('/pedidos/stats');

export const getPedido = (id) => api(`/pedidos/${id}`);

export const createPedido = (data) =>
    api('/pedidos', { method: 'POST', body: JSON.stringify(data) });

export const updatePedido = (id, data) =>
    api(`/pedidos/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deletePedido = (id) =>
    api(`/pedidos/${id}`, { method: 'DELETE' });

export const reactivarPedido = (id) =>
    api(`/pedidos/${id}/reactivar`, { method: 'PATCH' });

export const getEmpresa = () => api('/empresa');

export const updateEmpresa = (data) =>
    api('/empresa', { method: 'PUT', body: JSON.stringify(data) });

export const formatCurrency = (amount) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

export const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
};

export const estadoLabels = {
    pendiente: 'Pendiente',
    en_produccion: 'En Producción',
    listo: 'Listo',
    entregado: 'Entregado',
    cobrado: 'Cobrado',
    cancelado: 'Cancelado'
};

export default api;
