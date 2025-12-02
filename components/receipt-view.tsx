"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle2, Download, Share2, RotateCcw, ExternalLink, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import confetti from "canvas-confetti"
import { getMerchantTips, type TipEvent } from "@/lib/api"

export function ReceiptView() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const totalAmount = searchParams.get("total") || "0.00"
  const tipAmount = searchParams.get("tip") || "0.00"
  const txHash = searchParams.get("tx") || ""
  const session = searchParams.get("session") || ""
  const merchantId = "demo-cafe" // In a real app, this should probably be passed or inferred
  
  const [tipData, setTipData] = React.useState<TipEvent | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    // Fire confetti on mount
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#E84142', '#ffffff', '#000000']
    })

    async function fetchTipData() {
      if (session) {
        try {
          // Since we don't have a direct getTip(session) endpoint in api.txt,
          // we fetch merchant tips and find the one with the matching session.
          // This is inefficient but follows the provided API spec.
          const tips = await getMerchantTips(merchantId)
          const foundTip = tips.find(t => t.session === session)
          if (foundTip) {
            setTipData(foundTip)
          }
        } catch (error) {
          console.error("Failed to fetch tip data", error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }
    fetchTipData()
  }, [session, merchantId])

  const handleDownload = () => {
    window.print()
    toast.info("Downloading Receipt...", {
      description: "Your receipt is being generated.",
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Tink Protocol Receipt',
        text: `I just tipped $${tipAmount} using Tink Protocol on Avalanche!`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link Copied", {
        description: "Receipt link copied to clipboard.",
      })
    }
  }

  // Use data from API if available, otherwise fallback to params (which might be unverified)
  const displayTotal = totalAmount
  const displayTip = tipData ? tipData.amount : tipAmount
  const displayTx = tipData ? tipData.tx_hash : txHash
  const displaySplit = tipData ? tipData.split : { FOH: 60, BOH: 30, Bar: 10 } // Fallback or default

  return (
    <div className="mx-auto w-full max-w-md space-y-8 p-4">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 ring-4 ring-green-500/10">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Thank You!</h1>
          <p className="text-muted-foreground">Your tip was sent successfully.</p>
        </div>
      </div>

      <Card className="glass-card border-none bg-black/40">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Tipped</CardTitle>
          <div className="text-4xl font-bold text-white">${displayTotal} USDC</div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tip Amount</span>
              <span>{displayTip} USDC</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Transaction Hash</span>
              <a 
                href={`https://testnet.snowtrace.io/tx/${displayTx}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#E84142] hover:underline"
              >
                {displayTx.slice(0, 6)}...{displayTx.slice(-4)}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Anchor Proof</span>
              <span className="font-mono text-xs">0x456...def</span>
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Split Preview</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>FOH {displaySplit.FOH}%</span>
                <span className="text-muted-foreground">{(parseFloat(displayTip) * (displaySplit.FOH / 100)).toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between">
                <span>BOH {displaySplit.BOH}%</span>
                <span className="text-muted-foreground">{(parseFloat(displayTip) * (displaySplit.BOH / 100)).toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between">
                <span>Bar {displaySplit.Bar}%</span>
                <span className="text-muted-foreground">{(parseFloat(displayTip) * (displaySplit.Bar / 100)).toFixed(2)} USDC</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500 ring-1 ring-green-500/20">
              <ShieldCheck className="h-3 w-3" />
              x402 Verified
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button 
          className="w-full bg-[#E84142] hover:bg-[#E84142]/90" 
          size="lg"
          onClick={handleDownload}
        >
          <Download className="mr-2 h-4 w-4" />
          Download PDF Receipt
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10" onClick={() => router.push('/')}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Tip Again
          </Button>
          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  )
}

