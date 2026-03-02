'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Typography, Tag } from 'antd';
import { ShieldCheck, TrendingUp, Anchor, BarChart3, Globe, Zap } from 'lucide-react';

const { Title, Paragraph, Text } = Typography;

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-teal-600 p-2 rounded-lg">
              <Anchor className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-slate-900">Tarifyx</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-slate-600 hover:text-slate-900 text-sm font-medium hidden sm:block">
              Pricing
            </Link>
            <Link href="/login">
              <Button type="default" className="border-slate-200 text-slate-700 hover:text-teal-600 font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/login?mode=signup">
              <Button type="primary" className="bg-teal-600 hover:bg-teal-700 border-none font-medium">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 sm:py-24">
        <div className="relative z-10 flex flex-col items-center gap-12 max-w-4xl text-center">

          {/* Hero Section */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-white border border-slate-200 shadow-sm p-4 rounded-2xl">
                <Anchor className="w-12 h-12 text-teal-600" />
              </div>
            </div>
            <Title level={1} style={{ margin: 0, fontWeight: 800, color: '#18181B', fontSize: '3.5rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Stop overpaying <br className="hidden sm:block" />on import duties
            </Title>
            <Paragraph className="text-xl text-slate-600 mt-6 max-w-2xl font-light leading-relaxed">
              AI-powered HTS classification, landed cost calculation, and country comparison — so you know exactly what you&apos;ll pay before you ship.
            </Paragraph>
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <Tag className="bg-white border border-slate-200 shadow-sm px-4 py-1.5 rounded-full text-teal-700 font-medium text-sm">27K+ HTS Codes</Tag>
              <Tag className="bg-white border border-slate-200 shadow-sm px-4 py-1.5 rounded-full text-amber-700 font-medium text-sm">199 Countries</Tag>
              <Tag className="bg-white border border-slate-200 shadow-sm px-4 py-1.5 rounded-full text-indigo-700 font-medium text-sm">90%+ Accuracy</Tag>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/login?mode=signup">
              <Button type="primary" size="large" icon={<Zap size={20} />} className="h-14 px-8 text-lg bg-teal-600 hover:bg-teal-700 border-none shadow-sm">
                Start Free — No Card Required
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="large" icon={<BarChart3 size={20} />} className="h-14 px-8 text-lg bg-white border border-slate-200 shadow-sm hover:border-teal-300">
                See Pricing
              </Button>
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 w-full">
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 text-left group">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform text-teal-600">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <Text strong className="text-lg block mb-1">AI HTS Classification</Text>
                  <Text type="secondary" className="text-sm">Describe your product, get the HTS code in seconds. Powered by Grok AI with CBP ruling validation.</Text>
                </div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 text-left group">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform text-amber-600">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <Text strong className="text-lg block mb-1">Landed Cost Calculator</Text>
                  <Text type="secondary" className="text-sm">Full duty breakdown: MFN + Section 301 + IEEPA + Section 232 + AD/CVD + MPF + HMF.</Text>
                </div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 text-left group">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform text-teal-600">
                  <Globe size={24} />
                </div>
                <div>
                  <Text strong className="text-lg block mb-1">Country Comparison</Text>
                  <Text type="secondary" className="text-sm">Compare landed costs across 199 countries. See exactly where sourcing is cheapest.</Text>
                </div>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div className="text-center pt-4">
            <Text type="secondary" className="text-sm">
              Built for SMB importers, customs brokers, and sourcing teams.
            </Text>
          </div>
        </div>
      </div>
    </main>
  );
}
