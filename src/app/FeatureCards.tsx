'use client';

import React from 'react';

const P_COLORS = ['#a855f7', '#60a5fa', '#fb923c', '#06b6d4'];

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Cartelle Illimitate',
    desc: 'Organizza le tue conversazioni AI in cartelle e sottocartelle annidate. Creane quante vuoi, senza limiti.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Multi-account',
    desc: "Gestisci più account AI contemporaneamente. Passa da un profilo all'altro senza mai perdere una conversazione.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" /><path d="M7 7h.01" />
      </svg>
    ),
    title: 'Drag & Drop',
    desc: 'Sposta le conversazioni tra cartelle con un semplice trascinamento. Riordina tutto in pochi secondi.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
    ),
    title: 'Ricerca Globale',
    desc: 'Cerca conversazioni su tutte le cartelle in tempo reale. Trova qualsiasi chat in un istante.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: 'Libreria Prompt',
    desc: 'Crea e organizza i tuoi prompt preferiti. Copiali con un clic e usali nelle tue chat AI.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" />
      </svg>
    ),
    title: 'Profili Istruzioni',
    desc: 'Definisci profili con istruzioni personalizzate per ChatGPT. Attiva il profilo giusto per ogni contesto.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    title: 'Bookmark',
    desc: 'Salva le tue chat preferite con un clic. Ritrova facilmente le conversazioni più importanti.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Multi-dispositivo',
    desc: 'Sincronizza cartelle e bookmark tra tutti i tuoi dispositivi. Le tue conversazioni sempre con te.',
  },
];

export default function FeatureCards() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {features.map((f, i) => {
        const c = P_COLORS[i % P_COLORS.length];
        return (
          <FeatureCard key={f.title} feature={f} color={c} />
        );
      })}
    </div>
  );
}

function FeatureCard({
  feature,
  color,
}: {
  feature: (typeof features)[number];
  color: string;
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      className="rounded-xl p-6 transition-all duration-200"
      style={{
        border: `1px solid ${hovered ? color + '33' : 'rgba(255,255,255,0.05)'}`,
        background: hovered ? color + '0A' : 'rgba(255,255,255,0.02)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="mb-4 inline-flex rounded-lg p-2.5"
        style={{ background: `${color}18`, color }}
      >
        {feature.icon}
      </div>
      <h3 className="mb-2 text-sm font-semibold">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-zinc-500">{feature.desc}</p>
    </div>
  );
}
