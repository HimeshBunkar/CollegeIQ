"use client";

import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    const res = await signIn("credentials", { ...data, redirect: false });
    if (res?.ok) router.push("/dashboard");
    else form.setError("root", { message: "Invalid email or password" });
  };

  return (
    <div className="container flex items-center justify-center py-20">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Welcome back</CardTitle><CardDescription>Sign in to CollegeIQ</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div><Label>Email</Label><Input type="email" {...form.register("email")} /></div>
            <div><Label>Password</Label><Input type="password" {...form.register("password")} /></div>
            {form.formState.errors.root && <p className="text-red-500 text-sm">{form.formState.errors.root.message}</p>}
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
          {process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true" && (
            <Button variant="outline" className="w-full" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>Continue with Google</Button>
          )}
          <p className="text-center text-sm text-muted-foreground">No account? <Link href="/register" className="text-indigo-600 hover:underline">Sign up</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}