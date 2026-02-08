import { createFileRoute, Link } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Clock, Calendar, Timer, Play, Pause, Trash2, Activity, CreditCard, CheckCircle2, CalendarDays, PlusCircle, Loader2, Bell, AlertCircle } from 'lucide-react'
import { subscribeToPush } from '@/lib/push'
import { useUser } from '@clerk/tanstack-react-start'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useState } from 'react'

interface Payment {
  id: string
  paymentPlanId: string
  dueDate: string
  amount: string
  isPaid: boolean
  paidDate: string | null
  paymentMonth: number
  notes: string | null
  receiptNumber: string | null
  createdAt: string
  updatedAt: string
}

interface PaymentPlan {
  id: string
  cronJobId: string
  description: string
  totalAmount: string
  monthlyAmount: string
  totalMonths: number
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
  payments: Payment[]
}

interface Job {
  id: string
  name: string
  cron: string
  enabled: boolean
  lastRunAt: string
  createdAt: string
  paymentPlans?: PaymentPlan[]
}

const jobQueryOptions = (id: string) => queryOptions({
  queryKey: ['jobs', id],
  queryFn: async (): Promise<Job> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch job details')
    }
    return response.json()
  },
})

export const Route = createFileRoute('/jobs/$id')({
  loader: ({ context: { queryClient }, params }) => {
    return queryClient.ensureQueryData(jobQueryOptions(params.id))
  },
  component: JobDetailPage,
})

