import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Lock, Play, Sparkles } from 'lucide-react';

// --- COMPONENTE DE EFEITO DE DIGITAÇÃO ---
const TypingEffect = ({ text, speed = 80 }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText(""); // Reseta ao mudar o texto
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span className="font-mono text-cyan-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
      {displayedText}
      <span className="animate-pulse border-r-2 border-cyan-400 ml-1"></span>
    </span>
  );
};

// --- PÁGINA PRINCIPAL (HOME) ---
const Home = () => {
  // Configuração das Missões
  const totalMissoes = 48;
  const missoes = Array.from({ length: totalMissoes }, (_, i) => ({
    id: i + 1,
    titulo: `MISSÃO ${String(i + 1).padStart(2, '0')}`,
    // Apenas a missão 1 está desbloqueada inicialmente
    bloqueada: i + 1 !== 1 
  }));

  // --- EFEITO MÁGICO DO MOUSE (Rastro de Partículas) ---
  const [particles, setParticles] = useState([]);
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Adiciona uma nova partícula na posição do mouse
    const newParticle = {
      id: Date.now(),
      x, y,
      size: Math.random() * 8 + 4, // Tamanho aleatório
      color: Math.random() > 0.5 ? '#22d3ee' : '#a855f7' // Ciano ou Roxo
    };

    setParticles(prev => [...prev.slice(-25), newParticle]); // Mantém máx 25 partículas para performance
  };

  // Limpa partículas antigas automaticamente
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.filter(p => Date.now() - p.id < 1000)); // Remove após 1s
    }, 100);
    return () => clearInterval(interval);
  }, []);


  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden flex flex-col relative"
    >
      {/* --- CAMADA 1: FUNDO GIF --- */}
      <div className="absolute inset-0 z-0">
        {/* Certifique-se que o arquivo 'fundoprincipal.gif' está na pasta PUBLIC */}
        <img 
          src="/fundoprincipal.gif" 
          alt="Fundo Tecnológico" 
          className="w-full h-full object-cover opacity-60" 
        />
      </div>

      {/* --- CAMADA 2: DEGRADÊ AZUL/ROXO VIBRANTE POR CIMA --- */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900/80 via-indigo-900/80 to-purple-900/60 mix-blend-hard-light pointer-events-none"></div>

      {/* --- CAMADA 3: EFEITO MÁGICO DO MOUSE (Partículas) --- */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden filter blur-[1px]">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full animate-ping-slow opacity-70"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}, 0 0 ${p.size * 4}px ${p.color}`
            }}
          />
        ))}
      </div>

      {/* --- CAMADA 4: CONTEÚDO REAL DA PÁGINA --- */}
      <div className="relative z-20 flex-1 flex flex-col backdrop-blur-sm bg-slate-900/30">
        
        {/* Header */}
        <header className="p-6 flex justify-between items-start border-b border-cyan-500/20 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 shadow-[0_5px_20px_rgba(0,0,0,0.5)]">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Monitor className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse" size={32} />
              <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
                UNIVERSO TECH
              </h1>
            </div>
            {/* Subtítulo com efeito de digitação */}
            <TypingEffect text="Bem vindo(a) ao Universo Gumers..." speed={100} />
          </div>

          {/* Logo da Gumers no canto superior direito */}
          <div className="relative group cursor-pointer">
             <div className="absolute inset-0 bg-cyan-400 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
             {/* Certifique-se que 'Gumers.png' está na pasta PUBLIC */}
             <img 
               src="/Gumers.png" 
               alt="Gumers Logo" 
               className="w-16 h-16 object-contain relative z-10 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] group-hover:scale-110 transition-transform"
             />
          </div>
        </header>

        {/* Conteúdo Principal (Carrossel) */}
        <main className="flex-1 flex flex-col justify-center p-8 relative">
          
          <div className="mb-10 z-10 text-center sm:text-left">
            <h2 className="text-4xl font-bold text-white mb-2 flex items-center justify-center sm:justify-start gap-3 drop-shadow-lg">
              <Sparkles className="text-yellow-400 animate-spin-slow" />
              Selecione sua Missão
            </h2>
            <p className="text-cyan-200 text-lg drop-shadow-md max-w-md">Prepare-se para destravar suas habilidades tecnológicas. O futuro espera por você!</p>
          </div>

          {/* Carrossel de Missões */}
          <div className="w-full overflow-x-auto pb-12 pt-8 px-4 snap-x flex gap-8 scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-slate-800/50 perspective-1000">
            {missoes.map((missao) => (
              <div key={missao.id} className="snap-center shrink-0 transform-style-3d hover:rotate-y-6 transition-all duration-500">
                {missao.bloqueada ? (
                  // --- CARD BLOQUEADO (Visual mais "trancado" e escuro) ---
                  <div className="w-72 h-96 bg-slate-800/80 rounded-[2rem] border-4 border-slate-700 flex flex-col items-center justify-center gap-6 text-slate-500 relative overflow-hidden group shadow-xl backdrop-blur-sm">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 to-slate-950/90"></div>
                    
                    {/* Ícone de Cadeado com efeito */}
                    <div className="relative z-10 p-6 bg-slate-900 rounded-full border border-slate-600 group-hover:border-red-900/50 transition-colors">
                      <Lock size={48} className="text-slate-600 group-hover:text-red-500/50 transition-colors" />
                      <div className="absolute inset-0 bg-red-500/20 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity"></div>
                    </div>
                    
                    <div className="text-center relative z-10">
                      <span className="font-black text-2xl tracking-widest block">{missao.titulo}</span>
                      <span className="text-xs uppercase tracking-wider text-red-900/70 bg-red-500/10 px-3 py-1 rounded-full mt-2 inline-block group-hover:text-red-500/70 transition-colors">Bloqueado</span>
                    </div>
                  </div>
                ) : (
                  // --- CARD DESBLOQUEADO (Visual Neon Vibrante) ---
                  <Link to="/aula-01" className="block w-72 h-96 bg-slate-800/90 rounded-[2rem] border-4 border-cyan-500/50 hover:border-cyan-400 flex flex-col relative overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(34,211,238,0.4)] backdrop-blur-md">
                    {/* Efeito de brilho no fundo ao passar o mouse */}
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                    
                    {/* Banner do Card */}
                    <div className="h-48 bg-gradient-to-br from-cyan-900 to-indigo-900 flex items-center justify-center relative overflow-hidden z-10 border-b border-cyan-500/30 group-hover:from-cyan-800 group-hover:to-indigo-800 transition-colors">
                       {/* Imagem de fundo ilustrativa para o card */}
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-50 group-hover:scale-110 group-hover:opacity-70 transition-all duration-700 mix-blend-overlay"></div>
                      
                      {/* Botão Play Central */}
                      <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-cyan-400/50 group-hover:bg-cyan-400/30 group-hover:scale-110 transition-all relative z-20 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                        <Play size={36} className="text-cyan-100 ml-2 relative z-10 group-hover:text-white transition-colors" />
                        <div className="absolute inset-0 bg-cyan-400/40 rounded-full blur-md animate-pulse"></div>
                      </div>
                    </div>
                    
                    {/* Info do Card */}
                    <div className="p-6 flex flex-col justify-between flex-1 relative z-10 bg-gradient-to-b from-transparent to-slate-900/80">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-black text-cyan-300 tracking-wider uppercase bg-cyan-900/50 px-2 py-1 rounded-md border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.2)] flex items-center gap-1">
                                <Sparkles size={12} /> Disponível
                            </span>
                        </div>
                        <h3 className="text-3xl font-black text-white mt-1 drop-shadow-md group-hover:text-cyan-200 transition-colors">{missao.titulo}</h3>
                        <p className="text-cyan-100/70 text-sm mt-2 leading-relaxed font-medium">Domine o controle mestre: Mouse e Teclado.</p>
                      </div>
                      
                      <div className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-center text-white text-base font-bold mt-4 group-hover:from-cyan-400 group-hover:to-blue-500 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all transform active:scale-95 tracking-wider uppercase relative overflow-hidden">
                        <span className="relative z-10">INICIAR MISSÃO</span>
                        {/* Efeito de brilho passando pelo botão */}
                        <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shine skew-x-[30deg]"></div>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
