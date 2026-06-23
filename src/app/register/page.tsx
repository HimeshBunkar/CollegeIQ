"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { signIn } from "next-auth/react";
import { z } from "zod";

type Form = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const form = useForm<Form>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: Form) => {
    const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!res.ok) { form.setError("root", { message: "Registration failed" }); return; }
    await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    router.push("/dashboard");
  };

  return (
    <div className="container flex items-center justify-center py-20">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Create account</CardTitle><CardDescription>Join CollegeIQ to save and track colleges</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div><Label>Name</Label><Input {...form.register("name")} /></div>
            <div><Label>Email</Label><Input type="email" {...form.register("email")} /></div>
            <div><Label>Password</Label><Input type="password" {...form.register("password")} /></div>
            {form.formState.errors.root && <p className="text-red-500 text-sm">{form.formState.errors.root.message}</p>}
            <Button type="submit" className="w-full">Create Account</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">Have an account? <Link href="/login" className="text-indigo-600 hover:underline">Sign in</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