function JobDetailPage() {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const navigate = Route.useNavigate()
  const params = Route.useParams()
  const { data: job } = useSuspenseQuery(jobQueryOptions(params.id))

  const toggleMutation = useMutation({
    mutationFn: async (newEnabled: boolean) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${job.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: job.name,
          cron: job.cron,
          enabled: newEnabled,
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to update job status')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  const subscribeMutation = useMutation({
    mutationFn: () =>
      subscribeToPush({
        jobId: job.id,
        userId: user!.id,
        vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      }),
  })

  const triggerMutation = useMutation({
    mutationFn: async () => {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification('Buzzthing', {
        body: `Job "${job.name}" triggered successfully`,
        icon: '/icon-192x192.png',
        data: { url: `/jobs/${job.id}` },
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${job.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete job')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      navigate({ to: '/' })
    },
  })

  const lastRun = new Date(job.lastRunAt)
  const created = new Date(job.createdAt)

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild className="h-10 w-10">
            <Link to="/">
              <ChevronLeft className="w-6 h-6" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Job Details</h1>
            <p className="text-muted-foreground text-sm">View and manage job configuration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/50 dark:bg-sidebar/50 backdrop-blur-md border-border dark:border-sidebar-border overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                      {job.name}
                    </CardTitle>
                    <p className="text-muted-foreground font-mono text-sm">{job.id}</p>
                  </div>
                  <Badge
                    variant={job.enabled ? 'default' : 'secondary'}
                    className={`text-sm px-3 py-1 ${job.enabled
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                      : 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30'}`}
                  >
                    {job.enabled ? 'Active' : 'Paused'}
                  </Badge>
                </div>
              </CardHeader>
              <Separator className="bg-sidebar-border/50" />
              <CardContent className="pt-6 space-y-8">

                {/* Configuration Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Timer className="w-5 h-5 text-primary" />
                    Schedule Configuration
                  </h3>
                  <div className="bg-background/40 rounded-lg p-4 border border-border/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Corner Expression</p>
                        <code className="text-lg font-mono text-emerald-600 dark:text-emerald-400">{job.cron}</code>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Next Run</p>
                        <p className="text-sm font-medium">Coming soon...</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timing Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                    Activity & Timing
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-background/40 rounded-lg p-4 border border-border/50 flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Last Execution</p>
                        <p className="font-medium text-foreground">
                          {lastRun.toLocaleString('th-TH', { dateStyle: 'full', timeStyle: 'medium' })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {'Successful' /* Mock status */}
                        </p>
                      </div>
                    </div>

                    <div className="bg-background/40 rounded-lg p-4 border border-border/50 flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-pink-500 dark:text-pink-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Date Created</p>
                        <p className="font-medium text-foreground">
                          {created.toLocaleString('th-TH', { dateStyle: 'full', timeStyle: 'medium' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Plans Section */}
                {job.paymentPlans && job.paymentPlans.length > 0 && (
                  <div className="pt-2">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                      Payment Plans
                    </h3>
                    {job.paymentPlans.map((plan) => {
                      const payments = plan.payments.sort((a, b) => a.paymentMonth - b.paymentMonth)
                      const paidCount = payments.filter(p => p.isPaid).length
                      const progress = (paidCount / plan.totalMonths) * 100

                      return (
                        <div key={plan.id} className="bg-background/40 rounded-xl border border-border/50 overflow-hidden mb-6 last:mb-0">
                          <div className="p-5 border-b border-border/50">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                              <div className="space-y-1">
                                <h4 className="font-semibold text-lg">{plan.description}</h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <CalendarDays className="w-3.5 h-3.5" />
                                  <span>
                                    {new Date(plan.startDate).toLocaleDateString('th-TH', { month: 'short', year: 'numeric' })}
                                    {' - '}
                                    {new Date(plan.endDate).toLocaleDateString('th-TH', { month: 'short', year: 'numeric' })}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                  ฿{Number(plan.monthlyAmount).toLocaleString()}
                                  <span className="text-sm text-muted-foreground font-sans font-normal ml-1">/mo</span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Total: ฿{Number(plan.totalAmount).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                <span>Progress: {paidCount} / {plan.totalMonths} months</span>
                                <span className={progress >= 100 ? "text-emerald-600 dark:text-emerald-400" : ""}>{progress.toFixed(1)}%</span>
                              </div>
                              <div className="h-2.5 w-full bg-muted dark:bg-black/20 rounded-full overflow-hidden border border-border/50 dark:border-white/5">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border/50">
                              <CreatePaymentDialog plan={plan} nextMonth={payments.length + 1} />
                            </div>
                          </div>

                          {/* Payment History List */}
                          <div className="p-4 bg-muted/30 dark:bg-black/10">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-sm font-medium text-muted-foreground">Payment History</h5>
                              <Badge variant="outline" className="text-[10px] h-5">
                                {payments.length} Records
                              </Badge>
                            </div>
                            <ScrollArea className="h-[300px] w-full rounded-lg border border-border/30 bg-background/30 p-1">
                              <div className="space-y-1 p-2">
                                {payments.map((payment) => (
                                  <div
                                    key={payment.id}
                                    className={`flex items-center justify-between p-3 rounded-md border transition-all duration-200 ${payment.isPaid
                                      ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/10'
                                      : 'bg-card/50 dark:bg-background/40 border-transparent hover:bg-muted/50 dark:hover:bg-background/60'
                                      }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`flex items-center justify-center w-8 h-8 rounded-full shadow-inner ${payment.isPaid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-muted text-muted-foreground dark:bg-gray-500/10 dark:text-gray-400'
                                        }`}>
                                        <span className="text-xs font-bold">{payment.paymentMonth}</span>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium flex items-center gap-2">
                                          Due: {new Date(payment.dueDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                                          {payment.isPaid && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          {payment.isPaid
                                            ? `Paid on ${new Date(payment.paidDate!).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
                                            : <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
                                          }
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className={`text-sm font-mono font-medium ${payment.isPaid ? 'text-emerald-600 dark:text-emerald-300' : 'text-foreground'}`}>
                                        ฿{Number(payment.amount).toLocaleString()}
                                      </p>
                                      {payment.receiptNumber && (
                                        <code className="text-[10px] text-muted-foreground bg-muted dark:bg-black/20 px-1 py-0.5 rounded ml-auto block w-fit mt-1">
                                          {payment.receiptNumber || '-'}
                                        </code>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

              </CardContent>
            </Card>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            <Card className="bg-card/50 dark:bg-sidebar/50 backdrop-blur-md border-border dark:border-sidebar-border">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Manage this job's lifecycle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start gap-2"
                  variant={subscribeMutation.isSuccess ? 'default' : 'outline'}
                  onClick={() => subscribeMutation.mutate()}
                  disabled={subscribeMutation.isPending || subscribeMutation.isSuccess}
                >
                  {subscribeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : subscribeMutation.isSuccess ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : subscribeMutation.isError ? (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                  {subscribeMutation.isSuccess
                    ? 'Subscribed'
                    : subscribeMutation.isError
                      ? subscribeMutation.error.message
                      : 'Subscribe'}
                </Button>
                <Button
                  className="w-full justify-start gap-2"
                  variant="default"
                  onClick={() => triggerMutation.mutate()}
                  disabled={triggerMutation.isPending}
                >
                  {triggerMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Trigger Now
                </Button>
                <Button
                  className="w-full justify-start gap-2"
                  variant="secondary"
                  onClick={() => toggleMutation.mutate(!job.enabled)}
                  disabled={toggleMutation.isPending}
                >
                  {toggleMutation.isPending ? (
                    <Activity className="w-4 h-4 animate-spin" />
                  ) : (
                    job.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />
                  )}
                  {job.enabled ? 'Pause Job' : 'Resume Job'}
                </Button>
              </CardContent>
              <Separator className="bg-sidebar-border/50" />
              <CardFooter className="pt-4">
                <Button
                  className="w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive"
                  variant="ghost"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this job?')) {
                      deleteMutation.mutate()
                    }
                  }}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? <Activity className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete Job
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreatePaymentDialog({ plan, nextMonth }: { plan: PaymentPlan, nextMonth: number }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    paymentPlanId: plan.id,
    paymentMonth: nextMonth,
    amount: plan.monthlyAmount,
    dueDate: new Date().toISOString().split('T')[0],
    paidDate: new Date().toISOString().split('T')[0],
    isPaid: true,
    notes: '',
    receiptNumber: ''
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        paymentMonth: Number(formData.paymentMonth),
        // If not paid, specific logic might be needed, but assuming standard payload
        paidDate: formData.isPaid ? new Date(formData.paidDate).toISOString() : '',
        dueDate: new Date(formData.dueDate).toISOString()
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to create payment')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      setOpen(false)
      // Reset form marginally or keep for next? Resetting is safer
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full gap-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5">
          <PlusCircle className="w-4 h-4 text-primary" />
          Add Payment Record
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-border">
        <DialogHeader>
          <DialogTitle>Add Payment Record</DialogTitle>
          <DialogDescription>
            Record a new payment for {plan.description}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMonth">Month No.</Label>
              <Input
                id="paymentMonth"
                type="number"
                value={formData.paymentMonth}
                onChange={(e) => setFormData({ ...formData, paymentMonth: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (฿)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            {formData.isPaid && (
              <div className="space-y-2">
                <Label htmlFor="paidDate">Paid Date</Label>
                <Input
                  id="paidDate"
                  type="date"
                  value={formData.paidDate}
                  onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 py-2">
            <Switch
              id="isPaid"
              checked={formData.isPaid}
              onCheckedChange={(checked) => setFormData({ ...formData, isPaid: checked })}
            />
            <Label htmlFor="isPaid">Payment Completed (Paid)</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt / Ref No.</Label>
            <Input
              id="receipt"
              value={formData.receiptNumber}
              onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
