import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-lg font-extrabold tracking-tight">
            Play<span className="text-amber-400">Board</span>
          </p>
          <p className="text-sm text-slate-400">Jouez · Partagez · Profitez</p>
          <p className="text-xs text-slate-500">
            Jeux de société en local, multijoueurs sur un même appareil.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300" aria-label="Liens de pied de page">
          <Link href="/" className="hover:text-white">Accueil</Link>
          <Link href="/jeux" className="hover:text-white">Catalogue des jeux</Link>
          <Link href="/jeux/fanorina-7" className="hover:text-white">Fanorina 7</Link>
          <Link href="/regles" className="hover:text-white">Règles</Link>
        </nav>
      </div>
      <div className="border-t border-slate-800/60 py-4 text-center text-xs text-slate-500">
        © PlayBoard — tous droits réservés.
      </div>
    </footer>
  );
}
