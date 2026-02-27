import { useState, useEffect, useCallback } from 'react';
import {
    getClientes, createCliente, updateCliente, deleteCliente, reactivarCliente
} from '../utils/api';
import { Modal, ConfirmModal, Pagination, Loading, useToast } from '../components/Shared';

const emptyCliente = {
    razon_social: '', cuit: '', condicion_iva: '', domicilio_fiscal: '',
    localidad: '', provincia: 'Buenos Aires', codigo_postal: '',
    email: '', telefono: '', contacto: '', transporte: '', notas: ''
};

export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filtroActivo, setFiltroActivo] = useState('true');
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [viewing, setViewing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [form, setForm] = useState(emptyCliente);
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    const loadClientes = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };
            if (search) params.search = search;
            if (filtroActivo !== '') params.activo = filtroActivo;
            const data = await getClientes(params);
            setClientes(data.data);
            setPagination(data.pagination);
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [page, search, filtroActivo, toast]);

    useEffect(() => { loadClientes(); }, [loadClientes]);

    useEffect(() => { setPage(1); }, [search, filtroActivo]);

    const openNew = () => {
        setEditing(null);
        setForm(emptyCliente);
        setModalOpen(true);
    };

    const openEdit = (c) => {
        setEditing(c);
        setForm({
            razon_social: c.razon_social || '',
            cuit: c.cuit || '',
            condicion_iva: c.condicion_iva || '',
            domicilio_fiscal: c.domicilio_fiscal || '',
            localidad: c.localidad || '',
            provincia: c.provincia || 'Buenos Aires',
            codigo_postal: c.codigo_postal || '',
            email: c.email || '',
            telefono: c.telefono || '',
            contacto: c.contacto || '',
            transporte: c.transporte || '',
            notas: c.notas || ''
        });
        setModalOpen(true);
    };

    const openDetail = (c) => {
        setViewing(c);
        setDetailOpen(true);
    };

    const handleSave = async () => {
        if (!form.razon_social.trim()) {
            toast('La razón social es obligatoria', 'error');
            return;
        }
        setSaving(true);
        try {
            if (editing) {
                await updateCliente(editing._id, form);
                toast('Cliente actualizado');
            } else {
                await createCliente(form);
                toast('Cliente creado');
            }
            setModalOpen(false);
            loadClientes();
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteCliente(deleting._id);
            toast('Cliente desactivado');
            setConfirmOpen(false);
            setDeleting(null);
            loadClientes();
        } catch (err) {
            toast(err.message, 'error');
        }
    };

    const handleReactivar = async (c) => {
        try {
            await reactivarCliente(c._id);
            toast('Cliente reactivado');
            loadClientes();
        } catch (err) {
            toast(err.message, 'error');
        }
    };

    const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2>Clientes</h2>
                    <p>Gestión de clientes de BM Iluminación</p>
                </div>
                <button className="btn btn-primary" onClick={openNew}>+ Nuevo Cliente</button>
            </div>

            <div className="table-container">
                <div className="table-toolbar">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Buscar por razón social, CUIT, email, contacto..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select value={filtroActivo} onChange={e => setFiltroActivo(e.target.value)}>
                            <option value="true">Activos</option>
                            <option value="false">Inactivos</option>
                            <option value="">Todos</option>
                        </select>
                    </div>
                </div>

                {loading ? <Loading /> : (
                    <>
                        <div className="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Razón Social</th>
                                        <th>CUIT</th>
                                        <th>Condición IVA</th>
                                        <th>Localidad</th>
                                        <th>Contacto</th>
                                        <th>Transporte</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientes.length === 0 ? (
                                        <tr>
                                            <td colSpan="8">
                                                <div className="table-empty">
                                                    <div className="empty-icon">👥</div>
                                                    <p>No se encontraron clientes</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        clientes.map(c => (
                                            <tr key={c._id}>
                                                <td>
                                                    <span
                                                        className="primary-text"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => openDetail(c)}
                                                    >
                                                        {c.razon_social}
                                                    </span>
                                                </td>
                                                <td>{c.cuit || '—'}</td>
                                                <td>{c.condicion_iva || '—'}</td>
                                                <td>{c.localidad || '—'}</td>
                                                <td>{c.contacto || '—'}</td>
                                                <td>{c.transporte || '—'}</td>
                                                <td>
                                                    <span className={`badge ${c.activo ? 'activo' : 'inactivo'}`}>
                                                        {c.activo ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="table-actions">
                                                        <button className="btn btn-ghost btn-sm" title="Ver" onClick={() => openDetail(c)}>👁</button>
                                                        <button className="btn btn-ghost btn-sm" title="Editar" onClick={() => openEdit(c)}>✏️</button>
                                                        {c.activo ? (
                                                            <button
                                                                className="btn btn-ghost btn-sm"
                                                                title="Desactivar"
                                                                onClick={() => { setDeleting(c); setConfirmOpen(true); }}
                                                            >🗑</button>
                                                        ) : (
                                                            <button
                                                                className="btn btn-ghost btn-sm"
                                                                title="Reactivar"
                                                                onClick={() => handleReactivar(c)}
                                                            >♻️</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination pagination={pagination} onPageChange={setPage} />
                    </>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? 'Editar Cliente' : 'Nuevo Cliente'}
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </>
                }
            >
                <div className="form-grid">
                    <div className="form-group">
                        <label>Razón Social *</label>
                        <input value={form.razon_social} onChange={e => updateForm('razon_social', e.target.value)} placeholder="Nombre o Razón Social" />
                    </div>
                    <div className="form-group">
                        <label>CUIT</label>
                        <input value={form.cuit} onChange={e => updateForm('cuit', e.target.value)} placeholder="XX-XXXXXXXX-X" />
                    </div>
                    <div className="form-group">
                        <label>Condición ante IVA</label>
                        <select value={form.condicion_iva} onChange={e => updateForm('condicion_iva', e.target.value)}>
                            <option value="">Seleccionar...</option>
                            <option value="Responsable Inscripto">Responsable Inscripto</option>
                            <option value="Monotributista">Monotributista</option>
                            <option value="Exento">Exento</option>
                            <option value="Consumidor Final">Consumidor Final</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Contacto</label>
                        <input value={form.contacto} onChange={e => updateForm('contacto', e.target.value)} placeholder="Persona de contacto" />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} placeholder="email@ejemplo.com" />
                    </div>
                    <div className="form-group">
                        <label>Teléfono</label>
                        <input value={form.telefono} onChange={e => updateForm('telefono', e.target.value)} placeholder="011-XXXX-XXXX" />
                    </div>
                </div>
                <div className="form-group">
                    <label>Domicilio Fiscal</label>
                    <input value={form.domicilio_fiscal} onChange={e => updateForm('domicilio_fiscal', e.target.value)} placeholder="Dirección fiscal" />
                </div>
                <div className="form-group">
                    <label>Transporte</label>
                    <input value={form.transporte} onChange={e => updateForm('transporte', e.target.value)} placeholder="Empresa de transporte del cliente" />
                </div>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Localidad</label>
                        <input value={form.localidad} onChange={e => updateForm('localidad', e.target.value)} placeholder="Localidad / Partido" />
                    </div>
                    <div className="form-group">
                        <label>Provincia</label>
                        <input value={form.provincia} onChange={e => updateForm('provincia', e.target.value)} placeholder="Provincia" />
                    </div>
                    <div className="form-group">
                        <label>Código Postal</label>
                        <input value={form.codigo_postal} onChange={e => updateForm('codigo_postal', e.target.value)} placeholder="Código Postal" />
                    </div>
                </div>
                <div className="form-group">
                    <label>Notas</label>
                    <textarea value={form.notas} onChange={e => updateForm('notas', e.target.value)} placeholder="Notas internas sobre el cliente..." />
                </div>
            </Modal>

            {/* Detail Modal */}
            <Modal
                isOpen={detailOpen}
                onClose={() => setDetailOpen(false)}
                title={viewing?.razon_social || 'Detalle Cliente'}
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setDetailOpen(false)}>Cerrar</button>
                        <button className="btn btn-primary" onClick={() => { setDetailOpen(false); openEdit(viewing); }}>Editar</button>
                    </>
                }
            >
                {viewing && (
                    <div className="detail-grid">
                        <div className="detail-item"><label>Razón Social</label><span>{viewing.razon_social}</span></div>
                        <div className="detail-item"><label>CUIT</label><span>{viewing.cuit || '—'}</span></div>
                        <div className="detail-item"><label>Condición IVA</label><span>{viewing.condicion_iva || '—'}</span></div>
                        <div className="detail-item"><label>Contacto</label><span>{viewing.contacto || '—'}</span></div>
                        <div className="detail-item"><label>Email</label><span>{viewing.email || '—'}</span></div>
                        <div className="detail-item"><label>Teléfono</label><span>{viewing.telefono || '—'}</span></div>
                        <div className="detail-item"><label>Domicilio Fiscal</label><span>{viewing.domicilio_fiscal || '—'}</span></div>
                        <div className="detail-item"><label>Localidad</label><span>{viewing.localidad || '—'}</span></div>
                        <div className="detail-item"><label>Provincia</label><span>{viewing.provincia || '—'}</span></div>
                        <div className="detail-item"><label>Código Postal</label><span>{viewing.codigo_postal || '—'}</span></div>
                        <div className="detail-item"><label>Transporte</label><span>{viewing.transporte || '—'}</span></div>
                        <div className="detail-item" style={{ gridColumn: '1 / -1' }}><label>Notas</label><span>{viewing.notas || '—'}</span></div>
                    </div>
                )}
            </Modal>

            {/* Confirm Delete */}
            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => { setConfirmOpen(false); setDeleting(null); }}
                onConfirm={handleDelete}
                title="Desactivar Cliente"
                message={`¿Está seguro que desea desactivar a "${deleting?.razon_social}"? El cliente no se eliminará, pero quedará marcado como inactivo.`}
                confirmText="Desactivar"
                danger
            />
        </div>
    );
}
