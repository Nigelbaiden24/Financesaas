import { memo, useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { debounce } from 'lodash';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';

// Memoized search input with debouncing
interface DebouncedSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  delay?: number;
  className?: string;
  initialValue?: string;
}

export const DebouncedSearch = memo(function DebouncedSearch({
  onSearch,
  placeholder = 'Search...',
  delay = 300,
  className = '',
  initialValue = ''
}: DebouncedSearchProps) {
  const [value, setValue] = useState(initialValue);
  const debouncedSearch = useRef(
    debounce((query: string) => {
      onSearch(query);
    }, delay)
  ).current;

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  }, [debouncedSearch]);

  const handleClear = useCallback(() => {
    setValue('');
    debouncedSearch('');
  }, [debouncedSearch]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="pl-10 pr-10"
        data-testid="input-search"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          data-testid="button-clear-search"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
});

// Virtualized list for large datasets
interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  className?: string;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 5,
  className = ''
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const startIndex = useMemo(() => {
    return Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  }, [scrollTop, itemHeight, overscan]);

  const endIndex = useMemo(() => {
    return Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    );
  }, [scrollTop, containerHeight, itemHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1);
  }, [items, startIndex, endIndex]);

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      data-testid="virtualized-list"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Memoized filter component
interface MemoizedFilterProps {
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  options: {
    key: string;
    label: string;
    type: 'select' | 'boolean' | 'range';
    options?: { value: any; label: string }[];
  }[];
  className?: string;
}

export const MemoizedFilter = memo(function MemoizedFilter({
  filters,
  onFilterChange,
  options,
  className = ''
}: MemoizedFilterProps) {
  const handleFilterChange = useCallback(
    (key: string, value: any) => {
      const newFilters = { ...filters, [key]: value };
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  const clearFilters = useCallback(() => {
    const clearedFilters = Object.keys(filters).reduce(
      (acc, key) => ({ ...acc, [key]: undefined }),
      {}
    );
    onFilterChange(clearedFilters);
  }, [filters, onFilterChange]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => 
      value !== undefined && value !== null && value !== ''
    );
  }, [filters]);

  return (
    <motion.div
      className={`space-y-4 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-sm text-gray-700">Filters</span>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            data-testid="button-clear-filters"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((option) => (
          <div key={option.key} className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {option.label}
            </label>
            {option.type === 'select' && option.options && (
              <select
                value={filters[option.key] || ''}
                onChange={(e) => handleFilterChange(option.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid={`filter-${option.key}`}
              >
                <option value="">All</option>
                {option.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            {option.type === 'boolean' && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters[option.key] || false}
                  onChange={(e) => handleFilterChange(option.key, e.target.checked)}
                  className="rounded border-gray-300 focus:ring-blue-500"
                  data-testid={`filter-${option.key}`}
                />
                <span className="text-sm text-gray-600">Enable</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
});

// Optimized data table with memoization
interface OptimizedTableProps<T> {
  data: T[];
  columns: {
    key: string;
    header: string;
    render?: (item: T, index: number) => React.ReactNode;
    sortable?: boolean;
  }[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  className?: string;
}

export const OptimizedTable = memo(function OptimizedTable<T extends Record<string, any>>({
  data,
  columns,
  sortBy,
  sortDirection = 'asc',
  onSort,
  className = ''
}: OptimizedTableProps<T>) {
  const sortedData = useMemo(() => {
    if (!sortBy || !onSort) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (aVal === bVal) return 0;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortBy, sortDirection, onSort]);

  const handleSort = useCallback((key: string) => {
    if (onSort) {
      onSort(key);
    }
  }, [onSort]);

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                onClick={() => column.sortable && handleSort(column.key)}
                data-testid={`column-header-${column.key}`}
              >
                <div className="flex items-center gap-1">
                  {column.header}
                  {column.sortable && sortBy === column.key && (
                    <span className="text-blue-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((item, index) => (
            <motion.tr
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.02 }}
              className="hover:bg-gray-50"
              data-testid={`table-row-${index}`}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.render ? column.render(item, index) : item[column.key]}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});