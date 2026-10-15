import Link from "next/link";

export default function ReglesMonopolyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">Règles — Monopoly Premium</h1>
        <Link href="/jeux/monopoly" className="rounded-xl border border-slate-600 px-4 py-2 hover:bg-slate-800">
          ← Configurer une partie
        </Link>
      </header>

      <section className="space-y-3 leading-relaxed text-slate-200">
        <h2 className="text-xl font-bold text-amber-300">But du jeu</h2>
        <p>
          De <strong>2 à 8 joueurs</strong> sur le même appareil. Chacun démarre avec{' '}
          <strong>1 500 F</strong>. Le gagnant est le dernier joueur non <strong>faili</strong> : il
          faut ruiner les adversaires en leur faisant payer des loyers, tout en gardant un patrimoine
          suffisant.
        </p>

        <h2 className="text-xl font-bold text-amber-300">Déroulement d&apos;un tour</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Le joueur actif lance les deux dés et avance son pion case par case (dans le sens horaire).</li>
          <li>Il paie l&apos;effet de la case d&apos;arrivée : loyer, achat, impôt, carte Chance ou Caisse de communauté, prison.</li>
          <li>Il gère ensuite ses biens (construire, vendre, hypothéquer, échanger), puis passe la main.</li>
          <li>Un <strong>double</strong> autorise un nouveau lancer après résolution. Trois doubles consécutifs envoient en prison.</li>
          <li>Passer par <strong>Départ</strong> rapporte 200 F (une seule fois par tour de plateau).</li>
        </ul>

        <h2 className="text-xl font-bold text-amber-300">Propriétés et loyers</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Case non achetée : le joueur peut <strong>acheter</strong> au prix affiché ou <strong>refuser</strong> — la case part alors <strong>obligatoirement aux enchères</strong> entre tous les joueurs non faillis.</li>
          <li>Le loyer d&apos;une rue est <strong>doublé</strong> si le joueur possède tout le groupe de couleur et qu&apos;aucune maison n&apos;est construite.</li>
          <li>Gares : loyer selon le nombre de gares possédées (25 / 50 / 100 / 200 F). Compagnies : dés × 4 (une) ou × 10 (les deux).</li>
        </ul>

        <h2 className="text-xl font-bold text-amber-300">Maisons et hôtels</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Construction possible uniquement en <strong>monopole complet</strong>, aucune rue du groupe hypothéquée. La banque dispose de <strong>32 maisons</strong> et <strong>12 hôtels</strong>.</li>
          <li><strong>Construction équilibrée</strong> : on ne dépasse jamais de plus d&apos;une maison le niveau le plus bas du groupe.</li>
          <li><strong>Vente équilibrée</strong> : on vend d&apos;abord sur la rue la plus construite. Une maison se revend à la moitié de son coût, un hôtel à 2,5 fois son coût.</li>
          <li>Cinq maisons sont remplacées par un <strong>hôtel</strong> (loyer maximal).</li>
        </ul>

        <h2 className="text-xl font-bold text-amber-300">Hypothèques, dettes et faillite</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Une propriété sans bâtiment peut être <strong>hypothéquée</strong> (la moitié du prix). La déhypothéquer coûte cette valeur + 10 % d&apos;intérêt.</li>
          <li>Un paiement impossible déclenche la phase <strong>endettement</strong> : vendre, hypothéquer ou échanger jusqu&apos;à réunir la somme — sinon, <strong>faillite</strong>.</li>
          <li>Faillite envers un joueur : le créancier récupère l&apos;argent, les propriétés (hypothèques comprises) et les cartes Sortie de Prison. Envers la banque : les biens retournent à la banque (les bâtiments reviennent au stock).</li>
        </ul>

        <h2 className="text-xl font-bold text-amber-300">Prison</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>En prison, le joueur tente un <strong>double</strong> (jusqu&apos;à trois tentatives) ; réussi, il sort et avance du montant des dés sans rejouer.</li>
          <li>Il peut aussi payer <strong>50 F</strong> avant de lancer, ou utiliser une carte <strong>Sortie de Prison</strong> (conservée jusqu&apos;à l&apos;usage, transmissible par échange ou héritée en cas de faillite adverse).</li>
          <li>Après trois tentatives ratées, l&apos;amende de 50 F est due puis le joueur sort.</li>
        </ul>

        <h2 className="text-xl font-bold text-amber-300">Échanges</h2>
        <p>
          Entre deux joueurs seulement : propriétés (éventuellement hypothéquées), cartes Sortie de
          Prison et argent. Un échange est <strong>refusé</strong> si un groupe concerné contient des
          maisons — il faut les vendre d&apos;abord. Les fonds doivent suivre à chaque étape.
        </p>

        <p className="text-xs text-slate-400">
          Édition de référence : édition française classique (rues de Paris), mode officiel seul —
          pas de cagnotte « Parc gratuit », pas de mode chronométré. Décisions détaillées :
          ADR-0007.
        </p>
      </section>
    </main>
  );
}
