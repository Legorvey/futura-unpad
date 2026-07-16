"use client"

import * as React from "react"
import dynamic from "next/dynamic"

const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false })
const ComposedChart = dynamic(() => import("recharts").then(mod => mod.ComposedChart), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false })
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false })
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subDays } from "date-fns"
import { DateRange } from "react-day-picker"
import { Info, TrendingUp, Cpu, PenTool, Receipt, CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export type RevenueData = {
  date: string
  mechatura_gross: number
  mechatura_net: number
  essay_gross: number
  essay_net: number
  count: number
}

const chartConfig = {
  mechatura_net: {
    label: "Mechatura (Net)",
    color: "hsl(221.2 83.2% 53.3%)", // Deep Blue
  },
  essay_net: {
    label: "Lomba Essay (Net)",
    color: "hsl(271.5 81.3% 55.9%)", // Vibrant Purple
  },
  tax: {
    label: "Gateway Fees",
    color: "hsl(215 16.3% 46.9%)", // Slate/Gray
  }
} satisfies ChartConfig

const currencyFormatter = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })

const formatCurrency = (value: number) => {
  return currencyFormatter.format(value)
}

export function RevenueChart({ data }: { data: RevenueData[] }) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date()
  })
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)

  // Format the data for the chart to fill the selected date range
  const formattedData = React.useMemo(() => {
    if (!dateRange?.from) return []

    const start = dateRange.from
    const end = dateRange.to || start
    const days = eachDayOfInterval({ start, end })
    
    const dataMap = new Map<string, RevenueData>()
    data.forEach(item => {
      const d = new Date(item.date)
      if (!isNaN(d.getTime())) {
        dataMap.set(format(d, "yyyy-MM-dd"), item)
      }
    })
    
    return days.map(day => {
      const dateStr = format(day, "yyyy-MM-dd")
      const item = dataMap.get(dateStr)
      
      const mechaturaGross = Number(item?.mechatura_gross || 0)
      const mechaturaNet = Number(item?.mechatura_net || 0)
      const essayGross = Number(item?.essay_gross || 0)
      const essayNet = Number(item?.essay_net || 0)

      return {
        date: dateStr,
        mechatura_gross: mechaturaGross,
        mechatura_net: mechaturaNet,
        essay_gross: essayGross,
        essay_net: essayNet,
        tax: (mechaturaGross - mechaturaNet) + (essayGross - essayNet),
        formattedDate: format(day, "d MMM"), // explicitly show month abbreviation since range can span multiple months
        count: Number(item?.count || 0)
      }
    })
  }, [data, dateRange])

  const totalMechaturaNet = formattedData.reduce((sum, item) => sum + item.mechatura_net, 0)
  const totalEssayNet = formattedData.reduce((sum, item) => sum + item.essay_net, 0)
  const totalNetRevenue = totalMechaturaNet + totalEssayNet
  const totalTax = formattedData.reduce((sum, item) => sum + item.tax, 0)
  const totalGrossRevenue = totalNetRevenue + totalTax
  const totalRegistrations = formattedData.reduce((sum, item) => sum + item.count, 0)



  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border p-6 bg-card">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Revenue Overview</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-muted">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">Tax Information</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Midtrans Tax Calculation</DialogTitle>
                  <DialogDescription>
                    We automatically deduct payment gateway fees to show you the exact Net Income.
                  </DialogDescription>
                </DialogHeader>
                <div className="text-sm space-y-4 py-2 text-muted-foreground">
                  <p>Different payment methods have different fee structures:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>E-Wallets (GoPay, QRIS, ShopeePay):</strong> 2% flat fee</li>
                    <li><strong>Virtual Accounts (Bank Transfer):</strong> Rp 4,440 flat fee</li>
                    <li><strong>Credit Cards:</strong> 2.9% + Rp 2,000</li>
                  </ul>
                  <p>Transactions before payment method tracking was enabled assume a standard 2% e-wallet rate.</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Breakdown of gross revenue, net income, and gateway fees</p>
        </div>
        <div className="text-left sm:text-right border-t sm:border-t-0 border-border pt-4 sm:pt-0">
          <p className="text-3xl font-semibold tracking-tight">
            {formatCurrency(totalNetRevenue)}
          </p>
          <p className="text-sm font-medium text-muted-foreground mt-1">
             Gross: {formatCurrency(totalGrossRevenue)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{totalRegistrations} total paid teams</p>
        </div>
      </div>
      
      <div className="flex justify-end border-b border-border pb-4 mb-4">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full sm:w-[280px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto flex flex-col sm:flex-row p-0" align="end">
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 border-b sm:border-b-0 sm:border-r border-border p-3 min-w-[150px]">
              <Button variant="ghost" size="sm" className="justify-start text-left font-normal w-full" onClick={() => {
                setDateRange({ from: new Date(), to: new Date() })
                setIsCalendarOpen(false)
              }}>Today</Button>
              <Button variant="ghost" size="sm" className="justify-start text-left font-normal w-full" onClick={() => {
                const yesterday = subDays(new Date(), 1);
                setDateRange({ from: yesterday, to: yesterday });
                setIsCalendarOpen(false)
              }}>Yesterday</Button>
              <Button variant="ghost" size="sm" className="justify-start text-left font-normal w-full" onClick={() => {
                setDateRange({ from: subDays(new Date(), 2), to: new Date() })
                setIsCalendarOpen(false)
              }}>Last 3 days</Button>
              <Button variant="ghost" size="sm" className="justify-start text-left font-normal w-full" onClick={() => {
                setDateRange({ from: subDays(new Date(), 6), to: new Date() })
                setIsCalendarOpen(false)
              }}>Last 7 days</Button>
              <Button variant="ghost" size="sm" className="justify-start text-left font-normal w-full" onClick={() => {
                setDateRange({ from: subDays(new Date(), 14), to: new Date() })
                setIsCalendarOpen(false)
              }}>Last 15 days</Button>
              <Button variant="ghost" size="sm" className="justify-start text-left font-normal w-full" onClick={() => {
                setDateRange({ from: subDays(new Date(), 29), to: new Date() })
                setIsCalendarOpen(false)
              }}>Last 30 days</Button>
            </div>
            <div className="p-3">
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={1}
                disabled={(date) => date > new Date()}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="h-[350px] w-full">
        {formattedData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ComposedChart data={formattedData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/50" />
              <XAxis 
                dataKey="formattedDate" 
                tickLine={false} 
                axisLine={false}
                tickMargin={10}
                className="text-xs text-muted-foreground font-mono"
              />
              <YAxis 
                yAxisId="left"
                tickLine={false} 
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => `Rp ${value / 1000}k`}
                className="text-xs text-muted-foreground font-mono"
              />
              <ChartTooltip
                cursor={{ stroke: "var(--color-muted-foreground)", strokeWidth: 1, strokeDasharray: "4 4" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-border bg-background p-3 shadow-xl space-y-3 min-w-[220px]">
                        <div className="flex justify-between items-center border-b border-border pb-2">
                          <p className="font-medium text-sm">{label}</p>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{data.count} Teams</span>
                        </div>
                        
                        <div className="space-y-3">
                           {data.mechatura_gross > 0 && (
                             <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: chartConfig.mechatura_net.color }} />
                                  <span className="text-xs text-muted-foreground font-medium">{chartConfig.mechatura_net.label}</span>
                                </div>
                                <div className="pl-4.5 text-xs flex justify-between items-center">
                                  <span className="text-muted-foreground">Gross Revenue:</span>
                                  <span className="font-mono">{formatCurrency(data.mechatura_gross)}</span>
                                </div>
                                <div className="pl-4.5 text-xs flex justify-between items-center">
                                  <span className="text-muted-foreground">Net Income:</span>
                                  <span className="font-mono font-medium text-foreground">{formatCurrency(data.mechatura_net)}</span>
                                </div>
                             </div>
                           )}
                           
                           {data.essay_gross > 0 && (
                             <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: chartConfig.essay_net.color }} />
                                  <span className="text-xs text-muted-foreground font-medium">{chartConfig.essay_net.label}</span>
                                </div>
                                <div className="pl-4.5 text-xs flex justify-between items-center">
                                  <span className="text-muted-foreground">Gross Revenue:</span>
                                  <span className="font-mono">{formatCurrency(data.essay_gross)}</span>
                                </div>
                                <div className="pl-4.5 text-xs flex justify-between items-center">
                                  <span className="text-muted-foreground">Net Income:</span>
                                  <span className="font-mono font-medium text-foreground">{formatCurrency(data.essay_net)}</span>
                                </div>
                             </div>
                           )}
                           
                           {data.tax > 0 && (
                             <div className="flex flex-col gap-1.5 pt-2 border-t border-border/50">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: chartConfig.tax.color }} />
                                  <span className="text-xs text-muted-foreground font-medium">Gateway Fees</span>
                                </div>
                                <div className="pl-4.5 text-xs flex justify-between items-center">
                                  <span className="text-muted-foreground">Deducted:</span>
                                  <span className="font-mono text-muted-foreground">-{formatCurrency(data.tax)}</span>
                                </div>
                             </div>
                           )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {totalMechaturaNet > 0 && (
                <Bar 
                  yAxisId="left"
                  dataKey="mechatura_net" 
                  stackId="a"
                  fill="var(--color-mechatura_net)"
                  radius={totalEssayNet === 0 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  maxBarSize={40}
                />
              )}
              {totalEssayNet > 0 && (
                <Bar 
                  yAxisId="left"
                  dataKey="essay_net" 
                  stackId="a"
                  fill="var(--color-essay_net)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              )}
              <ChartLegend content={<ChartLegendContent />} />
            </ComposedChart>
          </ChartContainer>
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-[8px] border border-dashed border-border">
            <p className="text-sm text-muted-foreground">No revenue data available yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
