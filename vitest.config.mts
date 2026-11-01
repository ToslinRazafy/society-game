import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Le cache des modules transformés vit hors du dépôt. Par défaut il est écrit
// dans `node_modules/.vitest-cache`, ce que le serveur de dev (Turbopack)
// surveille : lancer les tests pendant `next dev` faisait attendre le système
// de fichiers. En le déplaçant dans le dossier temporaire du système, les deux
// outils ne se marchent plus dessus. Découverte des tests : valeurs par défaut.
// Extension `.mts` : le paquet n'est pas en `"type": "module"`.
export default defineConfig({
  resolve: {
    // même alias que tsconfig.json ("@/*" → "./src/*") — requis dès qu'un
    // module consommé par les tests importe via "@/".
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    fsModuleCachePath: join(tmpdir(), "playboard-vitest-cache"),
  },
});
