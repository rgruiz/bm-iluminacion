import { useState, useEffect } from 'react';
import { getEmpresa, updateEmpresa } from '../utils/api';
import { Loading, useToast } from '../components/Shared';

const fields = [
    { key: 'razon_social', label: 'Razón Social', required: true },
    { key: 'cuit', label: 'CUIT', placeholder: 'XX-XXXXXXXX-X' },
    { key: 'condicion_iva', label: 'Condición ante IVA', type: 'select', options: ['', 'Responsable Inscripto', 'Monotributista', 'Exento', 'Consumidor Final'] },
    { key: 'contacto', label: 'Persona de Contacto' },
    { key: 'email', label: 'Email', inputType: 'email' },
    { key: 'telefono', label: 'Teléfono', placeholder: '011-XXXX-XXXX' },
];

const addressFields = [
    { key: 'domicilio_fiscal', label: 'Domicilio Fiscal', full: true },
    { key: 'localidad', label: 'Localidad' },
    { key: 'provincia', label: 'Provincia' },
    { key: 'codigo_postal', label: 'Código Postal' },
];

export default function Empresa() {
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    useEffect(() => {
        loadEmpresa();
    }, []);

    const loadEmpresa = async () => {
        try {
            const data = await getEmpresa();
            setForm({
                razon_social: data.razon_social || '',
                cuit: data.cuit || '',
                condicion_iva: data.condicion_iva || '',
                domicilio_fiscal: data.domicilio_fiscal || '',
                localidad: data.localidad || '',
                provincia: data.provincia || 'Buenos Aires',
                codigo_postal: data.codigo_postal || '',
                email: data.email || '',
                telefono: data.telefono || '',
                contacto: data.contacto || '',
                notas: data.notas || ''
            });
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!form.razon_social.trim()) {
            toast('La razón social es obligatoria', 'error');
            return;
        }
        setSaving(true);
        try {
            await updateEmpresa(form);
            toast('Datos de la empresa actualizados');
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    if (loading) return <Loading />;
    if (!form) return <p>Error al cargar datos de la empresa</p>;

    return (
        <div>
            <div className="page-header">
                <h2>Datos de la Empresa</h2>
                <p>Información fiscal y de contacto de BM Iluminación</p>
            </div>

            <div className="card" style={{ maxWidth: '800px' }}>
                <div className="form-grid">
                    {fields.map(f => (
                        <div className="form-group" key={f.key}>
                            <label>{f.label} {f.required ? '*' : ''}</label>
                            {f.type === 'select' ? (
                                <select value={form[f.key]} onChange={e => update(f.key, e.target.value)}>
                                    <option value="">Seleccionar...</option>
                                    {f.options.filter(Boolean).map(o => (
                                        <option key={o} value={o}>{o}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={f.inputType || 'text'}
                                    value={form[f.key]}
                                    onChange={e => update(f.key, e.target.value)}
                                    placeholder={f.placeholder || f.label}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {addressFields.map(f => (
                    f.full ? (
                        <div className="form-group" key={f.key}>
                            <label>{f.label}</label>
                            <input value={form[f.key]} onChange={e => update(f.key, e.target.value)} placeholder={f.label} />
                        </div>
                    ) : null
                ))}

                <div className="form-grid">
                    {addressFields.filter(f => !f.full).map(f => (
                        <div className="form-group" key={f.key}>
                            <label>{f.label}</label>
                            <input value={form[f.key]} onChange={e => update(f.key, e.target.value)} placeholder={f.label} />
                        </div>
                    ))}
                </div>

                <div className="form-group">
                    <label>Notas</label>
                    <textarea value={form.notas} onChange={e => update('notas', e.target.value)} placeholder="Notas internas..." />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
}
