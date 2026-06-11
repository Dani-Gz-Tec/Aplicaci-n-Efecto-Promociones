import React, { useState, useEffect } from 'react';
import { ColumnMapping } from '../../types';
import { autoDetectMapping } from '../../lib/data-processor';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { AlertCircle, HelpCircle, Columns, Settings, ArrowRight, Play, Database } from 'lucide-react';

interface ColumnMapperProps {
  headers: string[];
  sampleRows: any[];
  onMappingComplete: (mapping: ColumnMapping, options: { globalElasticity: number; defaultMarginPct: number; optionalDateCol: string; forceMathematicalPromos: boolean }) => void;
  onCancel: () => void;
}

export function ColumnMapper({ headers, sampleRows, onMappingComplete, onCancel }: ColumnMapperProps) {
  const [mapping, setMapping] = useState<ColumnMapping>({
    sku: '',
    nombre_producto: '',
    departamento: '',
    unidades_base: '',
    ingreso_base: '',
    costo_unitario: '',
    elasticidad: '',
    fecha: '',
    promo: ''
  });

  const [globalElasticity, setGlobalElasticity] = useState<number>(-1.5);
  const [defaultMarginPct, setDefaultMarginPct] = useState<number>(0.30);
  const [forceMathematicalPromos, setForceMathematicalPromos] = useState<boolean>(true);
  const [errors, setErrors] = useState<string[]>([]);

  // Auto-detect mappings when component loads
  useEffect(() => {
    if (headers && headers.length > 0) {
      const detected = autoDetectMapping(headers);
      setMapping(detected);
    }
  }, [headers]);

  const handleFieldChange = (field: keyof ColumnMapping, value: string) => {
    setMapping(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleValidateAndSubmit = () => {
    const newErrors: string[] = [];
    
    // Validar requeridos
    if (!mapping.sku) newErrors.push("Se requiere asignar la columna para SKU / ID de Producto.");
    if (!mapping.unidades_base) newErrors.push("Se requiere asignar la columna para Unidades Vendidas / Cantidad.");
    if (!mapping.ingreso_base) newErrors.push("Se requiere asignar la columna para Ingresos / Ventas Netas.");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    onMappingComplete(mapping, {
      globalElasticity,
      defaultMarginPct,
      optionalDateCol: mapping.fecha,
      forceMathematicalPromos
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* EXPLANATORY HEADER */}
      <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
        <div className="bg-primary/10 rounded-2xl w-14 h-14 flex items-center justify-center shrink-0 border border-primary/20 text-primary">
          <Columns size={28} />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">FASE 2: MAPEO Y NORMALIZACIÓN DE CSV</h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Sube tu archivo Excel o CSV. El sistema detecta automáticamente las columnas y las adapta para el análisis.
            <strong> No es necesario modificar tu archivo original.</strong>
          </p>
          <div className="mt-3 pt-3 border-t border-border/40 text-[11px] text-muted-foreground/90 max-w-2xl">
            <span className="font-bold text-foreground block mb-1">¿Qué hace esta fase?</span>
            Convierte tu archivo en un formato estándar para poder analizar: <strong className="text-foreground">ventas, precios, rentabilidad</strong> y <strong className="text-foreground">comportamiento de clientes</strong>.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FIELDS MAPPER FORUM */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" /> INFORMACIÓN NECESARIA
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Asigna las columnas correspondientes en tu archivo CSV para identificar de forma única tus productos y ventas principales.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* REQUIRED FIELDS SECTION */}
              <div className="border-b border-border pb-4 space-y-3.5">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">INFORMACIÓN NECESARIA</h3>
                
                {/* SKU */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-xs font-bold block mb-1">Producto *</label>
                    <p className="text-[10px] text-muted-foreground">Identifica cada artículo de forma única en el sistema.</p>
                  </div>
                  <select 
                    className="bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none"
                    value={mapping.sku}
                    onChange={(e) => handleFieldChange('sku', e.target.value)}
                  >
                    <option value="">-- Seleccionar --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* UNIDADES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-xs font-bold block mb-1">Unidades vendidas *</label>
                    <p className="text-[10px] text-muted-foreground">Cantidad de productos vendidos en cada registro.</p>
                  </div>
                  <select 
                    className="bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none"
                    value={mapping.unidades_base}
                    onChange={(e) => handleFieldChange('unidades_base', e.target.value)}
                  >
                    <option value="">-- Seleccionar --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* REVENUE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-xs font-bold block mb-1">Ingresos totales *</label>
                    <p className="text-[10px] text-muted-foreground">Monto total generado por las ventas.</p>
                  </div>
                  <select 
                    className="bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none"
                    value={mapping.ingreso_base}
                    onChange={(e) => handleFieldChange('ingreso_base', e.target.value)}
                  >
                    <option value="">-- Seleccionar --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              {/* DEMAND METRICS & ATTRIBUTES */}
              <div className="space-y-3.5 pt-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">INFORMACIÓN OPCIONAL (MEJORA EL ANÁLISIS)</h3>
                
                {/* NOMBRE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-xs font-medium block mb-1">Nombre del producto</label>
                    <p className="text-[10px] text-muted-foreground">Permite ver el nombre en lugar de códigos.</p>
                  </div>
                  <select 
                    className="bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none"
                    value={mapping.nombre_producto}
                    onChange={(e) => handleFieldChange('nombre_producto', e.target.value)}
                  >
                    <option value="">-- Usar código SKU como nombre --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* DEPARTAMENTO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-xs font-medium block mb-1">Categoría del producto</label>
                    <p className="text-[10px] text-muted-foreground">Permite agrupar productos por familia, tipo o departamento.</p>
                  </div>
                  <select 
                    className="bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none"
                    value={mapping.departamento}
                    onChange={(e) => handleFieldChange('departamento', e.target.value)}
                  >
                    <option value="">-- Fijar categoría en 'General' --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* TIENDA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-xs font-medium block mb-1">Tienda</label>
                    <p className="text-[10px] text-muted-foreground">Permite analizar diferencias entre sucursales.</p>
                  </div>
                  <select 
                    className="bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none"
                    value={mapping.tienda || ''}
                    onChange={(e) => handleFieldChange('tienda', e.target.value)}
                  >
                    <option value="">-- Consolidar como general --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* MARCA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-xs font-medium block mb-1">Marca</label>
                    <p className="text-[10px] text-muted-foreground">Permite comparar el desempeño entre marcas.</p>
                  </div>
                  <select 
                    className="bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none"
                    value={mapping.marca || ''}
                    onChange={(e) => handleFieldChange('marca', e.target.value)}
                  >
                    <option value="">-- Sin aislar marca --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* TIPO DE MARCA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-xs font-medium block mb-1">Tipo de marca</label>
                    <p className="text-[10px] text-muted-foreground">Ejemplo: propia, exclusiva o comercial.</p>
                  </div>
                  <select 
                    className="bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none"
                    value={mapping.tipo_marca || ''}
                    onChange={(e) => handleFieldChange('tipo_marca', e.target.value)}
                  >
                    <option value="">-- Sin aislar tipología --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* SUBDEPARTAMENTO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-xs font-medium block mb-1">Subdepartamento (Nivel 2)</label>
                    <p className="text-[10px] text-muted-foreground">Opcional para desglose adicional.</p>
                  </div>
                  <select 
                    className="bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none"
                    value={mapping.subdepartamento || ''}
                    onChange={(e) => handleFieldChange('subdepartamento', e.target.value)}
                  >
                    <option value="">-- Sin nivel jerárquico 2 --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* CLASE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-xs font-medium block mb-1">Clase / Familia (Nivel 3)</label>
                    <p className="text-[10px] text-muted-foreground">Opcional para desglose detallado.</p>
                  </div>
                  <select 
                    className="bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none"
                    value={mapping.clase || ''}
                    onChange={(e) => handleFieldChange('clase', e.target.value)}
                  >
                    <option value="">-- Sin nivel jerárquico 3 --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              {/* ADVANCED FIELDS SECTION */}
              <div className="space-y-3.5 pt-4 border-t border-border/40">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">INFORMACIÓN AVANZADA DEL MODELO</h3>

                {/* COSTO UNITARIO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-xs font-medium block mb-1">Costo del producto</label>
                    <p className="text-[10px] text-muted-foreground">Permite calcular utilidades reales. Si no está disponible, el sistema lo estima automáticamente.</p>
                  </div>
                  <select 
                    className="bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none"
                    value={mapping.costo_unitario}
                    onChange={(e) => handleFieldChange('costo_unitario', e.target.value)}
                  >
                    <option value="">-- Calcular vía Margen Teórico por Defecto --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* ELASTICIDAD */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-xs font-medium block mb-1">Sensibilidad al precio</label>
                    <p className="text-[10px] text-muted-foreground">Indica qué tanto cambian las ventas cuando cambia el precio. Si no está disponible, el sistema usa un valor promedio.</p>
                  </div>
                  <select 
                    className="bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none"
                    value={mapping.elasticidad}
                    onChange={(e) => handleFieldChange('elasticidad', e.target.value)}
                  >
                    <option value="">-- Heredar de la Elasticidad Global Asumida --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* DATE COLUMN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-xs font-medium block mb-1">Fecha de venta</label>
                    <p className="text-[10px] text-muted-foreground">Permite analizar el comportamiento de los productos a lo largo del tiempo.</p>
                  </div>
                  <select 
                    className="bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none"
                    value={mapping.fecha}
                    onChange={(e) => handleFieldChange('fecha', e.target.value)}
                  >
                    <option value="">-- No mapear serie histórica temporal (Hereda global) --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* PROMOTION COLUMN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-xs font-medium block mb-1">Promociones</label>
                    <p className="text-[10px] text-muted-foreground">Indica si el producto estuvo en descuento o campaña. Si no está disponible, el sistema lo infiere automáticamente.</p>
                  </div>
                  <div className="space-y-3">
                    <select 
                      className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none"
                      value={mapping.promo}
                      onChange={(e) => handleFieldChange('promo', e.target.value)}
                    >
                      <option value="">-- Autodetectar promociones matemáticamente (85% mediana) --</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>

                    {mapping.promo && (
                      <label className="flex items-start gap-2 cursor-pointer mt-2 bg-secondary/30 p-2 border border-border rounded-md">
                        <input 
                          type="checkbox" 
                          className="mt-0.5 accent-brand-gold"
                          checked={forceMathematicalPromos}
                          onChange={(e) => setForceMathematicalPromos(e.target.checked)}
                        />
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-semibold block text-foreground leading-tight">Apoyarse también de autolocalización (-15%)</span>
                          <span className="text-[9px] text-muted-foreground leading-tight block">Si en tus datos de promoción faltan algunas fechas, forzará marcar como promoción los días que el precio bajó significativamente.</span>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* REAL TIME SAMPLE DATA VISUAL PREVIEW TABLE */}
          {sampleRows && sampleRows.length > 0 && (
            <Card className="bg-card border-border shadow-sm overflow-hidden">
              <div className="bg-secondary/20 px-5 py-3 border-b border-border flex justify-between items-center">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">VISTA PREVIA DEL ARCHIVO</h4>
                <span className="text-[10px] bg-secondary px-2 py-0.5 rounded font-mono text-muted-foreground">Se muestran algunas filas del archivo para validar que el mapeo sea correcto antes de continuar.</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-slate-400 font-bold uppercase">
                      {headers.slice(0, 7).map((h) => {
                        const isMapped = Object.values(mapping).includes(h);
                        return (
                          <th key={h} className={`px-4 py-2 border-r border-border/50 ${isMapped ? 'text-primary bg-primary/5' : ''}`}>
                            <span className="block max-w-[120px] truncate" title={h}>{h}</span>
                          </th>
                        );
                      })}
                      {headers.length > 7 && <th className="px-4 py-2 text-slate-500 font-normal">+{headers.length - 7} más</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {sampleRows.slice(0, 3).map((row, i) => (
                      <tr key={i} className="border-b border-border hover:bg-secondary/20">
                        {headers.slice(0, 7).map((h) => {
                          const isMapped = Object.values(mapping).includes(h);
                          return (
                            <td key={h} className={`px-4 py-2 font-mono border-r border-border/50 ${isMapped ? 'bg-primary/5 font-semibold text-foreground' : 'text-muted-foreground opacity-70'}`}>
                              <span className="block max-w-[120px] truncate">{row[h] !== undefined ? String(row[h]) : '-'}</span>
                            </td>
                          );
                        })}
                        {headers.length > 7 && <td className="px-4 py-2 text-muted-foreground">...</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* SIDEBAR FOR PARAMETERS & FALLBACKS */}
        <div className="space-y-6">
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Settings className="w-4 h-4 text-brand-gold" /> PARÁMETROS POR DEFECTO
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Si tu archivo no incluye información de costos o sensibilidad al precio, el sistema utilizará estos valores como base para la simulación.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* ELASTICIDAD GLOBAL SLIDER */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-foreground">Sensibilidad al precio (Elasticidad global)</span>
                  <span className="font-mono text-xs text-foreground font-semibold bg-secondary px-1.5 py-0.5 rounded">{globalElasticity.toFixed(2)}</span>
                </div>
                <input 
                  type="range"
                  min="-3.5"
                  max="-0.2"
                  step="0.05"
                  className="w-full accent-brand-gold bg-secondary rounded-lg h-1.5 cursor-pointer"
                  value={globalElasticity}
                  onChange={(e) => setGlobalElasticity(parseFloat(e.target.value))}
                />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Indica qué tanto cambian las ventas cuando cambia el precio. Por ejemplo, un valor de <strong className="text-foreground">-1.50</strong> significa que si el precio sube 10%, las ventas bajan aproximadamente 15%.
                </p>
              </div>

              {/* DEFAULT PROFT MARGIN SLIDER */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-foreground">Margen estimado</span>
                  <span className="font-mono text-xs text-foreground font-semibold bg-secondary px-1.5 py-0.5 rounded">{(defaultMarginPct * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range"
                  min="0.05"
                  max="0.85"
                  step="0.05"
                  className="w-full accent-brand-gold bg-secondary rounded-lg h-1.5 cursor-pointer"
                  value={defaultMarginPct}
                  onChange={(e) => setDefaultMarginPct(parseFloat(e.target.value))}
                />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Se usa para calcular costos cuando no están disponibles en el archivo. Un margen de <strong className="text-foreground">30%</strong> significa que el sistema asume que el costo del producto representa aproximadamente el 70% de su precio de venta.
                </p>
              </div>

            </CardContent>
          </Card>

          {/* ERRORS WARNING */}
          {errors.length > 0 && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl space-y-2 text-destructive">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} />
                <span className="text-xs font-bold">Errores de mapeo</span>
              </div>
              <ul className="list-disc list-inside text-[10px] space-y-1">
                {errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          {/* PROCEED CONTROL BUTTONS */}
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleValidateAndSubmit}
              className="w-full py-5 text-sm font-bold tracking-wider flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-primary-foreground shadow-sm hover:ring-2 hover:ring-brand-gold/20 cursor-pointer"
            >
              Procesar información y continuar <Play size={14} className="fill-current" />
            </Button>
            <Button 
              type="button"
              variant="outline" 
              onClick={onCancel}
              className="w-full text-xs font-medium border-border"
            >
              Cancelar carga
            </Button>
          </div>

        </div>

      </div>

    </div>
  );
}
