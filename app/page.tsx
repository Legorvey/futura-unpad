import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main>
      <section className="max-w-7xl mx-auto flex flex-col justify-center gap-6 h-screen">
        <p className="border text-muted-foreground text-sm rounded-full w-fit py-1 px-4">Futura 2026 registration is open!</p>
        <h1 className="text-7xl font-bold tracking-tighter text-balance w-1/2">A little insight into the future</h1>
      
        <div className="flex gap-1">
          <Link href="/registration">
            <Button className="rounded-xl py-5 px-4 cursor-pointer">Register Now</Button>
          </Link>
          <Button className="rounded-xl py-5 px-4 cursor-pointer" variant="outline">About us</Button>
        </div>
      </section>
        
    </main>
  );
}
