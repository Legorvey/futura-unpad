"use client"

import { useRouter } from "nextjs-toploader/app"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, LayoutGrid, MonitorSmartphone, HeartPulse, Landmark, Users2, BookOpen, Search } from "lucide-react"

interface LombaEssayFilterProps {
    searchParam: string | undefined
    categoryParam: string | undefined
}

export function LombaEssayFilter({ searchParam, categoryParam }: LombaEssayFilterProps) {
    const router = useRouter()

    const updateFilter = (category: string) => {
        const params = new URLSearchParams()
        if (searchParam) params.set("search", searchParam)
        if (category && category !== "all") params.set("category", category)
        router.push(`/admin/lomba-essay?${params.toString()}`)
    }

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const search = formData.get("search") as string
        const params = new URLSearchParams()
        if (search) params.set("search", search)
        if (categoryParam && categoryParam !== "all") params.set("category", categoryParam)
        router.push(`/admin/lomba-essay?${params.toString()}`)
    }

    return (
        <form className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/50 p-2.5 bg-card/40 backdrop-blur-md shadow-sm" onSubmit={onSubmit}>
            <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    key={searchParam ?? "empty"}
                    name="search"
                    defaultValue={searchParam ?? ""}
                    placeholder="Search team, name, paper title"
                    className="h-10 w-full rounded-lg border border-input bg-background px-4 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button type="submit" className="sr-only">Search</button>
            </div>
            <div className="flex gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button type="button" variant="outline" className="h-10 w-full sm:w-[200px] justify-between rounded-lg bg-background">
                            <span className="truncate flex items-center gap-2">
                                {categoryParam === "teknologi" ? <MonitorSmartphone className="h-4 w-4" /> : categoryParam === "kesehatan" ? <HeartPulse className="h-4 w-4" /> : categoryParam === "ekonomi" ? <Landmark className="h-4 w-4" /> : categoryParam === "sosial" ? <Users2 className="h-4 w-4" /> : categoryParam === "pendidikan" ? <BookOpen className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                                {categoryParam && categoryParam !== "all" ? categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1) : "All Sub-Themes"}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[200px]">
                        <DropdownMenuItem onSelect={() => updateFilter("all")}>
                            <LayoutGrid className="mr-2 h-4 w-4" />
                            All Sub-Themes
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => updateFilter("teknologi")}>
                            <MonitorSmartphone className="mr-2 h-4 w-4" />
                            Teknologi
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => updateFilter("kesehatan")}>
                            <HeartPulse className="mr-2 h-4 w-4" />
                            Kesehatan
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => updateFilter("ekonomi")}>
                            <Landmark className="mr-2 h-4 w-4" />
                            Ekonomi
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => updateFilter("sosial")}>
                            <Users2 className="mr-2 h-4 w-4" />
                            Sosial
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => updateFilter("pendidikan")}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            Pendidikan
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </form>
    )
}
