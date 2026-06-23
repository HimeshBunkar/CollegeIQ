import Link from "next/link";
import { GraduationCap, Search, GitCompare, Target, LayoutDashboard, Bookmark, User } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/colleges", label: "Search", icon: Search },
  { href: "/compare", label: "Compare", icon: GitCompare },
  { href: "/predict", label: "Rank Predictor", icon: Target },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/saved", label: "Saved", icon: Bookmark },
];

export async function Navbar() {
  const session = await getServerSession(authOptions);
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
          <GraduationCap className="h-7 w-7" />
          CollegeIQ
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">{label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <Button variant="outline" size="sm" asChild><Link href="/profile"><User className="h-4 w-4 mr-1" />{session.user?.name?.split(" ")[0] ?? "Profile"}</Link></Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild><Link href="/login">Login</Link></Button>
              <Button size="sm" asChild><Link href="/register">Sign Up</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
