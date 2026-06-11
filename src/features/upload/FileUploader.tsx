import React, { useCallback, useState } from 'react';
import { UploadCloud, AlertCircle } from 'lucide-react';
import { parseCSV } from '../../lib/data-processor';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

interface FileUploaderProps {
  onFileSelected: (headers: string[], rows: any[]) => void;
}

export function FileUploader({ onFileSelected }: FileUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      if (!file.name.endsWith('.csv')) {
        throw new Error("Formato no soportado. Por favor, cargue un archivo con extensión '.csv'");
      }
      
      const rawRows = await parseCSV(file);
      if (rawRows.length === 0) {
        throw new Error("El archivo CSV está vacío.");
      }
      
      // Extraer los encabezados del primer renglón
      const sampleRow = rawRows[0];
      const headers = Object.keys(sampleRow).filter(h => h.trim() !== "");
      
      if (headers.length === 0) {
        throw new Error("Error de codificación. No se detectaron columnas en su archivo CSV.");
      }

      onFileSelected(headers, rawRows);
    } catch (err: any) {
      setError(err.message || 'Se produjo un error al procesar el archivo CSV.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card border-border shadow-md hover:shadow-lg transition-all duration-300">
      <CardContent className="p-10 flex flex-col items-center justify-center min-h-[350px] text-center">
        {!isProcessing && !error && (
          <div 
            className={`w-full flex-col flex items-center transition-colors cursor-pointer p-6 rounded-2xl border-2 border-dashed ${isDragActive ? 'border-primary text-primary bg-primary/5' : 'border-border text-muted-foreground hover:bg-secondary/20'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <div className="w-16 h-16 rounded-3xl bg-secondary/50 dark:bg-slate-800 flex items-center justify-center mb-6 border border-border">
              <UploadCloud size={30} className={isDragActive ? 'text-primary animate-pulse' : 'text-slate-400'} />
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">Carga tu base de datos transaccional / ERP</h3>
            <p className="text-xs max-w-md mx-auto mb-6 leading-relaxed opacity-80 decoration-slate-400">
              Arrastra y suelta tu archivo <span className="font-semibold text-foreground">.CSV</span> aquí o selecciónalo desde tu computadora.<br/>
              No importa qué estructura de columnas tenga; la mapearemos libremente en el siguiente paso.
            </p>
            
            <div>
              <Button type="button" className="font-bold tracking-wide shadow-sm">
                Seleccionar Archivo
              </Button>
              <input id="file-upload" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex flex-col items-center animate-in fade-in p-6">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
            <p className="text-lg font-bold text-foreground mb-1">Analizando archivo local...</p>
            <p className="text-xs text-muted-foreground">Iniciando motor de ingestión de memoria sin envíos a servidor.</p>
          </div>
        )}

        {error && !isProcessing && (
           <div className="flex flex-col items-center text-destructive p-6 w-full max-w-md animate-in fade-in">
             <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
               <AlertCircle size={32} className="text-destructive" />
             </div>
             <p className="text-lg font-bold mb-2 text-foreground">Error al interpretar archivo</p>
             <p className="text-xs leading-relaxed opacity-95 text-muted-foreground whitespace-pre-wrap">{error}</p>
             <div className="flex gap-4 mt-8 w-full justify-center">
               <Button variant="outline" className="border-border text-foreground hover:bg-secondary/50" onClick={() => setError(null)}>
                 Reintentar
               </Button>
             </div>
           </div>
        )}
      </CardContent>
    </Card>
  );
}
