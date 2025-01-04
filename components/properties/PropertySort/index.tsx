"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

const SORT_OPTIONS = [
  { label: "Newest", value: "created_at.desc" },
  { label: "Oldest", value: "created_at.asc" },
  { label: "Price: High to Low", value: "price.desc" },
  { label: "Price: Low to High", value: "price.asc" },
  { label: "Title: A-Z", value: "title.asc" },
  { label: "Title: Z-A", value: "title.desc" },
]

export function PropertySort() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentSort = searchParams.get("sort") || "created_at.desc"

  const selectedOption = SORT_OPTIONS.find((option) => option.value === currentSort) || SORT_OPTIONS[0]

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", value)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <span>Sort by: {selectedOption.label}</span>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {SORT_OPTIONS.map((option) => {
          const [field, direction] = option.value.split(".")
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className="flex items-center justify-between"
            >
              <span>{option.label}</span>
              {direction === "asc" ? (
                <ArrowUpIcon className="h-4 w-4" />
              ) : (
                <ArrowDownIcon className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
