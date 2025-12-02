"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { LucideProps } from "lucide-react";
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  Download,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getMerchantTips, saveSplit, type TipEvent } from "@/lib/api";

interface Stat {
  title: string;
  value: string;
  change?: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
}

export function MerchantDashboard() {
  const params = useParams();
  const merchantId = params.merchantId as string;
  const [tips, setTips] = React.useState<TipEvent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Split State
  const [split, setSplit] = React.useState({ foh: 60, boh: 30, bar: 10 });

  React.useEffect(() => {
    async function loadTips() {
      try {
        const data = await getMerchantTips(merchantId);
        setTips(data);
      } catch (error) {
        console.error("Failed to load tips", error);
        // Keep mock data or show error?
        // For now, let's leave it empty or fallback if we had one.
      } finally {
        setIsLoading(false);
      }
    }
    loadTips();
  }, [merchantId]);

  // Calculate stats from tips
  const totalTips = tips.reduce((acc, tip) => acc + parseFloat(tip.amount), 0);
  const confirmedTips = tips.filter((t) => t.status === "confirmed");
  const totalConfirmed = confirmedTips.reduce(
    (acc, tip) => acc + parseFloat(tip.amount),
    0
  );
  
  // Mocking some stats based on real data where possible
  const stats: { [key: string]: Stat } = {
    today: {
      title: "Total Tips Today",
      value: `$${totalConfirmed.toFixed(2)}`, // Simplified: using total for now
      change: "+8.2%",
      icon: DollarSign,
    },
    week: {
      title: "This Week",
      value: "$972.15", // Mock
      change: "+15.1%",
      icon: TrendingUp,
    },
    allTime: { title: "All Time", value: `$${totalConfirmed.toFixed(2)}`, icon: CreditCard },
    count: {
      title: "Number of Tips",
      value: tips.length.toString(),
      change: `+${tips.length}`,
      icon: Users,
    },
  };

  const handleSplitChange = (key: "foh" | "boh" | "bar", value: number) => {
    const otherKeys = (["foh", "boh", "bar"] as const).filter((k) => k !== key);
    const oldValue = split[key];
    const diff = value - oldValue;

    const newSplit = { ...split, [key]: value };

    // Distribute the difference proportionally to the other two
    const otherTotal = otherKeys.reduce((sum, k) => sum + split[k], 0);
    if (otherTotal > 0) {
      let remainder = 0;
      otherKeys.forEach((k) => {
        const proportion = split[k] / otherTotal;
        const change = Math.round(diff * proportion);
        newSplit[k] -= change;
        remainder += diff * proportion - change;
      });
      // Adjust for rounding errors
      newSplit[otherKeys[0]] -= Math.round(remainder);
    }

    // Ensure total is 100
    const total = Object.values(newSplit).reduce((sum, v) => sum + v, 0);
    newSplit[key] -= total - 100;

    setSplit(newSplit);
  };

  const handleUpdateSplit = async () => {
    try {
      await saveSplit(merchantId, {
        FOH: split.foh,
        BOH: split.boh,
        Bar: split.bar,
      });
      toast.success("Configuration Updated", {
        description: "New tip split configuration saved.",
      });
    } catch (error) {
      console.error(error);
      toast.error("Update Failed", {
        description: "Could not save split configuration.",
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const handleExportCSV = () => {
    const headers = ["Session", "Date", "Amount", "Tx Hash", "Status"];
    const rows = tips.map((tip) => [
      tip.session,
      tip.created_at,
      tip.amount,
      tip.tx_hash,
      tip.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tips_export_${merchantId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Export Successful", {
      description: "Your CSV file has been downloaded.",
    });
  };

  return (
    <motion.div
      className="space-y-12 p-4 md:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <div className="text-sm text-muted-foreground">
            Merchants / {merchantId}
          </div>
          <h1 className="text-3xl font-bold tracking-tight capitalize">
            {merchantId.replace("-", " ")} Dashboard
          </h1>
        </div>
        <Button 
          className="bg-[#E84142] hover:bg-[#E84142]/90"
          onClick={handleExportCSV}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </motion.div>

      <motion.div
        variants={containerVariants}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {Object.values(stats).map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="glass-card border-none bg-black/40 transition-all hover:bg-black/60 hover:shadow-2xl hover:shadow-[#E84142]/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change && (
                  <p className="text-xs text-green-500 font-medium">
                    {stat.change}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 gap-8 lg:grid-cols-5"
      >
        <motion.div variants={itemVariants} className="lg:col-span-3 space-y-4">
          <h2 className="text-xl font-semibold">Recent Tips</h2>
          <Card className="glass-card border-none bg-black/40">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead>Session</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Tx Hash</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {isLoading ? "Loading tips..." : "No tips found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    tips.map((tip) => (
                      <TableRow
                        key={tip.session}
                        className="border-white/10 hover:bg-white/5"
                      >
                        <TableCell className="font-mono text-xs">
                          {tip.session}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {new Date(tip.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${tip.amount}
                        </TableCell>
                        <TableCell>
                          <a
                            href={`https://testnet.snowtrace.io/tx/${tip.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 font-mono text-xs text-[#E84142] hover:underline"
                          >
                            {tip.tx_hash.slice(0, 6)}...{tip.tx_hash.slice(-4)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              tip.status === "confirmed"
                                ? "border-green-500/40 bg-green-500/10 text-green-400"
                                : tip.status === "pending"
                                ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
                                : "border-red-500/40 bg-red-500/10 text-red-400"
                            }
                          >
                            {tip.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dispute?session=${tip.session}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-muted-foreground hover:bg-white/10 hover:text-white"
                            >
                              <AlertTriangle className="mr-1.5 h-3 w-3" />
                              Dispute
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Tip Split Configuration</h2>
          <Card className="glass-card border-none bg-black/40">
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Front of House</span>
                    <span className="font-bold">{split.foh}%</span>
                  </div>
                  <Slider
                    value={[split.foh]}
                    max={100}
                    step={1}
                    onValueChange={(val) => handleSplitChange("foh", val[0])}
                    className="[&>.relative>.absolute]:bg-[#E84142]"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Back of House</span>
                    <span className="font-bold">{split.boh}%</span>
                  </div>
                  <Slider
                    value={[split.boh]}
                    max={100}
                    step={1}
                    onValueChange={(val) => handleSplitChange("boh", val[0])}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Bar</span>
                    <span className="font-bold">{split.bar}%</span>
                  </div>
                  <Slider
                    value={[split.bar]}
                    max={100}
                    step={1}
                    onValueChange={(val) => handleSplitChange("bar", val[0])}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-white/5 p-4 text-sm space-y-2">
                <p className="text-muted-foreground text-xs">
                  If a <span className="text-white font-bold">$10.00</span> tip
                  comes in:
                </p>
                <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-xs">
                  <span>FOH gets</span>
                  <span className="text-right text-green-400 font-bold">
                    ${((10 * split.foh) / 100).toFixed(2)}
                  </span>
                  <span>BOH gets</span>
                  <span className="text-right text-green-400 font-bold">
                    ${((10 * split.boh) / 100).toFixed(2)}
                  </span>
                  <span>Bar gets</span>
                  <span className="text-right text-green-400 font-bold">
                    ${((10 * split.bar) / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                className="w-full bg-[#E84142] hover:bg-[#E84142]/90"
                onClick={handleUpdateSplit}
              >
                Update Split
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

