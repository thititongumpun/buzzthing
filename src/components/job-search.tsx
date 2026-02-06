import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface JobSearchProps {
  value: string
  onChange: (value: string) => void
}

export function JobSearch({ value, onChange }: JobSearchProps) {
  return (
    <div className="relative max-w-sm mx-auto w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search jobs..."
        className="pl-9 bg-background/50 dark:bg-sidebar/50 border-border dark:border-sidebar-border backdrop-blur-md h-9 text-sm transition-all focus:bg-background/80 focus:ring-1 focus:ring-primary/20"
      />
    </div>
  )
}
