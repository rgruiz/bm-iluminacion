import { useState, useEffect, useCallback } from 'react';
import {
    getPedidos, createPedido, updatePedido, deletePedido, reactivarPedido,
    getClientesAll, getEmpresa, formatCurrency, formatDate, estadoLabels
} from '../utils/api';
import { Modal, ConfirmModal, Pagination, Loading, useToast } from '../components/Shared';

const emptyItem = { descripcion: '', cantidad: 1, precio_unitario: 0, subtotal: 0 };

export default function Pedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroActivo, setFiltroActivo] = useState('true');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [viewing, setViewing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [form, setForm] = useState({ cliente_id: '', fecha_pedido: '', fecha_entrega: '', estado: 'pendiente', items: [{ ...emptyItem }], notas: '' });
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    const loadPedidos = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };
            if (search) params.search = search;
            if (filtroEstado !== 'todos') params.estado = filtroEstado;
            if (filtroActivo !== '') params.activo = filtroActivo;
            if (fechaDesde) params.fecha_desde = fechaDesde;
            if (fechaHasta) params.fecha_hasta = fechaHasta;
            const data = await getPedidos(params);
            setPedidos(data.data);
            setPagination(data.pagination);
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [page, search, filtroEstado, filtroActivo, fechaDesde, fechaHasta, toast]);

    useEffect(() => { loadPedidos(); }, [loadPedidos]);
    useEffect(() => {
        getClientesAll().then(setClientes).catch(() => { });
    }, []);
    useEffect(() => { setPage(1); }, [search, filtroEstado, filtroActivo, fechaDesde, fechaHasta]);

    const today = () => new Date().toISOString().split('T')[0];

    const openNew = () => {
        setEditing(null);
        setForm({ cliente_id: '', fecha_pedido: today(), fecha_entrega: '', estado: 'pendiente', items: [{ ...emptyItem }], notas: '' });
        setModalOpen(true);
    };

    const openEdit = (p) => {
        setEditing(p);
        setForm({
            cliente_id: p.cliente_id?._id || p.cliente_id || '',
            fecha_pedido: p.fecha_pedido ? p.fecha_pedido.split('T')[0] : '',
            fecha_entrega: p.fecha_entrega ? p.fecha_entrega.split('T')[0] : '',
            estado: p.estado,
            items: p.items.map(i => ({
                descripcion: i.descripcion,
                cantidad: i.cantidad,
                precio_unitario: i.precio_unitario,
                subtotal: i.subtotal
            })),
            notas: p.notas || ''
        });
        setModalOpen(true);
    };

    const openDetail = (p) => { setViewing(p); setDetailOpen(true); };

    // Item management
    const updateItem = (index, field, value) => {
        setForm(prev => {
            const items = [...prev.items];
            items[index] = { ...items[index], [field]: value };
            if (field === 'cantidad' || field === 'precio_unitario') {
                const cant = field === 'cantidad' ? Number(value) : items[index].cantidad;
                const precio = field === 'precio_unitario' ? Number(value) : items[index].precio_unitario;
                items[index].subtotal = Math.round(cant * precio * 100) / 100;
            }
            return { ...prev, items };
        });
    };

    const addItem = () => setForm(prev => ({ ...prev, items: [...prev.items, { ...emptyItem }] }));
    const removeItem = (index) => setForm(prev => ({
        ...prev, items: prev.items.filter((_, i) => i !== index)
    }));

    const calcTotal = () => form.items.reduce((s, i) => s + (i.subtotal || 0), 0);

    const handleSave = async () => {
        if (!form.cliente_id) { toast('Seleccione un cliente', 'error'); return; }
        if (form.items.length === 0 || !form.items[0].descripcion) {
            toast('Agregue al menos un ítem', 'error'); return;
        }
        setSaving(true);
        try {
            if (editing) {
                await updatePedido(editing._id, form);
                toast('Pedido actualizado');
            } else {
                await createPedido(form);
                toast('Pedido creado');
            }
            setModalOpen(false);
            loadPedidos();
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deletePedido(deleting._id);
            toast('Pedido desactivado');
            setConfirmOpen(false);
            setDeleting(null);
            loadPedidos();
        } catch (err) {
            toast(err.message, 'error');
        }
    };

    const handleReactivar = async (p) => {
        try {
            await reactivarPedido(p._id);
            toast('Pedido reactivado');
            loadPedidos();
        } catch (err) {
            toast(err.message, 'error');
        }
    };

    const handlePrint = async (pedido) => {
        let empresa = {};
        try { empresa = await getEmpresa(); } catch (e) { /* ignore */ }

        const itemsRows = pedido.items.map(item =>
            `<tr>
                <td>${item.descripcion}</td>
                <td style="text-align:center">${item.cantidad}</td>
                <td style="text-align:right">${formatCurrency(item.precio_unitario)}</td>
                <td style="text-align:right;font-weight:600">${formatCurrency(item.subtotal)}</td>
            </tr>`
        ).join('');

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Pedido ${pedido.folio}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 2rem; font-size: 13px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #d4a017; padding-bottom: 1rem; margin-bottom: 1.5rem; }
  .header h1 { font-size: 1.5rem; color: #b8860b; }
  .header .empresa-info { font-size: 0.8rem; color: #555; line-height: 1.5; }
  .header .folio { text-align: right; }
  .header .folio h2 { font-size: 1.2rem; color: #333; }
  .header .folio p { font-size: 0.85rem; color: #666; }
  .section { margin-bottom: 1.5rem; }
  .section h3 { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 0.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.3rem; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }
  .info-item label { display: block; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; color: #999; }
  .info-item span { font-size: 0.9rem; color: #222; }
  table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
  thead th { padding: 0.6rem 0.75rem; text-align: left; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #666; background: #f5f5f0; border-bottom: 2px solid #ddd; }
  tbody td { padding: 0.55rem 0.75rem; border-bottom: 1px solid #eee; font-size: 0.85rem; }
  tbody tr:last-child td { border-bottom: none; }
  .total-section { text-align: right; margin-top: 1rem; padding-top: 0.75rem; border-top: 2px solid #d4a017; }
  .total-section .total { font-size: 1.2rem; font-weight: 700; color: #b8860b; }
  .total-section .total-label { font-size: 0.85rem; color: #666; margin-right: 1rem; }
  .notas { margin-top: 1.5rem; padding: 0.75rem; background: #fafaf5; border: 1px solid #eee; border-radius: 4px; }
  .notas h3 { font-size: 0.75rem; color: #888; margin-bottom: 0.3rem; text-transform: uppercase; border: none; }
  .notas p { font-size: 0.85rem; color: #444; line-height: 1.5; }
  .footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd; text-align: center; font-size: 0.75rem; color: #aaa; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>${empresa.razon_social || 'BM Iluminación'}</h1>
      <div class="empresa-info">
        ${empresa.cuit ? `CUIT: ${empresa.cuit}<br>` : ''}
        ${empresa.domicilio_fiscal ? `${empresa.domicilio_fiscal}<br>` : ''}
        ${empresa.localidad ? `${empresa.localidad}, ${empresa.provincia || ''}` : ''}
        ${empresa.telefono ? `<br>Tel: ${empresa.telefono}` : ''}
        ${empresa.email ? ` — ${empresa.email}` : ''}
      </div>
    </div>
    <div class="folio">
      <h2>${pedido.folio}</h2>
      <p>Fecha: ${formatDate(pedido.fecha_pedido)}</p>
      <p>Estado: ${estadoLabels[pedido.estado]}</p>
    </div>
  </div>

  <div class="section">
    <h3>Datos del Cliente</h3>
    <div class="info-grid">
      <div class="info-item"><label>Cliente</label><span>${pedido.cliente_id?.razon_social || '—'}</span></div>
      <div class="info-item"><label>CUIT</label><span>${pedido.cliente_id?.cuit || '—'}</span></div>
      <div class="info-item"><label>Entrega Estimada</label><span>${formatDate(pedido.fecha_entrega)}</span></div>
    </div>
  </div>

  <div class="section">
    <h3>Ítems del Pedido</h3>
    <table>
      <thead><tr><th>Descripción</th><th style="text-align:center">Cant.</th><th style="text-align:right">Precio Unit.</th><th style="text-align:right">Subtotal</th></tr></thead>
      <tbody>${itemsRows}</tbody>
    </table>
    <div class="total-section">
      <span class="total-label">Total:</span>
      <span class="total">${formatCurrency(pedido.total)}</span>
    </div>
  </div>

  ${pedido.notas ? `<div class="notas"><h3>Notas</h3><p>${pedido.notas}</p></div>` : ''}

  <div class="footer">Documento generado el ${new Date().toLocaleDateString('es-AR')} — ${empresa.razon_social || 'BM Iluminación'}</div>
</body>
</html>`;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => { printWindow.print(); };
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2>Pedidos</h2>
                    <p>Gestión de pedidos de BM Iluminación</p>
                </div>
                <button className="btn btn-primary" onClick={openNew}>+ Nuevo Pedido</button>
            </div>

            <div className="table-container">
                <div className="table-toolbar">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Buscar por folio..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                            <option value="todos">Todos los estados</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="en_produccion">En Producción</option>
                            <option value="listo">Listo</option>
                            <option value="entregado">Entregado</option>
                            <option value="cobrado">Cobrado</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                        <select value={filtroActivo} onChange={e => setFiltroActivo(e.target.value)}>
                            <option value="true">Activos</option>
                            <option value="false">Inactivos</option>
                            <option value="">Todos</option>
                        </select>
                        <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} title="Desde" />
                        <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} title="Hasta" />
                    </div>
                </div>

                {loading ? <Loading /> : (
                    <>
                        <div className="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Folio</th>
                                        <th>Cliente</th>
                                        <th>Estado</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Fecha Pedido</th>
                                        <th>Entrega</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pedidos.length === 0 ? (
                                        <tr>
                                            <td colSpan="8">
                                                <div className="table-empty">
                                                    <div className="empty-icon">📦</div>
                                                    <p>No se encontraron pedidos</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        pedidos.map(p => (
                                            <tr key={p._id}>
                                                <td>
                                                    <span className="primary-text" style={{ cursor: 'pointer' }} onClick={() => openDetail(p)}>
                                                        {p.folio}
                                                    </span>
                                                </td>
                                                <td>{p.cliente_id?.razon_social || '—'}</td>
                                                <td><span className={`badge ${p.estado}`}>{estadoLabels[p.estado]}</span></td>
                                                <td>{p.items?.length || 0}</td>
                                                <td><span className="primary-text">{formatCurrency(p.total)}</span></td>
                                                <td>{formatDate(p.fecha_pedido)}</td>
                                                <td>{formatDate(p.fecha_entrega)}</td>
                                                <td>
                                                    <div className="table-actions">
                                                        <button className="btn btn-ghost btn-sm" title="Ver" onClick={() => openDetail(p)}>👁</button>
                                                        <button className="btn btn-ghost btn-sm" title="Editar" onClick={() => openEdit(p)}>✏️</button>
                                                        {p.activo ? (
                                                            <button className="btn btn-ghost btn-sm" title="Desactivar" onClick={() => { setDeleting(p); setConfirmOpen(true); }}>🗑</button>
                                                        ) : (
                                                            <button className="btn btn-ghost btn-sm" title="Reactivar" onClick={() => handleReactivar(p)}>♻️</button>
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
                title={editing ? `Editar Pedido ${editing.folio}` : 'Nuevo Pedido'}
                wide
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
                        <label>Cliente *</label>
                        <select value={form.cliente_id} onChange={e => setForm(p => ({ ...p, cliente_id: e.target.value }))}>
                            <option value="">Seleccionar cliente...</option>
                            {clientes.map(c => (
                                <option key={c._id} value={c._id}>{c.razon_social} {c.cuit ? `(${c.cuit})` : ''}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Estado</label>
                        <select value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}>
                            {Object.entries(estadoLabels).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Fecha Pedido</label>
                        <input type="date" value={form.fecha_pedido} onChange={e => setForm(p => ({ ...p, fecha_pedido: e.target.value }))} />
                    </div>
                    <div className="form-group">
                        <label>Fecha Entrega Estimada</label>
                        <input type="date" value={form.fecha_entrega} onChange={e => setForm(p => ({ ...p, fecha_entrega: e.target.value }))} />
                    </div>
                </div>

                <div className="form-group">
                    <label>Ítems del Pedido</label>
                    <div className="items-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Descripción</th>
                                    <th style={{ width: '90px' }}>Cant.</th>
                                    <th style={{ width: '130px' }}>Precio Unit.</th>
                                    <th style={{ width: '120px' }}>Subtotal</th>
                                    <th style={{ width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {form.items.map((item, i) => (
                                    <tr key={i}>
                                        <td>
                                            <input
                                                value={item.descripcion}
                                                onChange={e => updateItem(i, 'descripcion', e.target.value)}
                                                placeholder="Descripción del producto"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.cantidad}
                                                onChange={e => updateItem(i, 'cantidad', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.precio_unitario}
                                                onChange={e => updateItem(i, 'precio_unitario', e.target.value)}
                                            />
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 500 }}>
                                            {formatCurrency(item.subtotal || 0)}
                                        </td>
                                        <td>
                                            {form.items.length > 1 && (
                                                <button className="btn btn-ghost btn-sm" onClick={() => removeItem(i)}>✕</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ padding: '0.5rem 1rem' }}>
                            <button className="btn btn-secondary btn-sm" onClick={addItem}>+ Agregar Ítem</button>
                        </div>
                        <div className="items-total">
                            <div className="total-row grand-total">
                                <span>Total:</span>
                                <span>{formatCurrency(calcTotal())}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>Notas</label>
                    <textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} placeholder="Observaciones del pedido..." />
                </div>
            </Modal>

            {/* Detail Modal */}
            <Modal
                isOpen={detailOpen}
                onClose={() => setDetailOpen(false)}
                title={viewing ? `Pedido ${viewing.folio}` : 'Detalle'}
                wide
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setDetailOpen(false)}>Cerrar</button>
                        <button className="btn btn-secondary" onClick={() => handlePrint(viewing)}>🖨 Imprimir / PDF</button>
                        <button className="btn btn-primary" onClick={() => { setDetailOpen(false); openEdit(viewing); }}>Editar</button>
                    </>
                }
            >
                {viewing && (
                    <>
                        <div className="detail-grid" style={{ marginBottom: '1.5rem' }}>
                            <div className="detail-item"><label>Folio</label><span>{viewing.folio}</span></div>
                            <div className="detail-item"><label>Cliente</label><span>{viewing.cliente_id?.razon_social || '—'}</span></div>
                            <div className="detail-item"><label>Estado</label><span className={`badge ${viewing.estado}`}>{estadoLabels[viewing.estado]}</span></div>
                            <div className="detail-item"><label>Fecha Pedido</label><span>{formatDate(viewing.fecha_pedido)}</span></div>
                            <div className="detail-item"><label>Fecha Entrega</label><span>{formatDate(viewing.fecha_entrega)}</span></div>
                        </div>
                        <div className="items-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Descripción</th>
                                        <th>Cantidad</th>
                                        <th>Precio Unit.</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewing.items.map((item, i) => (
                                        <tr key={i}>
                                            <td>{item.descripcion}</td>
                                            <td>{item.cantidad}</td>
                                            <td>{formatCurrency(item.precio_unitario)}</td>
                                            <td style={{ fontWeight: 500 }}>{formatCurrency(item.subtotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="items-total">
                                <div className="total-row grand-total"><span>Total:</span><span>{formatCurrency(viewing.total)}</span></div>
                            </div>
                        </div>
                        {viewing.notas && (
                            <div style={{ marginTop: '1rem' }}>
                                <label style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Notas</label>
                                <p style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>{viewing.notas}</p>
                            </div>
                        )}
                    </>
                )}
            </Modal>

            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => { setConfirmOpen(false); setDeleting(null); }}
                onConfirm={handleDelete}
                title="Desactivar Pedido"
                message={`¿Está seguro que desea desactivar el pedido "${deleting?.folio}"?`}
                confirmText="Desactivar"
                danger
            />
        </div>
    );
}
