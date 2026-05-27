import { searchSortOptions } from "@/lib/search/sort";
import type { SearchListingsParams } from "@/lib/search/types";

export function SortSelect({ params }: { params: SearchListingsParams }) {
  return (
    <label className="block min-w-52">
      <span className="mb-1.5 block text-xs font-bold text-muted-foreground">
        Sortează
      </span>
      <select
        name="sort"
        defaultValue={params.sort}
        className="h-11 w-full rounded-full border border-input bg-card px-4 text-sm font-bold outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {searchSortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
