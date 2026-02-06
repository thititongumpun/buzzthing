import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { Clock, Timer } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { JobSearch } from '@/components/job-search'

interface Job {
  id: string
  name: string
  cron: string
  enabled: boolean
  lastRunAt: string
  createdAt: string
}

const jobsQueryOptions = queryOptions({
  queryKey: ['jobs'],
  queryFn: async (): Promise<Job[]> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs`)
    if (!response.ok) {
      throw new Error('Failed to fetch jobs')
    }
    return response.json()
  },
})

export const Route = createFileRoute('/')({
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(jobsQueryOptions)
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { data: jobs } = useSuspenseQuery(jobsQueryOptions)
  const [search, setSearch] = useState('')

  const filteredJobs = jobs.filter((job) =>
    job.name.toLowerCase().includes(search.toLowerCase()) ||
    job.id.toLowerCase().includes(search.toLowerCase())
  )

  const enabledCount = jobs.filter((job) => job.enabled).length

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 animate-fade-in space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent animate-gradient">
            Scheduled Jobs
          </h1>
          <p className="text-muted-foreground text-sm">Manage and monitor your automated tasks</p>
        </div>

        <div className="mb-6">
          <JobSearch value={search} onChange={setSearch} />
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-4xl mx-auto mb-8 text-center">
          <Card className="bg-card/50 dark:bg-sidebar/50 backdrop-blur-md border-border shadow-sm">
            <CardContent className="p-3 sm:p-6">
              <p className="text-xs text-muted-foreground mb-1">Total</p>
              <p className="text-2xl sm:text-4xl font-bold text-foreground">{jobs.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-emerald-500/10 dark:bg-emerald-500/5 backdrop-blur-md border-emerald-500/20 shadow-sm">
            <CardContent className="p-3 sm:p-6">
              <p className="text-xs text-emerald-600 dark:text-emerald-500/80 mb-1">Active</p>
              <p className="text-2xl sm:text-4xl font-bold text-emerald-600 dark:text-emerald-500">{enabledCount}</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-500/10 dark:bg-orange-500/5 backdrop-blur-md border-orange-500/20 shadow-sm">
            <CardContent className="p-3 sm:p-6">
              <p className="text-xs text-orange-600 dark:text-orange-500/80 mb-1">Paused</p>
              <p className="text-2xl sm:text-4xl font-bold text-orange-600 dark:text-orange-500">
                {jobs.length - enabledCount}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {filteredJobs.map((job, index) => (
            <JobCard key={job.id} job={job} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

function JobCard({ job, index }: { job: Job; index: number }) {
  const lastRun = new Date(job.lastRunAt)


  return (
    <Link
      to="/jobs/$id"
      params={{ id: job.id }}
      className="block group"
    >
      <Card
        className="h-full relative bg-card/50 dark:bg-sidebar/50 backdrop-blur-md border-border dark:border-sidebar-border group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-primary/10 transition-all duration-300 animate-slide-up overflow-hidden"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/10 group-hover:to-primary/5 transition-all duration-500" />

        <CardHeader className="relative z-10 p-3 pb-0">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 flex-1 leading-tight mt-0.5">
              {job.name}
            </CardTitle>
            <Badge
              variant={job.enabled ? 'default' : 'secondary'}
              className={`flex-shrink-0 text-[10px] h-5 px-1.5 font-normal ${job.enabled
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                : 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30'
                }`}
            >
              {job.enabled ? 'Active' : 'Pause'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Timer className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <code className="text-[10px] bg-background/50 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono border border-border truncate max-w-full">
              {job.cron}
            </code>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
            <span className="truncate">
              {lastRun.toLocaleString('th-TH', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>


        </CardContent>
      </Card>
    </Link>
  )
}
