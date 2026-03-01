import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <Building2 className="h-6 w-6 text-primary" />
          RealEstateAI
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Get started</Link>
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          AI Agents for Real Estate Builders
        </h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          Deploy AI-powered chat agents on your website and WhatsApp. Capture
          leads, answer buyer questions, and showcase your projects — all
          automatically.
        </p>
        <Button size="lg" asChild>
          <Link href="/sign-up">Start for free</Link>
        </Button>
      </main>
    </div>
  );
}
