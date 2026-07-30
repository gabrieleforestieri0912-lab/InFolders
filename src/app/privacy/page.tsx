export const metadata = {
  title: "Privacy — InFolders",
  description: "Informativa sulla privacy per InFolders"
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 text-zinc-800 dark:text-zinc-200">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        InFolders — Privacy
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Ultimo aggiornamento: 4 maggio 2026
      </p>
      <p className="mt-6 leading-relaxed">
        InFolders è un&apos;estensione browser che organizza collegamenti e cartelle per i servizi di chat
        AI. I dati (cartelle, bookmark, profilo Google base) sono memorizzati in locale sul
        dispositivo tramite le API del browser, salvo integrazioni future esplicitamente
        dichiarate.
      </p>
      <h2 className="mt-8 text-lg font-medium text-zinc-900 dark:text-zinc-50">
        Accesso Google
      </h2>
      <p className="mt-2 leading-relaxed">
        Il login usa OAuth 2.0 di Google. Il token di accesso non viene conservato in storage: serve
        solo per recuperare email e nome, poi viene scartato.
      </p>
      <h2 className="mt-8 text-lg font-medium text-zinc-900 dark:text-zinc-50">Contatti</h2>
      <p className="mt-2 leading-relaxed">
        Per richieste privacy aggiorna questa pagina con email e ragione sociale reali prima del
        lancio pubblico.
      </p>
    </main>
  );
}
