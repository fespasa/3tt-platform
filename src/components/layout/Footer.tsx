import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative py-16 px-6 md:px-[6%]" style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)" }}>
      {/* Glow accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-teal/20 to-transparent" />

      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <Image src="/images/logo-3tt.svg" alt="3TT" width={24} height={29} />
            <span className="text-foreground font-display text-lg tracking-wider">3TOUCH TRIBE</span>
          </div>
          <p className="text-muted text-xs leading-relaxed max-w-[200px]">
            La primera plataforma digital del volleyball en español.
          </p>
        </div>

        <div>
          <h4 className="text-secondary text-xs font-bold uppercase tracking-[0.2em] mb-4">Plataforma</h4>
          <ul className="space-y-2.5 text-xs">
            {[["Academia", "/academia"], ["Comunidad", "/comunidad"], ["Podcast", "/podcast"], ["Eventos", "/eventos"]].map(([l, h]) => (
              <li key={h}><Link href={h} className="text-muted hover:text-teal transition-colors duration-300">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-secondary text-xs font-bold uppercase tracking-[0.2em] mb-4">Legal</h4>
          <ul className="space-y-2.5 text-xs">
            {[["Privacidad", "/privacidad"], ["Términos", "/terminos"], ["Cookies", "/cookies"]].map(([l, h]) => (
              <li key={h}><Link href={h} className="text-muted hover:text-teal transition-colors duration-300">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-secondary text-xs font-bold uppercase tracking-[0.2em] mb-4">Contacto</h4>
          <ul className="space-y-2.5 text-xs">
            <li><a href="mailto:hola@3touchtribe.com" className="text-muted hover:text-teal transition-colors duration-300">hola@3touchtribe.com</a></li>
            <li><a href="https://instagram.com/3touchtribe" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-teal transition-colors duration-300">@3touchtribe</a></li>
          </ul>
        </div>
      </div>

      <div className="divider-glow" />

      <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <span className="text-muted">&copy; {new Date().getFullYear()} 3Touch Tribe. Todos los derechos reservados.</span>
        <span className="text-teal/40 font-semibold">Hecho con pasión para la comunidad volleybolera</span>
      </div>
    </footer>
  );
}
