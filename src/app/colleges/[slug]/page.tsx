"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Star, MapPin, Bookmark, GitCompare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPackage } from "@/lib/utils";
import { useSession } from "next-auth/react";

export default function CollegeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["college", slug],
    queryFn: async () => {
      const res = await fetch(`/api/colleges/${slug}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const college = data?.data;

  const handleSave = async () => {
    if (!session) { window.location.href = "/login"; return; }
    await fetch("/api/saved", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ collegeId: college.id }) });
  };

  if (isLoading) return <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (isError || !college) return <div className="container py-32 text-center"><h1 className="text-2xl font-bold">College not found</h1><Button className="mt-4" asChild><Link href="/colleges">Back to Search</Link></Button></div>;

  return (
    <div className="container py-8">
      <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {college.nirfRank && <Badge>NIRF #{college.nirfRank}</Badge>}
            <Badge variant="secondary">{college.ownership}</Badge>
            <Badge variant="outline">{college.accreditation}</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-2">{college.name}</h1>
          <p className="text-muted-foreground flex items-center gap-1"><MapPin className="h-4 w-4" />{college.city}, {college.state}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}><Bookmark className="h-4 w-4 mr-2" />Save</Button>
          <Button variant="outline" asChild><Link href={`/compare?c=${college.id}`}><GitCompare className="h-4 w-4 mr-2" />Compare</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Fees", value: formatCurrency(college.fees) },
          { label: "Avg Package", value: formatPackage(college.avgPackage) },
          { label: "Highest Package", value: formatPackage(college.highestPackage) },
          { label: "Rating", value: `${college.rating} ★` },
        ].map(({ label, value }) => (
          <Card key={label}><CardContent className="p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="text-xl font-bold">{value}</p></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap h-auto gap-1">
          {["overview", "courses", "placements", "admissions", "facilities", "reviews", "statistics"].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card><CardContent className="p-6"><p className="text-slate-700 leading-relaxed">{college.description}</p></CardContent></Card>
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {college.courses?.map((c: Record<string, unknown>) => (
              <Card key={c.id as string}><CardHeader><CardTitle className="text-base">{c.name as string}</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-1"><p>Degree: {c.degree as string}</p><p>Duration: {c.duration as string}</p><p>Fees: {formatCurrency(c.fees as number)}</p><p>Seats: {c.seats as number}</p></CardContent></Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="placements" className="mt-6">
          {college.placements?.map((p: Record<string, unknown>) => (
            <Card key={p.id as string} className="mb-4"><CardContent className="p-6 grid md:grid-cols-4 gap-4">
              <div><p className="text-sm text-muted-foreground">Year</p><p className="font-bold">{p.year as number}</p></div>
              <div><p className="text-sm text-muted-foreground">Avg Package</p><p className="font-bold">{formatPackage(p.avgPackage as number)}</p></div>
              <div><p className="text-sm text-muted-foreground">Highest</p><p className="font-bold">{formatPackage(p.highestPackage as number)}</p></div>
              <div><p className="text-sm text-muted-foreground">Placement Rate</p><p className="font-bold">{p.placementRate as number}%</p></div>
            </CardContent></Card>
          ))}
        </TabsContent>

        <TabsContent value="admissions" className="mt-6">
          {college.admissions?.map((a: Record<string, unknown>) => (
            <Card key={a.id as string} className="mb-4"><CardContent className="p-6">
              <h3 className="font-semibold mb-2">{a.exam as string}</h3>
              <p className="text-sm mb-2">{a.process as string}</p>
              <p className="text-sm text-muted-foreground">{a.eligibility as string}</p>
            </CardContent></Card>
          ))}
        </TabsContent>

        <TabsContent value="facilities" className="mt-6">
          <div className="grid md:grid-cols-3 gap-3">
            {college.facilities?.map((f: Record<string, unknown>) => (
              <Card key={f.id as string}><CardContent className="p-4 flex justify-between"><span>{f.name as string}</span><Badge variant={f.available ? "default" : "secondary"}>{f.available ? "Yes" : "No"}</Badge></CardContent></Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          {college.reviews?.length === 0 ? <p className="text-muted-foreground">No reviews yet.</p> : college.reviews?.map((r: Record<string, unknown>) => (
            <Card key={r.id as string} className="mb-4"><CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /><span className="font-medium">{r.rating as number}</span><span className="text-sm text-muted-foreground">— {(r.user as Record<string, string>)?.name}</span></div>
              <h4 className="font-semibold">{r.title as string}</h4><p className="text-sm text-slate-600 mt-1">{r.content as string}</p>
            </CardContent></Card>
          ))}
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <Card><CardContent className="p-6 grid md:grid-cols-3 gap-6">
            <div><p className="text-muted-foreground">Established</p><p className="text-2xl font-bold">{college.established ?? "N/A"}</p></div>
            <div><p className="text-muted-foreground">Hostel Fees</p><p className="text-2xl font-bold">{formatCurrency(college.hostelFees)}</p></div>
            <div><p className="text-muted-foreground">Total Courses</p><p className="text-2xl font-bold">{college.courses?.length ?? 0}</p></div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
