"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { submitDispute } from "@/lib/api"

export function DisputeForm() {
  const searchParams = useSearchParams()
  const session = searchParams.get("session") || ""

  const [reason, setReason] = React.useState("")
  const [details, setDetails] = React.useState("")
  const [isSubmitted, setIsSubmitted] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      toast.error("Error", { description: "Session ID is missing." })
      return
    }

    setIsSubmitting(true)
    try {
      await submitDispute(session, `${reason}: ${details}`)
      setIsSubmitted(true)
      toast.success("Dispute Submitted", {
        description: "Our team will review your dispute shortly.",
      })
    } catch (error) {
      console.error(error)
      toast.error("Submission Failed", {
        description: "Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="mx-auto w-full max-w-md space-y-6 p-4 text-center">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 ring-4 ring-green-500/10">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dispute Submitted</h1>
          <p className="text-muted-foreground">
            We have received your dispute for session <span className="font-mono text-white">{session}</span>.
            <br />
            You will receive an email update within 24 hours.
          </p>
        </div>
        <Button className="w-full bg-[#E84142] hover:bg-[#E84142]/90" onClick={() => window.location.href = "/"}>
          Return Home
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Dispute Session</h1>
        <p className="text-muted-foreground">You are disputing session: <span className="font-mono text-white">{session || "Unknown"}</span></p>
      </div>

      <Card className="glass-card border-none bg-black/40">
        <CardHeader>
          <CardTitle>Report an Issue</CardTitle>
          <CardDescription>Please provide details about the problem.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Dispute</Label>
              <Select onValueChange={setReason} required>
                <SelectTrigger id="reason" className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incorrect_split">Incorrect Split</SelectItem>
                  <SelectItem value="never_received">Never Received</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Additional Details</Label>
              <Textarea
                id="details"
                placeholder="Please provide any relevant information, such as transaction IDs or context..."
                className="min-h-[120px] bg-white/5 border-white/10"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-[#E84142] hover:bg-[#E84142]/90" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Dispute"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
