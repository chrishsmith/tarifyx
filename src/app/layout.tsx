import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import theme from '@/theme/themeConfig';
import StyledComponentsRegistry from '@/lib/antd/registry';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tarifyx',
  description: 'AI-powered import intelligence — HTS classification, landed cost, and tariff optimization',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="font-sans antialiased">
        <StyledComponentsRegistry>
          <ConfigProvider theme={theme}>
            <AntdRegistry>{children}</AntdRegistry>
          </ConfigProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
