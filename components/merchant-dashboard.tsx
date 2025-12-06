"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

export function MerchantDashboard() {
  const params = useParams();
  const merchantId = params.merchantId as string;
  const [tips, setTips] = React.useState<TipEvent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [split, setSplit] = React.useState({ foh: 60, boh: 30, bar: 10 });

  React.useEffect(() => {
    async function loadTips() {
      try {
        const data = await getMerchantTips(merchantId);
        setTips(data);
      } catch (error) {
        console.error("Failed to load tips", error);
        toast.error("Failed to load tips");
      } finally {
        setIsLoading(false);
      }
    }
    loadTips();
  }, [merchantId]);

  const totalConfirmed = tips
    .filter((t) => t.status === "confirmed")
    .reduce((acc, tip) => acc + parseFloat(tip.amount), 0);

  const stats = [
    {
      title: "Total Tips Today",
      value: `$${totalConfirmed.toFixed(2)}`,
      change: "+12.3%",
      icon: DollarSign,
      color: "text-green-400",
    },
    {
      title: "This Week",
      value: "$2,847.32",
      change: "+18.7%",
      icon: TrendingUp,
      color: "text-blue-400",
    },
    {
      title: "All Time Earnings",
      value: "$18,492.10",
      change: null,
      icon: CreditCard,
      color: "text-purple-400",
    },
    {
      title: "Total Tips Received",
      value: tips.length.toString(),
      change: null,
      icon: Users,
      color: "text-orange-400",
    },
  ];

  const handleSplitChange = (key: "foh" | "boh" | "bar", value: number) => {
    const newSplit = { ...split, [key]: value };
    const total = newSplit.foh + newSplit.boh + newSplit.bar;

    if (total !== 100) {
      const diff = total - 100;
      const otherKeys = (["foh", "boh", "bar"] as const).filter(
        (k) => k !== key
      );
      const adjustEach = diff / otherKeys.length;
      otherKeys.forEach((k) => {
        newSplit[k] = Math.max(0, Math.round(newSplit[k] - adjustEach));
      });
      // Final correction
      newSplit[key] = 100 - (newSplit.boh + newSplit.bar);
    }

    setSplit(newSplit);
  };

  const handleUpdateSplit = async () => {
    try {
      await saveSplit(merchantId, {
        FOH: split.foh,
        BOH: split.boh,
        Bar: split.bar,
      });
      toast.success("Tip split updated successfully");
    } catch {
      toast.error("Failed to update split");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Session", "Date", "Amount", "Tx Hash", "Status"];
    const rows = tips.map((tip) => [
      tip.session,
      new Date(tip.created_at).toLocaleDateString(),
      tip.amount,
      tip.tx_hash,
      tip.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${merchantId}-tips-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-black via-zinc-950 to-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <p className="text-sm text-zinc-400">Merchant Dashboard</p>
            <h1 className="mt-1 text-4xl font-bold capitalize tracking-tight">
              {merchantId.replace(/-/g, " ")}
            </h1>
          </div>
          <Button onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export Tips
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm transition-all hover:bg-zinc-900/80">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  {stat.change && (
                    <p className="mt-1 text-xs text-green-400">
                      {stat.change} from last week
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Tips Table */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-2xl font-semibold">Recent Tips</h2>
            <Card className="overflow-hidden border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 bg-zinc-900/80">
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Tx</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-8 text-center text-zinc-500"
                        >
                          Loading tips...
                        </TableCell>
                      </TableRow>
                    ) : tips.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-12 text-center text-zinc-500"
                        >
                          No tips received yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      tips.slice(0, 10).map((tip) => (
                        <TableRow
                          key={tip.session}
                          className="border-zinc-800 transition-colors hover:bg-zinc-800/50"
                        >
                          <TableCell className="text-sm text-zinc-400">
                            {new Date(tip.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium">
                            ${tip.amount}
                          </TableCell>
                          <TableCell>
                            <a
                              href={`https://testnet.snowtrace.io/tx/${tip.tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs text-red-500 hover:underline"
                            >
                              {tip.tx_hash.slice(0, 8)}...
                              {tip.tx_hash.slice(-6)}
                              <ExternalLink className="ml-1 inline h-3 w-3" />
                            </a>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                tip.status === "confirmed"
                                  ? "border-green-500/50 bg-green-500/10 text-green-400"
                                  : tip.status === "pending"
                                  ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
                                  : "border-red-500/50 bg-red-500/10 text-red-400"
                              }
                            >
                              {tip.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dispute?session=${tip.session}`}>
                                <AlertTriangle className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Tip Split Configuration */}
          <div>
            <h2 className="mb-4 text-2xl font-semibold">
              Tip Split Configuration
            </h2>
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
              <CardContent className="space-y-6 pt-6">
                {(["foh", "boh", "bar"] as const).map((role) => (
                  <div key={role} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">
                        {role === "foh"
                          ? "Front of House"
                          : role === "boh"
                          ? "Back of House"
                          : "Bar"}
                      </span>
                      <span className="text-2xl font-bold text-red-500">
                        {split[role]}%
                      </span>
                    </div>
                    <Slider
                      value={[split[role]]}
                      onValueChange={(v) => handleSplitChange(role, v[0])}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                ))}

                <div className="rounded-xl border border-zinc-800 bg-black/40 p-5">
                  <p className="mb-3 text-sm text-zinc-400">
                    Example:{" "}
                    <span className="font-bold text-white">$10.00 tip</span>{" "}
                    splits as:
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>FOH</span>
                      <span className="font-bold text-green-400">
                        ${((10 * split.foh) / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>BOH</span>
                      <span className="font-bold text-green-400">
                        ${((10 * split.boh) / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bar</span>
                      <span className="font-bold text-green-400">
                        ${((10 * split.bar) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button onClick={handleUpdateSplit} className="w-full ">
                  Save Split Configuration
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
