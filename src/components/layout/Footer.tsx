import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy-deep text-white/50 py-12 px-6 md:px-[6%]">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
        <div className="col-span-2 md:col-span-1">
          <svg width="28" height="28" viewBox="0 0 88 88" fill="none" className="mb-3">
            <rect x="4"  y="6"  width="28" height="10" rx="1.5" fill="white"/>
            <rect x="18" y="6"  width="14" height="30" rx="1.5" fill="white"/>
            <rect x="4"  y="28" width="28" height="10" rx="1.5" fill="white"/>
            <rect x="18" y="28" width="14" height="30" rx="1.5" fill="white"/>
            <rect x="4"  y="50" width="28" height="10" rx="1.5" fill="white"/>
            <rect x="38" y="6"  width="20" height="10" rx="1.5" fill="white"/>
            <rect x="44" y="6"  width="8"  height="54" rx="1.5" fill="white"/>
            <rect x="62" y="6"  width="22" height="10" rx="1.5" fill="white"/>
            <rect x="68" y="6"  width="8"  height="54" rx="1.5" fill="white"/>
            <rect x="4"  y="74" width="80" height="10" rx="3"   fill="#00A8A8"/>
          </svg>
          <p className="text-xs leading-relaxed">La primera plataforma digital del volleyball en español.</p>
        </div>
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3">Plataforma</h4>
          <ul className="space-y-2 text-xs">
            {[["Academia", "/academia"], ["Comunidad", "/comunidad"], ["Podcast", "/podcast"], ["Eventos", "/eventos"]].map(([l, h]) => (
              <li key={h}><Link href={h} className="hover:text-teal transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3">Legal</h4>
          <ul className="space-y-2 text-xs">
            {[["Privacidad", "/privacidad"], ["Términos", "/terminos"], ["Cookies", "/cookies"]].map(([l, h]) => (
              <li key={h}><Link href={h} className="hover:text-teal transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3">Contacto</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="mailto:hola@3touchtribe.com" className="hover:text-teal transition-colors">hola@3touchtribe.com</a></li>
            <li><a href="https://instagram.com/3touchtribe" className="hover:text-teal transition-colors">@3touchtribe</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <span>© {new Date().getFullYear()} 3Touch Tribe. Todos los derechos reservados.</span>
        <span className="text-teal font-bold">Hecho con ❤️ para la comunidad volleybolera</span>
      </div>
    </footer>
  );
}
