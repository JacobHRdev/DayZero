const FIGMA_EMBED_URL = "https://embed.figma.com/design/ML0yv4emSGmR94betNhVj7/Sin-t%C3%ADtulo?node-id=2-1627&embed-host=share";

export default function FigmaDesignPreview() {
  return (
    <section aria-labelledby="figma-preview-title" className="min-h-[calc(100vh-5rem)] bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-[1600px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-float">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h1 id="figma-preview-title" className="text-sm font-semibold text-slate-900">Sin título</h1>
            <p className="mt-1 text-xs text-slate-400">Figma design preview · node 2-1627</p>
          </div>
          <a className="shrink-0 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900" href={FIGMA_EMBED_URL} rel="noreferrer" target="_blank">
            Open in Figma
          </a>
        </div>
        <iframe
          allowFullScreen
          className="min-h-[calc(100vh-12rem)] w-full flex-1 border-0"
          src={FIGMA_EMBED_URL}
          title="Figma design preview"
        />
      </div>
    </section>
  );
}
