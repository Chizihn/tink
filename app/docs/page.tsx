"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Book,
  Code2,
  Zap,
  Shield,
  Sparkles,
  Wallet,
  ArrowRight,
  FileCode,
  Blocks,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/code-block";

const quickStartCode = `// 1. Install dependencies
npm install wagmi viem @rainbow-me/rainbowkit

// 2. Set up your merchant account
const merchantConfig = {
  merchantId: "your-merchant-id",
  walletAddress: "0x...",
  name: "Your Business Name"
};`;

const apiReferenceCode = `// Initialize Tink SDK
import { TinkSDK } from '@tink/sdk';

const tink = new TinkSDK({
  apiKey: process.env.TINK_API_KEY,
  network: 'avalanche-fuji', // or 'avalanche-mainnet'
});

// Create a tip session
const session = await tink.createTipSession({
  merchantId: 'demo-cafe',
  billAmount: 25.00,
  currency: 'USDC',
  aiSuggestions: true
});

// Get AI-powered tip suggestion
const suggestion = await tink.getAISuggestion({
  billAmount: 25.00,
  context: {
    serviceQuality: 'excellent',
    restaurantType: 'casual-dining'
  }
});`;

const webhookCode = `// Listen for payment confirmations
app.post('/webhooks/tink', async (req, res) => {
  const { sessionId, txHash, amount, tipAmount } = req.body;
  
  // Verify webhook signature
  const isValid = tink.verifyWebhook(req.headers['x-tink-signature']);
  
  if (isValid) {
    // Process payment in your system
    await processPayment({
      sessionId,
      transactionHash: txHash,
      totalAmount: amount,
      tip: tipAmount
    });
    
    res.status(200).send('OK');
  }
});`;

export default function DocsPage() {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-black via-[#1a0a0a] to-black">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-white/5 px-4 py-20 md:py-28">
          <div className="absolute inset-0 bg-linear-to-r from-[#E84142]/10 via-transparent to-[#E84142]/10" />
          <div className="absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[#E84142]/5 blur-[100px]" />

          <div className="container relative mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#E84142]/10 px-4 py-2 ring-1 ring-[#E84142]/20">
                <Book className="h-4 w-4 text-[#E84142]" />
                <span className="text-sm font-medium text-[#E84142]">
                  Developer Documentation
                </span>
              </div>

              <h1 className="mb-6 bg-linear-to-r from-white via-white to-white/60 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl">
                Tink Protocol Docs
              </h1>

              <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                Complete API reference, integration guides, and examples for
                building with Tink&apos;s AI-powered tipping platform.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-[#E84142] text-lg font-semibold hover:bg-[#E84142]/90"
                  onClick={() =>
                    document
                      .getElementById("quick-start")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Quick Start
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() =>
                    document
                      .getElementById("api-reference")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <Code2 className="mr-2 h-5 w-5" />
                  API Reference
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick Start */}
        <section
          id="quick-start"
          className="border-b border-white/5 px-4 py-20"
        >
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-4xl font-bold">Quick Start</h2>
              <p className="text-lg text-muted-foreground">
                Get started with Tink in under 5 minutes
              </p>
            </motion.div>

            <div className="space-y-8">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E84142] font-bold text-white">
                    1
                  </div>
                  <h3 className="text-xl font-semibold">
                    Create a Merchant Account
                  </h3>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                  <p className="mb-4 text-muted-foreground">
                    Sign up on the Tink dashboard and get your API credentials.
                  </p>
                  <Button className="bg-[#E84142] hover:bg-[#E84142]/90">
                    Create Account
                  </Button>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E84142] font-bold text-white">
                    2
                  </div>
                  <h3 className="text-xl font-semibold">Install & Configure</h3>
                </div>
                <CodeBlock
                  code={quickStartCode}
                  language="bash"
                  title="Setup"
                />
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E84142] font-bold text-white">
                    3
                  </div>
                  <h3 className="text-xl font-semibold">
                    Integrate the Widget
                  </h3>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                  <p className="mb-4 text-muted-foreground">
                    Choose your integration method based on your stack:
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Button
                      variant="outline"
                      className="h-auto flex-col gap-2 border-white/10 bg-white/5 py-4"
                    >
                      <FileCode className="h-6 w-6 text-[#E84142]" />
                      <span>iFrame Embed</span>
                      <span className="text-xs text-muted-foreground">
                        Any website
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto flex-col gap-2 border-white/10 bg-white/5 py-4"
                    >
                      <Blocks className="h-6 w-6 text-[#E84142]" />
                      <span>React Component</span>
                      <span className="text-xs text-muted-foreground">
                        Coming soon
                      </span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section
          id="api-reference"
          className="border-b border-white/5 px-4 py-20"
        >
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-4xl font-bold">API Reference</h2>
              <p className="text-lg text-muted-foreground">
                Complete SDK and REST API documentation
              </p>
            </motion.div>

            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="mb-4 text-2xl font-semibold">Core Methods</h3>
                <CodeBlock
                  code={apiReferenceCode}
                  language="typescript"
                  title="SDK Usage"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="mb-4 text-2xl font-semibold">Webhooks</h3>
                <CodeBlock
                  code={webhookCode}
                  language="typescript"
                  title="Payment Webhooks"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-4 py-20">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-4xl font-bold">Core Features</h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to build amazing tipping experiences
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Sparkles,
                  title: "AI Suggestions",
                  description:
                    "Machine learning powered tip recommendations based on bill amount, service quality, and context.",
                },
                {
                  icon: Zap,
                  title: "Instant Payments",
                  description:
                    "Lightning-fast transactions on Avalanche with minimal gas fees and sub-second confirmation.",
                },
                {
                  icon: Shield,
                  title: "Secure & Trustless",
                  description:
                    "Blockchain-verified transactions with full transparency. No intermediaries required.",
                },
                {
                  icon: Wallet,
                  title: "Multi-Wallet Support",
                  description:
                    "Works with MetaMask, WalletConnect, Coinbase Wallet, and all major Web3 wallets.",
                },
                {
                  icon: Code2,
                  title: "Developer Friendly",
                  description:
                    "Clean APIs, comprehensive docs, and SDKs for popular frameworks.",
                },
                {
                  icon: Blocks,
                  title: "Customizable",
                  description:
                    "White-label solution with full branding control and custom styling options.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#E84142]/10">
                    <feature.icon className="h-6 w-6 text-[#E84142]" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="border-t border-white/5 px-4 py-20">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-4 text-3xl font-bold">Need Help?</h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Our team is here to support you every step of the way
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5 hover:bg-white/10"
                >
                  Join Discord
                </Button>
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5 hover:bg-white/10"
                >
                  Email Support
                </Button>
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5 hover:bg-white/10"
                >
                  GitHub Issues
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
