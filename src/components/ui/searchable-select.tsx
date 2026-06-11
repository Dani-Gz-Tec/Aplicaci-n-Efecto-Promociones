import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Option {
  value: string;
  label: string;
  subLabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchableSelect({ options, value, onChange, placeholder = "Seleccionar...", className }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options.slice(0, 100); 
    const lowerSearch = searchTerm.toLowerCase();
    return options.filter(opt => 
      opt.label.toLowerCase().includes(lowerSearch) || 
      opt.subLabel?.toLowerCase().includes(lowerSearch) ||
      opt.value.toLowerCase().includes(lowerSearch)
    ).slice(0, 100);
  }, [options, searchTerm]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <div 
        className="flex items-center justify-between w-full min-w-[240px] bg-card border border-border rounded-md px-3 py-2 text-sm font-medium cursor-pointer shadow-sm hover:bg-secondary/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="truncate mr-2 flex flex-col items-start pr-4">
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          {selectedOption?.subLabel && (
            <span className="text-[10px] text-muted-foreground truncate w-full text-left font-normal mt-0.5">
              {selectedOption.subLabel}
            </span>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 absolute right-3 top-1/2 -translate-y-1/2" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[280px] bg-popover border border-border rounded-md shadow-lg right-0 md:left-0 md:right-auto overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center px-3 border-b border-border bg-card">
            <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
            <input 
              type="text" 
              className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground text-popover-foreground" 
              placeholder="Buscar SKU o nombre..." 
              value={searchTerm}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-96 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">No se encontraron resultados</div>
            ) : (
              filteredOptions.map(opt => (
                <div 
                  key={opt.value}
                  className={cn(
                    "flex flex-col px-3 py-1.5 cursor-pointer rounded-sm text-sm hover:bg-secondary transition-colors",
                    value === opt.value ? "bg-primary/15 text-primary font-bold" : "text-popover-foreground"
                  )}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold line-clamp-1">{opt.label}</span>
                    {value === opt.value && <Check className="w-4 h-4 shrink-0 text-primary" />}
                  </div>
                  {opt.subLabel && <span className="text-[10px] text-muted-foreground mt-0.5">{opt.subLabel}</span>}
                </div>
              ))
            )}
            {filteredOptions.length === 100 && (
              <div className="px-3 py-2 text-[10px] text-center text-muted-foreground border-t border-border mt-1">
                Refina la búsqueda para ver más
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
