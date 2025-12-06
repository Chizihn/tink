"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Code2,
  Zap,
  Shield,
  Blocks,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TipEntryForm } from "@/components/tip-entry-form";
import { CodeBlock } from "@/components/code-block";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const installCode = `npm install @tink/widget`;

const basicUsageCode = `import { TinkWidget } from '@tink/widget';

function App() {
  return (
    <TinkWidget
      merchantId="your-merchant-id"
      network="avalanche"
      theme="dark"
    />
  );
}`;

const configCode = `<TinkWidget
  merchantId="demo-cafe"
  network="avalanche"
  theme="dark"
  aiSuggestions={true}
  customColor="#E84142"
  onPaymentSuccess={(txHash) => {
    console.log('Payment successful:', txHash);
  }}
/>`;

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Suggestions",
    description: "Smart tip recommendations based on bill amount and context",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Instant payments on Avalanche with minimal gas fees",
  },
  {
    icon: Shield,
    title: "Secure & Trustless",
    description: "Blockchain-verified transactions with full transparency",
  },
  {
    icon: Blocks,
    title: "Easy Integration",
    description: "Drop-in widget that works with any web application",
  },
];

export default function WidgetPage() {

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-black via-[#1a0a0a] to-black">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-white/5 px-4 py-20 md:py-16">
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-linear-to-r from-[#E84142]/10 via-transparent to-[#E84142]/10" />
          <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#E84142]/5 blur-[100px]" />

          <div className="container relative mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#E84142]/10 px-4 py-2 ring-1 ring-[#E84142]/20">
                <Sparkles className="h-4 w-4 text-[#E84142]" />
                <span className="text-sm font-medium text-[#E84142]">
                  AI-Powered Tip Widget
                </span>
              </div>

              <h1 className="mb-6 text-5xl font-bold tracking-tight text-white md:text-7xl">
                Tink Protocol Widget
              </h1>

              <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
                Seamlessly integrate AI-powered tipping into your application.
                Built on Avalanche for instant, low-cost payments with
                intelligent tip suggestions.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-[#E84142] text-lg font-semibold hover:bg-[#E84142]/90"
                  onClick={() =>
                    document
                      .getElementById("integration")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() =>
                    document
                      .getElementById("demo")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <Code2 className="mr-2 h-5 w-5" />
                  View Demo
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Live Demo Section */}
        <section id="demo" className="border-b border-white/5 px-4 py-12">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                See It In Action
              </h2>
              <p className="text-lg text-muted-foreground">
                Try the widget below — fully functional demo
              </p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              {/* Widget Preview */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="rounded-xl border border-white/10 bg-linear-to-b from-white/5 to-transparent p-1">
                  <div className="rounded-lg bg-black/60 p-6 backdrop-blur-xl">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
                        <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
                      </div>
                      <div className="ml-auto text-xs text-muted-foreground">
                        demo.tinkprotocol.com
                      </div>
                    </div>
                    <div className="rounded-lg bg-black/40 p-6">
                      <TipEntryForm />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Features List */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="mb-6 text-2xl font-bold">Why Choose Tink?</h3>
                  <div className="space-y-4">
                    {features.map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className="flex gap-4 rounded-lg border border-white/5 bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E84142]/10">
                          <feature.icon className="h-6 w-6 text-[#E84142]" />
                        </div>
                        <div>
                          <h4 className="mb-1 font-semibold text-white">
                            {feature.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Integration Section */}
        <section id="integration" className="px-4 py-12">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                Quick Integration
              </h2>
              <p className="text-lg text-muted-foreground">
                Get up and running in minutes with our simple API
              </p>
            </motion.div>

            <div className="space-y-8">
              {/* Integration Method Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
                  <div className="flex gap-2 rounded-lg border border-white/10 bg-white/5 p-1">
                    <button
                      className="rounded-md bg-[#E84142] px-4 py-2 text-sm font-medium text-white transition-all"
                      onClick={() => {
                        document
                          .getElementById("iframe-method")
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "nearest",
                          });
                      }}
                    >
                      iFrame Embed
                    </button>
                    <button
                      className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-white"
                      onClick={() => {
                        document
                          .getElementById("npm-method")
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "nearest",
                          });
                      }}
                    >
                      React Component
                    </button>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500 ring-1 ring-green-500/20">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                    iFrame method works now!
                  </div>
                </div>
              </motion.div>

              {/* iFrame Method */}
              <div id="iframe-method" className="scroll-mt-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="mb-8"
                >
                  <div className="mb-6 flex items-center gap-3">
                    <h3 className="text-2xl font-bold">
                      Method 1: iFrame Embed
                    </h3>
                    <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-500 ring-1 ring-green-500/20">
                      Available Now
                    </span>
                  </div>
                  <p className="mb-6 text-muted-foreground">
                    The quickest way to integrate Tink into any website. Just
                    copy and paste!
                  </p>
                </motion.div>

                {/* Step 1 - iFrame */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E84142] font-bold text-white">
                      1
                    </div>
                    <h3 className="text-xl font-semibold">
                      Add the iframe to your site
                    </h3>
                  </div>
                  <CodeBlock
                    code={`<!-- Add this anywhere in your HTML -->
<iframe 
  src="https://tink.protocol/embed?merchant=demo-cafe"
  width="400"
  height="600"
  frameborder="0"
  style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);"
></iframe>`}
                    language="html"
                    title="iFrame Integration"
                  />
                </motion.div>

                {/* Step 2 - iFrame */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mt-6"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E84142] font-bold text-white">
                      2
                    </div>
                    <h3 className="text-xl font-semibold">
                      Customize with URL parameters
                    </h3>
                  </div>
                  <CodeBlock
                    code={`<!-- Customize merchant, bill amount, etc. -->
<iframe 
  src="https://tink.protocol/embed?merchant=your-merchant-id&bill=25.00"
  width="400"
  height="600"
  frameborder="0"
></iframe>`}
                    language="html"
                    title="Custom Parameters"
                  />
                </motion.div>

                {/* Success State - iFrame */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mt-6 rounded-xl border border-green-500/20 bg-green-500/5 p-6"
                >
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500" />
                    <div>
                      <h4 className="mb-2 font-semibold text-white">
                        You&apos;re all set!
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Your widget is live and ready to accept tips. Works on
                        any website platform!
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Divider */}
              <Separator className="my-12 bg-white/10" />

              {/* NPM Method */}
              <div id="npm-method" className="scroll-mt-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="mb-8"
                >
                  <div className="mb-6 flex items-center gap-3">
                    <h3 className="text-2xl font-bold">
                      Method 2: React Component
                    </h3>
                    <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-500 ring-1 ring-yellow-500/20">
                      Coming Soon
                    </span>
                  </div>
                  <p className="mb-6 text-muted-foreground">
                    For React/Next.js applications. Full TypeScript support with
                    custom styling.
                  </p>
                </motion.div>

                {/* Step 1 - NPM */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E84142] font-bold text-white">
                      1
                    </div>
                    <h3 className="text-xl font-semibold">
                      Install the package
                    </h3>
                  </div>
                  <CodeBlock code={installCode} language="bash" />
                </motion.div>

                {/* Step 2 - NPM */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mt-6"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E84142] font-bold text-white">
                      2
                    </div>
                    <h3 className="text-xl font-semibold">Add to your app</h3>
                  </div>
                  <CodeBlock
                    code={basicUsageCode}
                    language="tsx"
                    title="Basic Usage"
                  />
                </motion.div>

                {/* Step 3 - NPM */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mt-6"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E84142] font-bold text-white">
                      3
                    </div>
                    <h3 className="text-xl font-semibold">
                      Customize (optional)
                    </h3>
                  </div>
                  <CodeBlock
                    code={configCode}
                    language="tsx"
                    title="Advanced Configuration"
                  />
                </motion.div>
              </div>
            </div>

            <Separator className="my-12 bg-white/10" />

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h3 className="mb-4 text-2xl font-bold">About Tink Protocol</h3>
              <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
                Tink Protocol is an AI-powered tipping platform built on
                Avalanche. We combine machine learning with blockchain
                technology to provide intelligent, transparent, and instant tip
                processing for merchants and service providers worldwide.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5 hover:bg-white/10"
                >
                  View Documentation
                </Button>
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5 hover:bg-white/10"
                >
                  GitHub Repository
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
