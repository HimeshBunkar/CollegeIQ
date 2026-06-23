"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, GitCompare, Target, Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await fetch("/api/users")).json(),
    enabled: status === "authenticated",
  });

  if (status === "loading") return <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (status === "unauthenticated") redirect("/login");

  const counts = profile?.data?._count;

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Welcome back, {session?.user?.name}</p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Saved Colleges", value: counts?.savedColleges ?? 0, icon: Bookmark, href: "/saved" },
          { label: "Shortlists", value: counts?.shortlists ?? 0, icon: Target, href: "/saved" },
          { label: "Comparisons", value: counts?.comparisons ?? 0, icon: GitCompare, href: "/compare" },
        ].map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}><Card className="hover:shadow-lg transition-shadow"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{label}</CardTitle><Icon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><p className="text-3xl font-bold">{value}</p></CardContent></Card></Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card><CardContent className="p-6"><h3 className="font-semibold mb-2">Quick Actions</h3><div className="flex flex-wrap gap-2"><Button asChild><Link href="/colleges"><Search className="h-4 w-4 mr-2" />Search</Link></Button><Button variant="outline" asChild><Link href="/predict"><Target className="h-4 w-4 mr-2" />Predict</Link></Button></div></CardContent></Card>
        <Card><CardContent className="p-6"><h3 className="font-semibold mb-2">Your Journey</h3><p className="text-sm text-muted-foreground">Track saved colleges, build shortlists, and compare options to make your decision.</p></CardContent></Card>
      </div>
    </div>
  );
}
