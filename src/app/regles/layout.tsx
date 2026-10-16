import type { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

// Les pages de règles partagent le chrome du site (en-tête + pied de page),
// comme les autres pages publiques.
export default function ReglesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
