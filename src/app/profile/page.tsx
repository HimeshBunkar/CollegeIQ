"use client";

import { useSession, signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: async () => (await fetch("/api/users")).json(), enabled: status === "authenticated" });

  if (status === "loading") return <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (status === "unauthenticated") redirect("/login");

  const user = profile?.data;

  return (
    <div className="container py-8 max-w-2xl">
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><p className="text-sm text-muted-foreground">Name</p><p className="font-medium">{user?.name ?? session?.user?.name}</p></div>
          <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{user?.email ?? session?.user?.email}</p></div>
          <div><p className="text-sm text-muted-foreground">Member since</p><p className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</p></div>
          <Button variant="destructive" onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</Button>
        </CardContent>
      </Card>
    </div>
  );
}
