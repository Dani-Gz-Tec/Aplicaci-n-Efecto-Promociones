// Definición del Producto a procesar
export interface ProductData {
  sku: string;
  departamento: string;
  nombre_producto: string;
  precio_base: number;    // Precio promedio ponderado (Venta Total / Unidades Totales)
  unidades_base: number;  // Ventas totales históricas (Volumen)
  costo_unitario: number; // Costo por unidad
  elasticidad: number;    // El "Beta" de la demanda (calculado o heredado)
  elasticidad_raw?: number; // El "Beta" crudo antes de shrinkage (Bayesian smoothing)
  mape?: number;          // Mean Absolute Percentage Error (In-sample error de predicción)
  bias?: number;          // Sesgo (Over/Under estimation percentage)
  ingreso_base: number;   // = precio_base * unidades_base
  margen_base: number;    // = (precio_base - costo_unitario) * unidades_base
  
  // Nuevas Jerarquías y Segmentación
  tienda?: string;
  tiendas?: string[];
  marca?: string;
  tipo_marca?: string;
  subdepartamento?: string;
  clase?: string;
  
  // Analíticos avanzados de Regresión Lineal OLS Log-Log
  r2?: number;            // Coeficiente de determinación R² de la regresión
  coef_promo?: number;    // Coeficiente B2 de la variable dicotómica de Promoción
  origen_elasticidad: 'REGRESION_OLS' | 'CSV_DIRECTO' | 'PARAMETRO_GLOBAL';
  cant_puntos_tiempo?: number; // Total de días/períodos con transacciones para este SKU
  
  // Clasificación Estratégica
  cluster: 'ALTO VOLUMEN (A)' | 'VOLUMEN INTERMEDIO (B)' | 'BAJO VOLUMEN / COLA (C)';
  
  // Optimizador de Escenario Ideal
  precio_optimo_pct: number;  // Variación porcentual que maximiza el margen absoluto
  precio_optimo_margen: number; // Margen bruto absoluto máximo proyectado
  costo_original_disponible?: boolean; // True si el costo unitario proviene del archivo mapeado
  ingreso_previo?: number;
  costo_unitario_previo?: number;
  unidades_previas?: number;
  costo_previo?: number;
}

// Clasificación Estratégica Automática
export type Recommendation = 'SUBIR PRECIO' | 'BAJAR PRECIO / PROMOVER' | 'MANTENER PRECIO' | 'NO RECOMENDAR';

// Modelo individual del resultado de un "Escenario" de precio
export interface ScenarioResult {
  pct_cambio: number;          // Ejemplo: -0.10, +0.05
  precio_nuevo: number;
  unidades_simuladas: number;
  ingreso_simulado: number;
  margen_simulado: number;
  cambio_ingreso_pct: number;
  cambio_margen_pct: number;
  is_cap_hit?: boolean;        // Indica si este escenario fue recortado por el límite de saturación
}

// Configuración de Mapeo Dinámico de Columnas
export interface ColumnMapping {
  sku: string;
  nombre_producto: string;
  departamento: string;
  unidades_base: string;
  ingreso_base: string;
  costo_unitario: string;
  elasticidad: string;
  fecha: string;
  promo: string;
  tienda: string;
  marca: string;
  tipo_marca: string;
  subdepartamento: string;
  clase: string;
}

// Histograma/Serie temporal de elasticidad (Time Segment Viewer)
export interface TimeElasticityPoint {
  segmento: string; // "Semanal", "Mensual", "Semestral", "Ventana 30d"
  fechaInicio: string;
  elasticidad: number;
  r2: number;
  puntos: number;
  promedioUnidades: number;
}

// Inferencia Causal: Tratamientos y Efectos
export interface CausalInferenceResult {
  averageTreatmentEffect: number; // Incremento promedio de unidades debido a promociones (promos vs no-promos)
  promoLiftPct: number;           // Porcentaje de alza estimado
  controlAvgVolume: number;       // Promedio unidades sin promociones
  treatedAvgVolume: number;       // Promedio unidades con promociones
  causalConfidence: 'ALTA' | 'MODERADA' | 'INSIGNIFICANTE';
  marginalCostOfPromo: number;    // Estimación táctica de costo promocional asumido por retail
  netPromoROI: number;            // ROI neto del tratamiento
}

// Análisis de Riesgo & Residuos
export interface RiskAnalysisResult {
  residualStandardError: number;  // Desviación promedio de predicciones (MSE)
  pointsInConfidenceBound: number;// % de puntos que caen dentro del 90% de intervalo de confianza
  stockoutRiskRating: 'BAJO' | 'MODERADO' | 'CRÍTICO';
  stockoutProbability: number;     // % probabilidad de agotar inventario en promo
  marginErosionRiskRating: 'BAJO' | 'MODERADO' | 'CRÍTICO';
  residualAccuracyR2: number;     // R² real de calibración cruzada
}

// Macrotendencias & Estacionalidad
export interface MacrotendencyResult {
  seasonalityIndex: number;       // Variación estacional estimada (1.0 = normal)
  salesTrendDirection: 'CRECIENTE' | 'ESTABLE' | 'DECRECIENTE';
  peakMonth: string;
  valleyMonth: string;
  coefficientOfVariation: number; // Volatilidad histórica general
  movingAverage30d: number;       // Promedio móvil actual de ventas
}

// Estadísticas de Datos y Preparación (Data Prep & Features)
export interface DataPrepStats {
  parsedRows: number;
  nullRowsCleaned: number;
  outliersClipped: number;
  reconstructedPromosCount: number; // Cuántas promos se autodetectaron heurísticamente
  logPriceMean: number;
  logQtyMean: number;
}

// Comparación de Modelos: OLS vs Random Forest vs Real
export interface MLModelComparisonPoint {
  dateStr: string;
  realUnits: number;
  olsPredictedUnits: number;
  rfPredictedUnits: number;
  price: number;
  isPromo: number;
}

