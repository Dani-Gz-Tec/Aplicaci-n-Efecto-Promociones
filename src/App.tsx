import { useState, useEffect } from "react";
import { FileUploader } from "./features/upload/FileUploader";
import { ColumnMapper } from "./features/upload/ColumnMapper";
import { Dashboard } from "./features/dashboard/Dashboard";
import { BarChart3, Moon, Sun, ShieldAlert, BadgeInfo } from "lucide-react";
import { Button } from "./components/ui/button";
import { aggregateRawCSV } from "./lib/data-processor";
import { ProductData, ColumnMapping } from "./types";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Multi-step core flow state
  // UPLOAD -> MAPPER -> DASHBOARD
  const [step, setStep] = useState<'UPLOAD' | 'MAPPER' | 'DASHBOARD'>('UPLOAD');
  
  // CSV original details
  const [csvContent, setCsvContent] = useState<{ headers: string[]; rows: any[] } | null>(null);
  
  // State for parameters mapping
  const [columnMapping, setColumnMapping] = useState<ColumnMapping | null>(null);
  const [globalElasticity, setGlobalElasticity] = useState<number>(-1.5);
  const [defaultMarginPct, setDefaultMarginPct] = useState<number>(0.30);
  const [optionalDateCol, setOptionalDateCol] = useState<string>('');
  const [forceMathematicalPromos, setForceMathematicalPromos] = useState<boolean>(true);

  // Processed and aggregated output
  const [products, setProducts] = useState<ProductData[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [stores, setStores] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [brandTypes, setBrandTypes] = useState<string[]>([]);
  const [subdepartments, setSubdepartments] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [chartDataBySku, setChartDataBySku] = useState<Record<string, any[]>>({});
  const [isCostoTotalDetected, setIsCostoTotalDetected] = useState<boolean>(false);

  useEffect(() => {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // File was parsed, переход в ColumnMapper step
  const handleFileSelected = (headers: string[], rows: any[]) => {
    setCsvContent({ headers, rows });
    setStep('MAPPER');
  };

  // Run the aggregation logic
  const handleMappingComplete = (
    mapping: ColumnMapping, 
    options: { globalElasticity: number; defaultMarginPct: number; optionalDateCol: string; forceMathematicalPromos: boolean }
  ) => {
    if (!csvContent) return;
    
    setColumnMapping(mapping);
    setGlobalElasticity(options.globalElasticity);
    setDefaultMarginPct(options.defaultMarginPct);
    setOptionalDateCol(options.optionalDateCol);
    setForceMathematicalPromos(options.forceMathematicalPromos);

    const { 
      products: aggregatedProducts, 
      departments: aggregatedDepts, 
      stores: aggregatedStores,
      brands: aggregatedBrands,
      brandTypes: aggregatedBrandTypes,
      subdepartments: aggregatedSubdepartments,
      classes: aggregatedClasses,
      chartDataBySku: aggregatedChartData,
      isCostoTotalDetected: isCostoTotal
    } = aggregateRawCSV(
      csvContent.rows,
      mapping,
      options.globalElasticity,
      options.defaultMarginPct,
      options.optionalDateCol,
      options.forceMathematicalPromos
    );

    setProducts(aggregatedProducts);
    setDepartments(aggregatedDepts);
    setStores(aggregatedStores);
    setBrands(aggregatedBrands);
    setBrandTypes(aggregatedBrandTypes);
    setSubdepartments(aggregatedSubdepartments);
    setClasses(aggregatedClasses);
    setChartDataBySku(aggregatedChartData);
    setIsCostoTotalDetected(!!isCostoTotal);
    setStep('DASHBOARD');
  };

  // Re-run aggregation if global parameters are updated in real-time in the dashboard
  const handleGlobalElasticityChange = (newVal: number) => {
    setGlobalElasticity(newVal);
    if (!csvContent || !columnMapping) return;

    const { 
      products: aggregatedProducts, 
      departments: aggregatedDepts, 
      stores: aggregatedStores,
      brands: aggregatedBrands,
      brandTypes: aggregatedBrandTypes,
      subdepartments: aggregatedSubdepartments,
      classes: aggregatedClasses,
      chartDataBySku: aggregatedChartData,
      isCostoTotalDetected: isCostoTotal
    } = aggregateRawCSV(
      csvContent.rows,
      columnMapping,
      newVal,
      defaultMarginPct,
      optionalDateCol,
      forceMathematicalPromos
    );

    setProducts(aggregatedProducts);
    setDepartments(aggregatedDepts);
    setStores(aggregatedStores);
    setBrands(aggregatedBrands);
    setBrandTypes(aggregatedBrandTypes);
    setSubdepartments(aggregatedSubdepartments);
    setClasses(aggregatedClasses);
    setChartDataBySku(aggregatedChartData);
    setIsCostoTotalDetected(!!isCostoTotal);
  };

  const handleDefaultMarginPctChange = (newVal: number) => {
    setDefaultMarginPct(newVal);
    if (!csvContent || !columnMapping) return;

    const { 
      products: aggregatedProducts, 
      departments: aggregatedDepts, 
      stores: aggregatedStores,
      brands: aggregatedBrands,
      brandTypes: aggregatedBrandTypes,
      subdepartments: aggregatedSubdepartments,
      classes: aggregatedClasses,
      chartDataBySku: aggregatedChartData,
      isCostoTotalDetected: isCostoTotal
    } = aggregateRawCSV(
      csvContent.rows,
      columnMapping,
      globalElasticity,
      newVal,
      optionalDateCol,
      forceMathematicalPromos
    );

    setProducts(aggregatedProducts);
    setDepartments(aggregatedDepts);
    setStores(aggregatedStores);
    setBrands(aggregatedBrands);
    setBrandTypes(aggregatedBrandTypes);
    setSubdepartments(aggregatedSubdepartments);
    setClasses(aggregatedClasses);
    setChartDataBySku(aggregatedChartData);
    setIsCostoTotalDetected(!!isCostoTotal);
  };

  const handleReset = () => {
    setCsvContent(null);
    setColumnMapping(null);
    setProducts([]);
    setDepartments([]);
    setChartDataBySku({});
    setIsCostoTotalDetected(false);
    setStep('UPLOAD');
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 flex flex-col justify-between">
      
      {/* ENTERPRISE HEADER */}
      <header className="h-14 bg-card border-b flex items-center justify-between px-6 shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center shadow-sm">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight leading-none text-foreground flex items-center gap-1.5">
              <span>Efecto de Promociones</span>
            </h1>
            <p className="text-[9px] text-brand-gold font-bold uppercase tracking-widest leading-none mt-1">OfficeMax Executive Analytics</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-8 h-8 rounded-full border border-border bg-secondary/30" title="Alternar Modo Oscuro">
              {isDarkMode ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            </Button>
            <div className="w-8 h-8 rounded-full bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold text-xs font-extrabold shadow-sm">JD</div>
          </div>
        </div>
      </header>

      {/* CORE MULTI-STEP PIPELINE MAIN GRID CONTENT */}
      <main className="flex-1 flex flex-col overflow-y-auto p-6">
        
        {step === 'UPLOAD' && (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <FileUploader onFileSelected={handleFileSelected} />
          </div>
        )}

        {step === 'MAPPER' && csvContent && (
          <div className="flex-1 py-4">
            <ColumnMapper 
              headers={csvContent.headers}
              sampleRows={csvContent.rows}
              onMappingComplete={handleMappingComplete}
              onCancel={handleReset}
            />
          </div>
        )}

        {step === 'DASHBOARD' && products.length > 0 && (
          <div className="flex-1">
            <Dashboard 
              products={products}
              departments={departments}
              stores={stores}
              brands={brands}
              brandTypes={brandTypes}
              subdepartments={subdepartments}
              classes={classes}
              chartDataBySku={chartDataBySku}
              globalElasticity={globalElasticity}
              onGlobalElasticityChange={handleGlobalElasticityChange}
              defaultMarginPct={defaultMarginPct}
              onDefaultMarginPctChange={handleDefaultMarginPctChange}
              onReset={handleReset}
              isCostoTotalDetected={isCostoTotalDetected}
            />
          </div>
        )}

      </main>

      {/* PROPORTIONAL ENTERPRISE FOOTER */}
      <footer className="h-10 bg-card border-t px-6 flex items-center justify-between text-[10px] text-muted-foreground shrink-0 z-10">
        <div className="flex gap-6 font-semibold uppercase tracking-wider">
          <span>PIPELINE: <strong className="text-foreground">In-Memory Local Engine</strong></span>
          {step === 'DASHBOARD' && (
            <>
              <span>MAPPED SKU COUNT: <strong className="text-foreground">{products.length}</strong></span>
              <span>GLOBAL BETA: <strong className="text-foreground">{globalElasticity.toFixed(2)}</strong></span>
            </>
          )}
        </div>
        <div className="font-mono hidden sm:block">
          Executive Analytics Portal
        </div>
      </footer>
    </div>
  );
}
