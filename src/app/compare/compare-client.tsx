"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPackage } from "@/lib/utils";

const METRICS = [
  { key: "fees", label: "Annual Fees", fmt: (v: number) => formatCurrency(v) },
  { key: "hostelFees", label: "Hostel Fees", fmt: (v: number) => formatCurrency(v) },
  { key: "avgPackage", label: "Avg Package", fmt: (v: number) => formatPackage(v) },
  { key: "highestPackage", label: "Highest Package", fmt: (v: number) => formatPackage(v) },
  { key: "nirfRank", label: "NIRF Rank", fmt: (v: number) => (v ? `#${v}` : "N/A") },
  { key: "rating", label: "Rating", fmt: (v: number) => `${v} ★` },
];

export default function CompareClient() {
  const searchParams = useSearchParams();
  const ids = searchParams.getAll("c");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["compare", ids],
    queryFn: async () => {
      const qs = ids.map((id) => `c=${id}`).join("&");
      const res = await fetch(`/api/compare?${qs}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: ids.length >= 2,
  });

  const colleges = (data?.data ?? []) as Array<Record<string, unknown> & { placements?: Array<{ placementRate: number }> }>;

  if (ids.length < 2) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Compare Colleges</h1>
        <p className="text-muted-foreground mb-6">Select 2-3 colleges to compare. Use URL format: /compare?c=id1&c=id2</p>
        <Button asChild><Link href="/colleges">Browse Colleges</Link></Button>
      </div>
    );
  }

  if (isLoading) return <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (isError) return <div className="container py-20 text-center text-red-500">Failed to load comparison</div>;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="text-3xl font-bold">Compare Colleges</h1><p className="text-muted-foreground">Side-by-side comparison</p></div>
        <Button variant="outline" onClick={() => navigator.clipboard.writeText(window.location.href)}><Share2 className="h-4 w-4 mr-2" />Copy Link</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 font-medium text-muted-foreground w-48">Metric</th>
              {colleges.map((c) => (
                <th key={c.id as string} className="p-4 text-left min-w-[200px]">
                  <Link href={`/colleges/${c.slug}`} className="font-semibold text-indigo-600 hover:underline">{c.name as string}</Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRICS.map(({ key, label, fmt }) => (
              <tr key={key} className="border-b hover:bg-slate-50">
                <td className="p-4 font-medium">{label}</td>
                {colleges.map((c) => (
                  <td key={c.id as string} className="p-4">{fmt(c[key] as number)}</td>
                ))}
              </tr>
            ))}
            <tr className="border-b hover:bg-slate-50">
              <td className="p-4 font-medium">Location</td>
              {colleges.map((c) => <td key={c.id as string} className="p-4">{c.city as string}, {c.state as string}</td>)}
            </tr>
            <tr className="border-b hover:bg-slate-50">
              <td className="p-4 font-medium">Placement Rate</td>
              {colleges.map((c) => <td key={c.id as string} className="p-4">{c.placements?.[0]?.placementRate ?? "N/A"}%</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
