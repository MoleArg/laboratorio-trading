import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CONTENT } from '@/components/content';
import LabMount from '@/components/LabMount';
import ModuleHead from '@/components/ModuleHead';
import { BY_ID, MODULES, modHref } from '@/lib/site';

type Props = { params: Promise<{ mod: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return MODULES.map(m => ({ mod: m.id }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mod } = await params, m = BY_ID[mod];
  if (!m) return {};
  return { title: m.name, description: m.leadText.slice(0, 160), openGraph: { title: `${m.title} · Laboratorio de Trading`, description: m.leadText.slice(0, 200) } };
}

export default async function ModulePage({ params }: Props) {
  const { mod } = await params, m = BY_ID[mod], Body = CONTENT[mod];
  if (!m || !Body) notFound();
  const i = MODULES.findIndex(x => x.id === mod), prev = i > 0 ? MODULES[i - 1] : null, next = MODULES[i + 1] || null;
  return (
    <section className="module active" id={'m-' + mod} data-mod={mod}>
      <ModuleHead mod={mod} />
      <Body />
      <div className="next">
        {prev ? <Link className="btn" href={modHref(prev.id)}>← {prev.name}</Link> : <Link className="btn" href="/">← Inicio</Link>}
        {next && <Link className="btn primary" href={modHref(next.id)}>Siguiente: {next.name} →</Link>}
      </div>
      <LabMount mod={mod} />
    </section>
  );
}
