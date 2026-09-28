import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'Ragnarok Urgent Call Pre-Order Manager | ROC & RO Sales Tracker',
  description:
    'ระบบบันทึกและสรุปรายรับ-รายจ่าย / บริหารสต็อกสินค้าจากงาน Ragnarok Urgent Call Pre-Order (Figure, Keycap, โค้ดไข่สุ่ม ROC & RO)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <body className="antialiased selection:bg-amber-500 selection:text-black">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
