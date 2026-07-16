import * as React from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  emptyText?: string;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder,
  emptyText = "Tidak ditemukan",
  className = "w-[200px]",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = React.useMemo(() => {
    if (!search) return options;
    const lowerSearch = search.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(lowerSearch));
  }, [options, search]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 justify-between rounded-xl border-gray-200 bg-gray-50 text-gray-700 font-semibold focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-gray-300 transition-all shadow-sm"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-full min-w-[240px] origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 p-2 border border-gray-100 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-8 pr-3 text-xs bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <div className="max-h-[220px] overflow-y-auto space-y-0.5 scrollbar-thin">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onValueChange(opt.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold rounded-lg text-left transition-all ${
                    value === opt.value
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {value === opt.value && <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 ml-2" />}
                </button>
              ))
            ) : (
              <div className="px-2.5 py-3 text-[11px] font-medium text-gray-400 text-center">
                {emptyText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
