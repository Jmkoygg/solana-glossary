import { notFound } from "next/navigation";
import Link from "next/link";
import { getTerm } from "@stbr/solana-glossary";
import type { GlossaryTerm } from "@stbr/solana-glossary";
import { getTermLocalized } from "@/lib/i18n";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/categories";
import CopyContextButton from "@/components/CopyContextButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const term = getTerm(id);
  if (!term) return {};
  return {
    title: `${term.term} | Glossário Solana`,
    description: term.definition.slice(0, 160),
  };
}

export default async function TermPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { id } = await params;
  const { lang } = await searchParams;
  const locale = (
    ["pt", "es", "en"].includes(lang ?? "") ? lang : "pt"
  ) as string;

  const term = getTermLocalized(id, locale);
  if (!term) notFound();

  // Related terms also shown in the same locale
  const relatedTerms = (term.related ?? [])
    .map((relId) => getTermLocalized(relId, locale))
    .filter((t): t is GlossaryTerm => t !== undefined);

  const catColor = CATEGORY_COLORS[term.category] ?? "#9945FF";
  const catLabel = CATEGORY_LABELS[term.category] ?? term.category;

  return (
    <main className="flex-1 w-full">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#A0A0B0]">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <span style={{ color: catColor }}>{catLabel}</span>
          <span>/</span>
          <span className="text-white truncate max-w-[200px]">{term.term}</span>
        </nav>

        {/* Category badge + copy button */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span
            className="inline-flex rounded-full px-3 py-1 text-sm font-medium"
            style={{ background: `${catColor}22`, color: catColor }}
          >
            {catLabel}
          </span>
          <CopyContextButton category={term.category} />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
          {term.term}
        </h1>

        {/* Aliases */}
        {term.aliases && term.aliases.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#A0A0B0] text-sm">Também chamado de:</span>
            {term.aliases.map((alias) => (
              <span
                key={alias}
                className="rounded-md bg-white/8 px-2.5 py-1 text-sm text-white"
              >
                {alias}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-white/8" />

        {/* Definition */}
        <p className="text-[#E0E0E8] text-lg leading-8">{term.definition}</p>

        {/* Related Terms */}
        {relatedTerms.length > 0 && (
          <section className="space-y-4">
            <div className="h-px bg-white/8" />
            <h2 className="text-white font-semibold text-xl">
              Termos Relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedTerms.map((rel) => (
                <RelatedCard key={rel.id} term={rel} locale={locale} />
              ))}
            </div>
          </section>
        )}

        {/* Back button */}
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#A0A0B0] hover:text-white transition-colors group"
          >
            <svg
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 12H5M12 5l-7 7 7 7"
              />
            </svg>
            Voltar
          </Link>
        </div>
      </div>
    </main>
  );
}

function RelatedCard({ term, locale }: { term: GlossaryTerm; locale: string }) {
  const color = CATEGORY_COLORS[term.category] ?? "#9945FF";
  const label = CATEGORY_LABELS[term.category] ?? term.category;

  return (
    <Link
      href={`/termo/${term.id}?lang=${locale}`}
      className="group relative flex flex-col gap-2 rounded-xl bg-[#1A1A24] border border-white/8 p-4 hover:border-[#9945FF]/50 hover:bg-[#1E1E2E] transition-all overflow-hidden"
    >
      <span
        className="absolute left-0 top-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: "linear-gradient(180deg, #9945FF, #14F195)" }}
      />
      <div className="flex items-start justify-between gap-2">
        <span className="text-white font-medium text-sm leading-snug">
          {term.term}
        </span>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ background: `${color}22`, color }}
        >
          {label}
        </span>
      </div>
      <p className="text-[#A0A0B0] text-xs leading-relaxed">
        {term.definition.slice(0, 90)}
        {term.definition.length > 90 ? "…" : ""}
      </p>
      <span className="text-xs font-medium mt-auto" style={{ color }}>
        Ver termo →
      </span>
    </Link>
  );
}
