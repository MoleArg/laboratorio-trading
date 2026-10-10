import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="module active" style={{ padding: '60px 0' }}>
      <div className="mod-head"><div className="kicker">Error 404</div><h2>Esta página no existe</h2><p className="lead">Puede que el enlace sea viejo. Vuelve a la portada o busca con <kbd>Ctrl K</kbd>.</p></div>
      <Link className="btn primary" href="/">Ir al inicio</Link>
    </section>
  );
}
