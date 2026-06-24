import Link from "next/link";
import { ArrowRight, BarChart3, GitCompare, Search, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white">
        <div className="container py-24 md:py-32">
          <div className="max-w-3xl">
            <p className="text-indigo-200 font-medium mb-4">College Discovery Platform</p>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Discover, Compare, Predict and Decide.</h1>
            <p className="text-lg text-indigo-100 mb-8 max-w-2xl">CollegeIQ helps students search 1000+ colleges, compare side-by-side, predict admission chances using rank cutoffs, and build shortlists — all in one SaaS platform.</p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50" asChild><Link href="/colleges">Search Colleges <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white" asChild><Link href="/predict">Try Rank Predictor</Link></Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to decide</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Search, title: "Smart Search", desc: "Filter by state, fees, NIRF rank, courses with debounced search and infinite scroll." },
            { icon: GitCompare, title: "Compare", desc: "Side-by-side comparison of fees, packages, placements with shareable URLs." },
            { icon: Target, title: "Rank Predictor", desc: "JEE Main, JoSAA, CSAB predictions with admission probability and confidence scores." },
            { icon: BarChart3, title: "Track & Save", desc: "Save colleges, create shortlists, and track your decision journey in dashboard." },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader><Icon className="h-8 w-8 text-indigo-600 mb-2" /><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
              <CardContent><CardDescription className="text-base">{desc}</CardDescription></CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
