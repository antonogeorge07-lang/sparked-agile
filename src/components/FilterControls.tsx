import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterControlsProps {
  filters: {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
  activeFiltersCount?: number;
  onClearAll?: () => void;
}

export const FilterControls = ({ filters, activeFiltersCount = 0, onClearAll }: FilterControlsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {filters.map((filter) => (
        <div key={filter.label} className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {filter.label}:
          </span>
          <Select value={filter.value} onValueChange={filter.onChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
      
      {activeFiltersCount > 0 && onClearAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Clear filters ({activeFiltersCount})
        </Button>
      )}
    </div>
  );
};
