import React from 'react';
import { Link } from 'react-router-dom'; // Importante para navegação sem recarregar
import { Monitor, Lock, PlayCircle } from 'lucide-react';

const Home = () => {
  // Criando um array de 48 aulas para gerar os cards automaticamente
  const totalAulas = 48;
  const aulas = Array.from({ length: totalAulas }, (_, i) => ({
    id: i + 1,
    titulo: `Missão ${i + 1}`,
    // Apenas a aula 1 está desbloqueada por enquanto
    bloqueada: i + 1 !== 1 
  }));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white overflow-hidden flex flex-col">
      
      {/* Header */}
      <header className="p-6 border-b border-cyan-500/20 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Monitor className="text-cyan-400" size={32} />
          <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            UNIVERSO TECH
          </h1>
        </div>
        <p className="text-slate-400 text-sm mt-1">Plataforma de Treinamento Institucional</p>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col justify-center p-8 relative">
        {/* Efeitos de Fundo */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="mb-8 z-10">
          <h2 className="text-4xl font-bold text-white mb-2">Selecione sua Missão</h2>
          <p className="text-cyan-200">Deslize para ver todas as fases disponíveis.</p>
        </div>

        {/* Carrossel de Aulas */}
        <div className="w-full overflow-x-auto pb-12 pt-4 px-4 snap-x flex gap-6 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-slate-800">
          {aulas.map((aula) => (
            <div key={aula.id} className="snap-center shrink-0">
              {aula.bloqueada ? (
                // CARD BLOQUEADO
                <div className="w-64 h-80 bg-slate-800/50 rounded-3xl border border-slate-700 flex flex-col items-center justify-center gap-4 text-slate-600 grayscale opacity-70 cursor-not-allowed relative overflow-hidden group">
                  <div className="absolute inset-0 bg-slate-950/50"></div>
                  <Lock size={40} className="mb-2 relative z-10" />
                  <span className="font-bold text-xl relative z-10">AULA {aula.id.toString().padStart(2, '0')}</span>
                  <div className="absolute bottom-0 w-full h-1 bg-slate-700"></div>
                </div>
              ) : (
                // CARD DESBLOQUEADO (Link para Aula 01)
                <Link to="/aula-01" className="block w-64 h-80 bg-slate-800 rounded-3xl border-2 border-cyan-500/30 hover:border-cyan-400 flex flex-col relative overflow-hidden group transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                  {/* Imagem/Banner do Card */}
                  <div className="h-40 bg-gradient-to-b from-cyan-900 to-slate-800 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000')] bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-700"></div>
                    <PlayCircle size={48} className="text-white relative z-10 drop-shadow-lg group-hover:text-cyan-400 transition-colors" />
                  </div>
                  
                  {/* Info do Card */}
                  <div className="p-6 flex flex-col justify-between flex-1 bg-slate-800">
                    <div>
                      <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase">Disponível</span>
                      <h3 className="text-2xl font-bold text-white mt-1">AULA {aula.id.toString().padStart(2, '0')}</h3>
                      <p className="text-slate-400 text-sm mt-2 leading-relaxed">Domine o mouse e o teclado nesta introdução épica.</p>
                    </div>
                    <div className="w-full py-2 bg-cyan-500/10 rounded-lg text-center text-cyan-300 text-sm font-bold mt-4 group-hover:bg-cyan-500 group-hover:text-slate-900 transition-colors">
                      INICIAR
                    </div>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
