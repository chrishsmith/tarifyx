'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Typography, Tag } from 'antd';
import { ShieldCheck, Search, TrendingUp, Anchor, ArrowRight, DollarSign } from 'lucide-react';

const { Title, Paragraph, Text } = Typography;

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Anchor className="w-6 h-6 text-teal-600" />
            <span className="text-xl font-bold text-slate-900">Tarifyx</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing">
              <Button type="text" className="text-slate-600 font-medium">Pricing</Button>
            </Link>
            <Link href="/login">
              <Button type="text" className="text-slate-600 font-medium">Sign In</Button>
            </Link>
            <Link href="/login?mode=signup">
              <Button type="primary" className="font-medium">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <Tag color="cyan" className="px-3 py-0.5 rounded-full text-sm font-medium">27K+ HTS Codes</Tag>
          <Tag color="cyan" className="px-3 py-0.5 rounded-full text-sm font-medium">199 Countries</Tag>
          <Tag color="cyan" className="px-3 py-0.5 rounded-full text-sm font-medium">90%+ Accuracy</Tag>
        </div>
        <Title level={1} style={{ margin: 0, fontWeight: 800, color: '#0F172A', fontSize: '3.5rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          Stop overpaying<br />on import duties
        </Title>
        <Paragraph className="text-xl text-slate-500 mt-6 max-w-2xl mx-auto leading-relaxed">
          AI-powered HTS classification, landed cost calculation, and tariff optimization — so you know exactly what you owe before goods ship.
        </Paragraph>
        <div className="flex gap-4 justify-center mt-8">
          <Link href="/login?mode=signup">
            <Button type="primary" size="large" icon={<ArrowRight size={18} />} iconPosition="end" className="h-12 px-8 text-base font-semibold shadow-sm">
              Classify Your First Product
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="large" className="h-12 px-8 text-base font-medium border-slate-300 text-slate-700">
              See Pricing
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
              <ShieldCheck size={20} className="text-teal-600" />
            </div>
            <Text strong className="text-base block mb-1 text-slate-900">AI Classification</Text>
            <Text className="text-sm text-slate-500">Get the right HTS code in seconds with V10 engine accuracy.</Text>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
              <DollarSign size={20} className="text-teal-600" />
            </div>
            <Text strong className="text-base block mb-1 text-slate-900">Landed Cost</Text>
            <Text className="text-sm text-slate-500">Full duty stack: MFN + Section 301 + IEEPA + Section 232 + AD/CVD.</Text>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp size={20} className="text-teal-600" />
            </div>
            <Text strong className="text-base block mb-1 text-slate-900">Country Comparison</Text>
            <Text className="text-sm text-slate-500">Compare sourcing costs across 199 countries with real USITC data.</Text>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
              <Search size={20} className="text-teal-600" />
            </div>
            <Text strong className="text-base block mb-1 text-slate-900">Compliance</Text>
            <Text className="text-sm text-slate-500">Denied party screening, FTA qualification, and tariff monitoring.</Text>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-slate-400">
          <span>&copy; {new Date().getFullYear()} Tarifyx</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-slate-600">Pricing</Link>
            <Link href="/login" className="hover:text-slate-600">Sign In</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
