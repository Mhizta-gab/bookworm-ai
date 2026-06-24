"use client";

import { Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import styles from "./dashboard.module.css";

interface LibrarySearchProps {
  defaultValue?: string;
  totalCount: number;
}

export function LibrarySearch({ defaultValue = "", totalCount }: LibrarySearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("query", value.trim());
      } else {
        params.delete("query");
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  return (
    <div className={styles.panelHeader}>
      <label className={styles.search} style={{ opacity: isPending ? 0.7 : 1 }}>
        <Search size={16} />
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search title or author…"
          defaultValue={defaultValue}
          onChange={(e) => {
            if (debounceTimer) clearTimeout(debounceTimer);
            const val = e.currentTarget.value;
            debounceTimer = setTimeout(() => handleChange(val), 340);
          }}
          aria-label="Search the library"
        />
      </label>
      <span className={styles.statusPill}>
        {isPending ? "Searching…" : `${totalCount} book${totalCount === 1 ? "" : "s"}`}
      </span>
    </div>
  );
}
