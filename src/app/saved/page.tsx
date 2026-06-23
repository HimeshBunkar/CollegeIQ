"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default function SavedPage() {
  const { status } = useSession();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["saved"],
    queryFn: async () => (await fetch("/api/saved")).json(),
    enabled: status === "authenticated",
  });

  const remove = useMutation({
    mutationFn: async (collegeId: string) => fetch(`/api/saved?collegeId=${collegeId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved"] }),
  });

  if (status === "loading" || isLoading) return <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (status === "unauthenticated") redirect("/login");

  const saved = data?.data ?? [];

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Saved Colleges</h1>
      {saved.length === 0 ? (
        <div className="text-center py-20"><p className="text-muted-foreground mb-4">No saved colleges yet</p><Button asChild><Link href="/colleges">Browse Colleges</Link></Button></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {saved.map((item: Record<string, unknown>) => {
            const c = item.college as Record<string, unknown>;
            return (
              <Card key={item.id as string}><CardContent className="p-6">
                <div className="flex justify-between items-start"><Link href={`/colleges/${c.slug}`} className="font-semibold hover:text-indigo-600">{c.name as string}</Link>
                  <Button variant="ghost" size="icon" onClick={() => remove.mutate(c.id as string)}><Trash2 className="h-4 w-4 text-red-500" /></Button></div>
                <p className="text-sm text-muted-foreground mt-1">{c.city as string}, {c.state as string}</p>
                <p className="text-sm mt-2">Fees: {formatCurrency(c.fees as number)}</p>
              </CardContent></Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
