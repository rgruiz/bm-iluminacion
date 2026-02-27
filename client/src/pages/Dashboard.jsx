import { useState, useEffect } from 'react';
import { getStats, formatCurrency, formatDate, estadoLabels } from '../utils/api';
import { Loading } from '../components/Shared';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await getStats();
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;
    if (!stats) return <p>Error al cargar datos</p>;

    const estados = ['pendiente', 'en_produccion', 'listo', 'entregado', 'cancelado'];

    return (
        <div>
            <div className="page-header">
                <h2>Dashboard</h2>
                <p>Resumen general de BM Iluminación</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card amber">
                    <div className="stat-icon amber">👥</div>
                    <div className="stat-info">
                        <h3>{stats.totalClientes}</h3>
                        <p>Clientes Activos</p>
                    </div>
                </div>
                <div className="stat-card blue">
                    <div className="stat-icon blue">📦</div>
                    <div className="stat-info">
                        <h3>{stats.pedidosActivos}</h3>
                        <p>Pedidos en Curso</p>
                    </div>
                </div>
                <div className="stat-card green">
                    <div className="stat-icon green">📋</div>
                    <div className="stat-info">
                        <h3>{stats.pedidosMes}</h3>
                        <p>Pedidos del Mes</p>
                    </div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-icon purple">💰</div>
                    <div className="stat-info">
                        <h3>{formatCurrency(stats.montoMes)}</h3>
                        <p>Facturación del Mes</p>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '1rem' }}>
                    Pedidos por Estado
                </h3>
                <div className="status-chart">
                    {estados.map(est => (
                        <div key={est} className={`status-bar ${est}`}>
                            <div className="status-count">{stats.porEstado[est] || 0}</div>
                            <div className="status-label">{estadoLabels[est]}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="recent-section">
                <h3>Últimos Pedidos</h3>
                <div className="table-container">
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Folio</th>
                                    <th>Cliente</th>
                                    <th>Estado</th>
                                    <th>Total</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recientes.length === 0 ? (
                                    <tr><td colSpan="5" className="table-empty">No hay pedidos aún</td></tr>
                                ) : (
                                    stats.recientes.map(ped => (
                                        <tr key={ped._id}>
                                            <td><span className="primary-text">{ped.folio}</span></td>
                                            <td>{ped.cliente_id?.razon_social || '—'}</td>
                                            <td><span className={`badge ${ped.estado}`}>{estadoLabels[ped.estado]}</span></td>
                                            <td>{formatCurrency(ped.total)}</td>
                                            <td>{formatDate(ped.fecha_pedido)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
