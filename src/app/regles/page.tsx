import Link from "next/link";

export default function ReglesPage() {
  return (
    <main className="flex-1 max-w-2xl mx-auto w-full p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">Règles du jeu</h1>
        <Link href="/" className="px-4 py-2 rounded-xl border border-slate-600 hover:bg-slate-800">
          ← Menu
        </Link>
      </header>

      <section className="space-y-3 text-slate-200 leading-relaxed">
        <h2 className="text-xl font-bold text-sky-300">But</h2>
        <p>
          Chaque joueur dispose de <strong>7 pierres</strong> placées sur son bras du plateau en
          croix. Le gagnant est le dernier joueur possédant encore des pierres : pour l&apos;emporter,
          il faut éliminer les <strong>7 pierres de chaque adversaire</strong>.
        </p>

        <h2 className="text-xl font-bold text-sky-300">Le plateau</h2>
        <p>
          Une croix de cinq carrés. Les intersections sont des positions ; les lignes horizontales,
          verticales et diagonales dessinent les seules connexions autorisées. Le point central de la
          croix n&apos;est pas jouable.
        </p>

        <h2 className="text-xl font-bold text-sky-300">Déplacement normal</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Une de vos pierres glisse vers une position <strong>voisine libre</strong>, reliée par une ligne du plateau.</li>
          <li>On ne traverse pas une autre pierre et on ne joue que ses propres pierres.</li>
        </ul>

        <h2 className="text-xl font-bold text-sky-300">Élimination par saut</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Si une pierre <strong>adverse</strong> est voisine et que la position juste derrière elle existe et est libre, vous sautez par-dessus : la pierre adverse est <strong>retirée du plateau</strong>.</li>
          <li>Un seul saut par mouvement (jamais par-dessus deux pierres), jamais vers une arrivée occupée, jamais au-dessus d&apos;une de vos propres pierres.</li>
        </ul>

        <h2 className="text-xl font-bold text-sky-300">Chaîne de sauts</h2>
        <p>
          Après une élimination réussie, la pierre qui a sauté <strong>rejoue immédiatement</strong>.
          Elle peut effectuer un déplacement normal — le tour passe alors au joueur suivant — ou
          <strong> sauter à nouveau une pierre adverse</strong>. Si elle capture encore, elle rejoue
          encore : la chaîne de sauts continue tant que des captures sont possibles avec cette même
          pierre. Chaque saut reste un seul saut (jamais par-dessus deux pierres d&apos;un coup), et la
          partie s&apos;arrête dès qu&apos;un saut de la chaîne retire la dernière pierre d&apos;un
          adversaire.
        </p>

        <h2 className="text-xl font-bold text-sky-300">Tours et victoire</h2>
        <p>
          Les tours tournent dans l&apos;ordre des joueurs. Un joueur qui perd sa dernière pierre est
          éliminé et son tour est sauté. Dès qu&apos;un seul joueur a encore des pierres, la partie
          est gagnée.
        </p>
      </section>
    </main>
  );
}
