import type { Metadata, Viewport } from 'next';
import Shell from '@/components/Shell';
import './globals.css';
import './next.css';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  title: { default: 'Laboratorio de Trading interactivo', template: '%s · Laboratorio de Trading' },
  description: 'Academia interactiva de trading en español: velas, soportes, estructura, Fibonacci, indicadores, liquidez, Smart Money, gestión del riesgo, repaso rápido, simulador vela a vela y examen final.',
  icons: { icon: BASE + '/favicon.svg' },
  openGraph: { title: 'Laboratorio de Trading interactivo', description: 'Price action, indicadores y Smart Money con gráficos que puedes mover, un simulador de trading y un examen final.', type: 'website' }
};
export const viewport: Viewport = { themeColor: '#0b0e14', width: 'device-width', initialScale: 1 };

// Tema antes del primer pintado (evita el destello del tema equivocado).
const THEME = "try{var t=localStorage.getItem('lt.theme')||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: THEME }} /></head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
