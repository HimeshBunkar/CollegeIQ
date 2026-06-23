"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Loader2, Target } from "lucide-react";
import { rankPredictorSchema, type RankPredictorInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getChanceColor } from "@/lib/utils";

export default function PredictPage() {
  const { data: meta } = useQuery({
    queryKey: ["predict-meta"],
    queryFn: async () => (await fetch("/api/predict")).json(),
  });

  const form = useForm<RankPredictorInput>({
    resolver: zodResolver(rankPredictorSchema),
    defaultValues: { exam: "JEE_MAIN", category: "GENERAL", gender: "MALE", homeState: "Delhi", rank: 5000 },
  });

  const mutation = useMutation({
    mutationFn: async (data: RankPredictorInput) => {
      const res = await fetch("/api/predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Prediction failed");
      return res.json();
    },
  });

  const results = mutation.data?.data;

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <Target className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Rank Predictor</h1>
          <p className="text-muted-foreground">Get admission probability for JEE Main, JoSAA & CSAB using historical cutoff data</p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="grid md:grid-cols-2 gap-4">
              <div><Label>Exam</Label>
                <Select value={form.watch("exam")} onValueChange={(v) => form.setValue("exam", v as RankPredictorInput["exam"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["JEE_MAIN", "JOSAA", "CSAB"].map((e) => <SelectItem key={e} value={e}>{e.replace("_", " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Category</Label>
                <Select value={form.watch("category")} onValueChange={(v) => form.setValue("category", v as RankPredictorInput["category"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["GENERAL", "OBC", "SC", "ST", "EWS"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Gender</Label>
                <Select value={form.watch("gender")} onValueChange={(v) => form.setValue("gender", v as RankPredictorInput["gender"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["MALE", "FEMALE", "OTHER"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Home State</Label>
                <Select value={form.watch("homeState")} onValueChange={(v) => form.setValue("homeState", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(meta?.data?.states ?? ["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Uttar Pradesh"]).map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2"><Label>Your Rank</Label><Input type="number" {...form.register("rank", { valueAsNumber: true })} />{form.formState.errors.rank && <p className="text-red-500 text-sm mt-1">Enter a valid rank</p>}</div>
              <div className="md:col-span-2"><Button type="submit" className="w-full" disabled={mutation.isPending}>{mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Predicting...</> : "Predict Colleges"}</Button></div>
            </form>
          </CardContent>
        </Card>

        {mutation.isError && <p className="text-red-500 text-center mb-4">Prediction failed. Check your inputs.</p>}

        {results && (
          <div className="space-y-8">
            {(["high", "medium", "low"] as const).map((level) => {
              const items = results.grouped[level];
              if (!items?.length) return null;
              return (
                <div key={level}>
                  <h2 className="text-xl font-bold capitalize mb-4">{level} Chance ({items.length})</h2>
                  <div className="grid gap-4">
                    {items.map((p: Record<string, unknown>) => (
                      <Card key={`${p.collegeId}-${p.course}`}>
                        <CardHeader className="pb-2"><div className="flex justify-between items-start"><CardTitle className="text-lg"><Link href={`/colleges/${p.slug}`} className="hover:text-indigo-600">{p.collegeName as string}</Link></CardTitle><Badge className={getChanceColor(p.chanceLevel as "HIGH" | "MEDIUM" | "LOW")}>{p.chanceLevel as string}</Badge></div></CardHeader>
                        <CardContent className="grid md:grid-cols-4 gap-4 text-sm">
                          <div><p className="text-muted-foreground">Course</p><p className="font-medium">{p.course as string}</p></div>
                          <div><p className="text-muted-foreground">Probability</p><p className="font-medium">{p.admissionProbability as number}%</p></div>
                          <div><p className="text-muted-foreground">Confidence</p><p className="font-medium">{p.confidenceScore as number}%</p></div>
                          <div><p className="text-muted-foreground">Cutoff Range</p><p className="font-medium">{p.openingRank as number} - {p.closingRank as number}</p></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
            {results.total === 0 && <p className="text-center text-muted-foreground">No matching colleges for this rank. Try a higher rank or different category.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
