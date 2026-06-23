"use client";

import Link from "next/link";
import Image from "next/image";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Star, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatPackage } from "@/lib/utils";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return debounced;
}

async function fetchColleges(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/colleges?${qs}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function CollegesClient() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [state, setState] = useState(searchParams.get("state") ?? "");
  const [ownership, setOwnership] = useState(searchParams.get("ownership") ?? "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") ?? "nirfRank");
  const debouncedSearch = useDebounce(search, 400);

  const buildParams = useCallback((page: number) => {
    const p: Record<string, string> = { page: String(page), limit: "12", sortBy, sortOrder: "asc" };
    if (debouncedSearch) p.search = debouncedSearch;
    if (state) p.state = state;
    if (ownership) p.ownership = ownership;
    return p;
  }, [debouncedSearch, state, ownership, sortBy]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ["colleges", debouncedSearch, state, ownership, sortBy],
    queryFn: ({ pageParam = 1 }) => fetchColleges(buildParams(pageParam)),
    getNextPageParam: (last) => {
      const p = last.data.pagination;
      return p.page < p.totalPages ? p.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const colleges = data?.pages.flatMap((p) => p.data.colleges) ?? [];
  const states: string[] = data?.pages[0]?.data.filters?.states ?? [];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search Colleges</h1>
        <p className="text-muted-foreground">Find and filter colleges across India</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, city, state..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={state || "all"} onValueChange={(v) => setState(v === "all" ? "" : v)}>
          <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="State" /></SelectTrigger>
          <SelectContent>{[{ v: "all", l: "All States" }, ...states.map((s) => ({ v: s, l: s }))].map(({ v, l }) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={ownership || "all"} onValueChange={(v) => setOwnership(v === "all" ? "" : v)}>
          <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Ownership" /></SelectTrigger>
          <SelectContent>
            {["all", "GOVERNMENT", "PRIVATE", "DEEMED", "AUTONOMOUS"].map((v) => <SelectItem key={v} value={v}>{v === "all" ? "All Types" : v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full lg:w-44"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            {[{ v: "nirfRank", l: "NIRF Rank" }, { v: "rating", l: "Rating" }, { v: "fees", l: "Fees" }, { v: "avgPackage", l: "Avg Package" }, { v: "name", l: "Name" }].map(({ v, l }) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>}
      {isError && <div className="text-center py-20 text-red-500">Failed to load colleges. Please try again.</div>}
      {!isLoading && !isError && colleges.length === 0 && <div className="text-center py-20 text-muted-foreground">No colleges found. Try adjusting filters.</div>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {colleges.map((college: Record<string, unknown>) => (
          <Link key={college.id as string} href={`/colleges/${college.slug}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {college.logo ? <Image src={college.logo as string} alt="" width={48} height={48} className="rounded-lg" /> : <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">{(college.name as string)[0]}</div>}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{college.name as string}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{college.city as string}, {college.state as string}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {!!college.nirfRank && <Badge variant="secondary">NIRF #{college.nirfRank as number}</Badge>}
                  <Badge variant="outline">{college.ownership as string}</Badge>
                  <Badge variant="outline" className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{college.rating as number}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Fees</span><p className="font-medium">{formatCurrency(college.fees as number)}</p></div>
                  <div><span className="text-muted-foreground">Avg Package</span><p className="font-medium">{formatPackage(college.avgPackage as number)}</p></div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Loading...</> : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
