import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, ArrowRight, Gamepad2, MousePointer, Rat, Hand, Zap, CheckCircle, Sparkles, Monitor, Keyboard, Trophy } from 'lucide-react';

/* =========================================================================
   1. ESTILOS GLOBAIS & ANIMAÇÕES (CSS-IN-JS AVANÇADO)
   Garante que tudo funcione sem precisar configurar arquivos CSS externos.
   ========================================================================= */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap');
    
    :root {
      --neon-blue: #00f3ff;
      --neon-purple: #bc13fe;
      --glass-bg: rgba(15, 23, 42, 0.85);
    }

    body { margin: 0; font-family: 'Fredoka', sans-serif; background-color: #050510; overflow: hidden; }

    /* Animações de Entrada e Efeitos */
    @keyframes slideUpFade { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
    @keyframes pulse-neon { 0%, 100% { box-shadow: 0 0 10px var(--neon-blue); } 50% { box-shadow: 0 0 25px var(--neon-blue), 0 0 10px var(--neon-purple); } }
    @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes particleFade { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(0); opacity: 0; top: -50px; } }

    .animate-enter { animation: slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
    .animate-float { animation: float 6s ease-in-out infinite; }
    
    /* Painéis de Vidro (Glassmorphism) */
    .glass-panel {
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    }

    /* Efeito Rastro do Mouse */
    .trail {
        position: fixed; pointer-events: none;
        background: var(--neon-blue); border-radius: 50%;
        box-shadow: 0 0 10px var(--neon-blue);
        animation: particleFade 0.8s linear forwards; z-index: 9999;
    }

    /* Cartas do Jogo da Memória 3D */
    .memory-card-container { perspective: 1000px; }
    .memory-card { 
        width: 100%; height: 120px; position: relative; transform-style: preserve-3d; 
        transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1); cursor: pointer;
    }
    .memory-card.flip { transform: rotateY(180deg); }
    .memory-card.matched { opacity: 0.5; pointer-events: none; }
    
    .front-face, .back-face {
        position: absolute; width: 100%; height: 100%; border-radius: 16px;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        backface-visibility: hidden; border: 2px solid var(--neon-blue);
        box-shadow: 0 0 15px rgba(0, 243, 255, 0.2);
    }
    .front-face { background: #1e293b; transform: rotateY(180deg); }
    .back-face { background: linear-gradient(135deg, #0f172a 0%, #312e81 100%); }
  `}</style>
);

/* =========================================================================
   2. DADOS DA AULA (Roteiro Revisado e Sequencial)
   ========================================================================= */
const SLIDES_DATA = [
  { type: 'video', src: '/abertura-aula.mp4' },
  { type: 'slide', id: 1,  audio: '/slide-01.wav', gif: '/gif01.gif', title: 'Boas-vindas, Tech Master!', text: 'E aí! Eu sou o Jack, seu Player 2 nessa jornada épica. Se você está aqui, é porque quer dominar a tecnologia de verdade. Preparado para subir de nível?' },
  { type: 'slide', id: 2,  audio: '/slide-02.wav', gif: '/gif02.gif', title: 'Nada de Aulas Chatas', text: 'Esqueça aquela ideia de "aula chata". Aqui nós temos Missões! Cada etapa foi criada para você se divertir enquanto aprende.' },
  { type: 'slide', id: 3,  audio: '/slide-03.wav', gif: '/gif01.gif', title: 'O Mapa de Fases', text: 'Dá uma olhada no nosso mapa! Cada fase desbloqueia um superpoder diferente. Vamos no seu ritmo, do zero ao profissional.' },
  { type: 'slide', id: 4,  audio: '/slide-04.wav', gif: '/gif02.gif', title: 'Objetivo Final', text: 'Ao final desta saga, você vai dominar o Mouse, o Teclado e entender exatamente o que acontece dentro da máquina!' },
  { type: 'slide', id: 5,  audio: '/slide-05.wav', gif: '/gif01.gif', title: 'A Primeira Missão', text: 'Nesta missão inicial, vamos descobrir como a informação viaja até nós. Foca na tela, pois a jornada começa agora!' },
  
  // BLOCO VISUAL (Ilustrações do Mouse)
  { type: 'slide', id: 6,  audio: '/slide-06.wav', gif: '/gif02.gif', title: 'O Mouse', text: 'Primeira parada: O Mouse! Você sabia que "Mouse" significa "Rato" em inglês? O formato dele lembrava um ratinho com cauda.', effect: 'mouse-rat' },
  { type: 'slide', id: 7,  audio: '/slide-07.wav', gif: '/gif01.gif', title: 'Ele Não Morde!', text: 'Relaxa, esse rato não morde! Ele é o nosso periférico de entrada principal. Ele funciona como uma extensão da sua mão na tela.', effect: 'hand' },
  { type: 'slide', id: 8,  audio: '/slide-08.wav', gif: '/gif02.gif', title: 'O Cursor', text: 'Quando você move o mouse aqui fora, ele controla aquele Cursor (a setinha) lá dentro. É pura mágica tecnológica!', effect: 'cursor' },
  
  { type: 'slide', id: 9,  audio: '/slide-09.wav', gif: '/gif01.gif', title: 'O Clique', text: 'E tem o clique! É como apertar o gatilho num jogo. O som de "click" confirma que o computador entendeu seu comando.' },
  { type: 'slide', id: 10, audio: '/slide-10.wav', gif: '/gif02.gif', title: 'Ergonomia Pro', text: 'Segredo de Pro Player: Conforto. Ninguém quer ter "Game Over" na mão por causa de dor, né?' },
  { type: 'slide', id: 11, audio: '/slide-11.wav', gif: '/gif01.gif', title: 'Modo Sem Dor', text: 'Usar o mouse do jeito errado cansa rápido. Vamos ativar o Modo Ergonômico para jogar por horas com saúde.' },
  { type: 'slide', id: 12, audio: '/slide-12.wav', gif: '/gif02.gif', title: 'Mão Relaxada', text: 'Regra de ouro: Mão relaxada! Deixe sua mão descansar sobre o mouse, como se fosse um travesseiro macio.' },
  { type: 'slide', id: 13, audio: '/slide-13.wav', gif: '/gif01.gif', title: 'Cuidado com o Punho', text: 'Atenção ao punho! Nada de deixar o pulso dobrado na quina da mesa. O braço precisa ter apoio total.' },
  
  { type: 'slide', id: 14, audio: '/slide-14.wav', gif: '/gif02.gif', title: 'Desafio de Precisão', text: 'Chega de papo, hora da ação! Vamos ver se você pegou o jeito. Sua missão é levar o cursor do ponto A ao ponto B.' },
  
  { type: 'game-ninja' }, // JOGO 1: Mouse Line
  
  { type: 'slide', id: 15, audio: '/slide-15.wav', gif: '/gif01.gif', title: 'Desafio Final', text: 'Incrível! Seus reflexos são ótimos. Agora, para ganhar seu Emblema, vença o Desafio da Memória Gumers!', isLast: true },
  
  { type: 'game-memory' }, // JOGO 2: Memória (Final)
  
  // TELA DE VITÓRIA FINAL
  { type: 'celebration' } 
];

/* =========================================================================
   3. COMPONENTES UTILITÁRIOS (Typing, Overlay, Fireworks)
   ========================================================================= */
const TypingText = ({ text, speed = 20 }) => {
    const [displayed, setDisplayed] = useState("");
    useEffect(() => {
        setDisplayed(""); 
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) { setDisplayed(prev => prev + text.charAt(i)); i++; } 
            else clearInterval(interval);
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);
    return <span>{displayed}</span>;
};

const CreativeOverlay = ({ type }) => {
    if (!type) return null;
    return (
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-30">
            {type === 'mouse-rat' && (
                <div className="animate-float relative">
                    <MousePointer size={250} className="text-cyan-400 absolute -translate-x-full" />
                    <Rat size={250} className="text-pink-500 absolute translate-x-10" />
                </div>
            )}
            {type === 'hand' && <Hand size={400} className="text-yellow-400 animate-pulse" />}
            {type === 'cursor' && <Zap size={400} className="text-blue-500 animate-spin-slow opacity-50" />}
        </div>
    );
};

/* =========================================================================
   4. JOGO 1: NINJA LINE GAME (Canvas Otimizado)
   ========================================================================= */
const NinjaLineGame = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState('start'); 
  const [msg, setMsg] = useState("Toque no círculo azul!");
  const [msgColor, setMsgColor] = useState("white");

  // Game State Ref (Mutable for Performance)
  const gl = useRef({
    width: 0, height: 0, particles: [], obstacles: [], mouse: { x: 0, y: 0 },
    hasEnergy: false, active: false,
    pointA: { x: 0, y: 0, radius: 45, color: '#22d3ee', label: 'INÍCIO' },
    pointB: { x: 0, y: 0, radius: 45, color: '#a855f7', label: 'FIM' },
    animId: null
  });

  const levels = { 1: { n: "Nível 1", obs: 0, spd: 0 }, 2: { n: "Nível 2", obs: 2, spd: 2 }, 3: { n: "Nível 3", obs: 4, spd: 3.5 } };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
        gl.current.width = window.innerWidth; gl.current.height = window.innerHeight;
        canvas.width = gl.current.width; canvas.height = gl.current.height;
        gl.current.pointA.x = gl.current.width * 0.15; gl.current.pointA.y = gl.current.height / 2;
        gl.current.pointB.x = gl.current.width * 0.85; gl.current.pointB.y = gl.current.height / 2;
        if(gl.current.active) initObs();
    };
    window.addEventListener('resize', resize); resize();

    function initObs() {
        gl.current.obstacles = [];
        const count = levels[level].obs;
        if(count === 0) return;
        const step = (gl.current.pointB.x - gl.current.pointA.x) / (count + 1);
        for(let i=1; i<=count; i++) {
            gl.current.obstacles.push({
                x: gl.current.pointA.x + (step * i) - 20,
                y: (gl.current.height/2) - 60 + (Math.random()*100 - 50),
                w: 40, h: 120, spd: levels[level].spd, dir: Math.random()>0.5?1:-1
            });
        }
    }

    const loop = () => {
        const { width, height, active, hasEnergy, pointA, pointB, obstacles, particles } = gl.current;
        ctx.fillStyle = '#050510'; ctx.fillRect(0, 0, width, height);
        
        // Grid
        ctx.strokeStyle = 'rgba(0,243,255,0.05)'; ctx.lineWidth = 1;
        for(let i=0; i<width; i+=50) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,height); ctx.stroke(); }

        if(active) {
            // Draw Points
            [pointA, pointB].forEach((p, idx) => {
                const isActive = (idx === 0 && !hasEnergy) || (idx === 1 && hasEnergy);
                const color = isActive ? p.color : '#334155';
                ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); 
                ctx.strokeStyle = color; ctx.lineWidth = isActive ? 4 : 2; ctx.stroke();
                ctx.shadowBlur = isActive ? 20 : 0; ctx.shadowColor = color;
                ctx.fillStyle = 'white'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(p.label, p.x, p.y + p.radius + 30); ctx.shadowBlur = 0;
            });

            // Draw Obstacles
            obstacles.forEach(obs => {
                obs.y += obs.spd * obs.dir;
                if(obs.y < 50 || obs.y > height - obs.h - 50) obs.dir *= -1;
                ctx.fillStyle = '#ef4444'; ctx.shadowBlur = 10; ctx.shadowColor = '#ef4444';
                ctx.beginPath(); ctx.roundRect(obs.x, obs.y, obs.w, obs.h, 8); ctx.fill(); ctx.shadowBlur = 0;
            });
        }

        // Particles
        for(let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.03;
            ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
            if(p.life <= 0) particles.splice(i, 1);
        }
        ctx.globalAlpha = 1;
        gl.current.animId = requestAnimationFrame(loop);
    };
    loop();

    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(gl.current.animId); };
  }, [level]);

  const handleMove = (e) => {
      if(!gl.current.active) return;
      const x = e.clientX || e.touches?.[0]?.clientX;
      const y = e.clientY || e.touches?.[0]?.clientY;
      if(!x || !y) return;
      
      gl.current.mouse = {x, y};
      const { mouse, pointA, pointB, hasEnergy, obstacles } = gl.current;

      // Trail
      if(Math.random()>0.5) gl.current.particles.push({x, y, vx:(Math.random()-0.5)*2, vy:(Math.random()-0.5)*2, life:1, color:hasEnergy?'#fcd34d':'#fff', size:Math.random()*3});

      // Logic
      const distA = Math.hypot(x - pointA.x, y - pointA.y);
      if(distA < pointA.radius && !hasEnergy) {
          gl.current.hasEnergy = true; setMsg("ENERGIA PEGUE! 🔥"); setMsgColor("#fcd34d");
      }

      const distB = Math.hypot(x - pointB.x, y - pointB.y);
      if(distB < pointB.radius && hasEnergy) {
          gl.current.active = false; setGameState('win');
      }

      if(hasEnergy) {
          obstacles.forEach(obs => {
              if(x > obs.x && x < obs.x + obs.w && y > obs.y && y < obs.y + obs.h) {
                  gl.current.hasEnergy = false; setMsg("BATEU! TENTE DE NOVO!"); setMsgColor("#ef4444");
              }
          });
      }
  };

  const next = () => {
      if(level >= 3) onComplete();
      else { setLevel(p => p+1); setGameState('playing'); gl.current.active = true; gl.current.hasEnergy = false; }
  };

  return (
    <div className="w-full h-full relative" onMouseMove={handleMove} onTouchMove={handleMove}>
        <canvas ref={canvasRef} className="block touch-none" />
        <div className="absolute top-20 w-full flex justify-center pointer-events-none"><div className="glass-panel px-6 py-2 rounded-full text-purple-300 font-bold uppercase tracking-widest">{levels[level].n}</div></div>
        <div className="absolute bottom-10 w-full text-center pointer-events-none"><span className="inline-block px-8 py-3 rounded-2xl glass-panel font-bold text-xl" style={{ color: msgColor }}>{msg}</span></div>
        
        {gameState === 'start' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
                <div className="glass-panel p-8 rounded-[2rem] text-center max-w-md">
                    <Gamepad2 size={64} className="mx-auto text-cyan-400 mb-4 animate-bounce" />
                    <h2 className="text-3xl font-bold text-white mb-2">DESAFIO DO MOUSE</h2>
                    <p className="text-slate-300 mb-6">Leve a energia do ponto A ao B sem tocar nos obstáculos!</p>
                    <button onClick={() => { gl.current.active = true; setGameState('playing'); }} className="w-full py-3 bg-cyan-600 text-white font-bold rounded-xl hover:scale-105 transition">COMEÇAR</button>
                </div>
            </div>
        )}
        {gameState === 'win' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
                <div className="glass-panel p-8 rounded-[2rem] text-center max-w-md">
                    <CheckCircle size={64} className="mx-auto text-green-400 mb-4" />
                    <h2 className="text-3xl font-bold text-white mb-4">VITÓRIA!</h2>
                    <button onClick={next} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:scale-105 transition">{level === 3 ? "IR PARA O FINAL" : "PRÓXIMO NÍVEL"}</button>
                </div>
            </div>
        )}
    </div>
  );
};

/* =========================================================================
   5. JOGO 2: MEMORY GAME (FINAL CHALLENGE) - React Implementation
   ========================================================================= */
const MemoryGame = ({ onComplete }) => {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [victory, setVictory] = useState(false);

    useEffect(() => {
        const types = [
            { id: 1, label: 'Mouse', icon: <MousePointer size={32} /> },
            { id: 2, label: 'Teclado', icon: <Keyboard size={32} /> },
            { id: 3, label: 'Tela', icon: <Monitor size={32} /> }
        ];
        // Duplicar, embaralhar e adicionar ID único
        const deck = [...types, ...types]
            .sort(() => Math.random() - 0.5)
            .map((item, index) => ({ ...item, uniqueId: index }));
        setCards(deck);
    }, []);

    const handleCardClick = (card) => {
        if (flipped.length === 2 || flipped.some(c => c.uniqueId === card.uniqueId) || matched.includes(card.id)) return;
        
        const newFlipped = [...flipped, card];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            const [c1, c2] = newFlipped;
            if (c1.id === c2.id) {
                setMatched(prev => [...prev, c1.id]);
                setFlipped([]);
                if (matched.length + 1 === 3) setTimeout(() => setVictory(true), 500);
            } else {
                setTimeout(() => setFlipped([]), 1000);
            }
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-slate-900">
            {/* Efeito Mouse Trail */}
            <div onMouseMove={(e) => {
                const trail = document.createElement('div');
                trail.className = 'trail';
                trail.style.left = `${e.clientX}px`;
                trail.style.top = `${e.clientY}px`;
                document.body.appendChild(trail);
                setTimeout(() => trail.remove(), 800);
            }} className="absolute inset-0 z-0" />

            <div className="z-10 text-center mb-8">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2 drop-shadow-lg">DESAFIO DA MEMÓRIA</h1>
                <p className="text-cyan-200 bg-slate-800/50 px-4 py-1 rounded-full border border-cyan-500/30">Encontre os 3 pares tecnológicos!</p>
            </div>

            <div className="grid grid-cols-3 gap-4 z-10 w-full max-w-lg px-4">
                {cards.map(card => {
                    const isFlipped = flipped.some(c => c.uniqueId === card.uniqueId) || matched.includes(card.id);
                    return (
                        <div 
                            key={card.uniqueId} 
                            onClick={() => handleCardClick(card)}
                            className={`memory-card-container h-32 cursor-pointer`}
                        >
                            <div className={`memory-card w-full h-full relative ${isFlipped ? 'flip' : ''} ${matched.includes(card.id) ? 'matched' : ''}`}>
                                <div className="front-face">
                                    <div className="text-cyan-400 mb-2">{card.icon}</div>
                                    <span className="text-white font-bold text-sm">{card.label}</span>
                                </div>
                                <div className="back-face flex items-center justify-center">
                                    <Zap size={32} className="text-cyan-500 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {victory && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50 animate-enter">
                    <div className="glass-panel p-10 rounded-[2rem] text-center border-2 border-cyan-500 shadow-[0_0_50px_var(--neon-blue)]">
                        <Trophy size={80} className="mx-auto text-yellow-400 mb-4 animate-bounce" />
                        <h2 className="text-5xl font-black text-white mb-4">MISSÃO CUMPRIDA!</h2>
                        <p className="text-xl text-cyan-200 mb-8">Você provou ser um verdadeiro Gumer.</p>
                        <button onClick={onComplete} className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black rounded-full text-xl hover:scale-105 transition shadow-lg">
                            PEGAR CERTIFICADO
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

/* =========================================================================
   6. COMPONENTE PRINCIPAL (CONTROLADOR DE FASES)
   ========================================================================= */
export default function Aula01() {
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  const currentData = SLIDES_DATA[currentStage];
  const progressPercent = ((currentStage + 1) / SLIDES_DATA.length) * 100;

  // Controle de Áudio Automático
  useEffect(() => {
    if (currentData.type === 'slide' && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = currentData.audio;
        // Pequeno delay para evitar erro de promessa interrompida
        setTimeout(() => {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }, 150);
    }
  }, [currentStage, currentData]);

  const nextStage = () => {
    if (currentStage < SLIDES_DATA.length - 1) setCurrentStage(prev => prev + 1);
  };

  const toggleAudio = () => {
    if (audioRef.current) {
        if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
        else { audioRef.current.play(); setIsPlaying(true); }
    }
  };

  return (
    <div className="w-full h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden flex flex-col relative">
      <GlobalStyles />
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      {/* BARRA DE PROGRESSO NEON (Fixada no Topo - Z-INDEX 100) */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-800 z-[100]">
        <div 
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_15px_#00f3ff] transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="flex-1 relative flex flex-col w-full h-full">
        
        {/* VÍDEO INTRODUTÓRIO */}
        {currentData.type === 'video' && (
            <div className="absolute inset-0 bg-black z-[90] flex items-center justify-center animate-enter">
                <video 
                    src={currentData.src} 
                    className="w-full h-full object-cover opacity-90"
                    autoPlay playsInline
                    onEnded={nextStage}
                />
                <button onClick={nextStage} className="absolute bottom-10 right-10 glass-panel px-6 py-2 rounded-full uppercase text-sm hover:bg-white/10 transition z-[100]">Pular Intro</button>
            </div>
        )}

        {/* SLIDES NARRATIVOS */}
        {currentData.type === 'slide' && (
            <div className="h-full w-full flex flex-col relative overflow-hidden">
                {/* Fundo Animado */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-black z-0">
                    <CreativeOverlay type={currentData.effect} />
                </div>

                {/* HUD Audio */}
                <div className="absolute top-6 right-6 z-40">
                    <button onClick={toggleAudio} className="glass-panel p-3 rounded-full hover:bg-white/10 transition active:scale-95 group">
                        {isPlaying ? <Volume2 className="text-cyan-400 group-hover:text-cyan-300" /> : <VolumeX className="text-slate-500" />}
                    </button>
                </div>

                {/* Título */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 text-center max-w-5xl mx-auto mt-[-60px]">
                    <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-blue-400 to-purple-500 mb-8 drop-shadow-2xl animate-enter tracking-tight">
                        {currentData.title}
                    </h1>
                </div>

                {/* JACK E FALA (Fixed Bottom) */}
                <div className="absolute bottom-0 w-full flex flex-col items-center justify-end pb-8 px-4 z-40">
                    <div className="w-full max-w-5xl flex items-end gap-4 md:gap-10">
                        
                        {/* Avatar do Jack (Correção Z-Index para não cortar) */}
                        <div className="w-36 h-36 md:w-56 md:h-56 relative flex-shrink-0 group">
                             <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full animate-pulse"></div>
                             {/* Fundo do Círculo */}
                             <div className="absolute bottom-0 w-full h-full rounded-full bg-slate-800 border-[3px] border-cyan-500/50 shadow-2xl overflow-hidden z-10 glass-panel">
                                 <div className="w-full h-full bg-gradient-to-t from-black/80 to-transparent"></div>
                             </div>
                             {/* GIF (Z-index superior para sair do círculo) */}
                             <img 
                                src={currentData.gif} 
                                alt="Jack" 
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[130%] max-w-none z-20 transition-transform duration-500 group-hover:scale-105"
                                style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
                             />
                             <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-cyan-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg z-30 border border-cyan-400/50">Jack</div>
                        </div>

                        {/* Balão */}
                        <div className="flex-1 glass-panel p-6 md:p-8 rounded-[2rem] rounded-bl-none shadow-2xl mb-6 relative min-h-[160px] flex flex-col justify-between animate-enter border-l-4 border-l-cyan-500">
                            <div className="text-lg md:text-2xl text-slate-100 font-medium leading-relaxed drop-shadow-md">
                                <TypingText text={currentData.text} />
                                <span className="inline-block w-2 h-5 bg-cyan-400 ml-1 animate-pulse align-middle"></span>
                            </div>
                            <div className="flex justify-end mt-4">
                                <button onClick={nextStage} className="flex items-center gap-2 bg-slate-700/50 hover:bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 px-6 py-2.5 rounded-full font-bold transition-all hover:scale-105 group">
                                    {currentData.isLast ? "INICIAR DESAFIO" : "CONTINUAR"} 
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* JOGOS */}
        {currentData.type === 'game-ninja' && <NinjaLineGame onComplete={nextStage} />}
        {currentData.type === 'game-memory' && <MemoryGame onComplete={nextStage} />}
        
        {/* TELA FINAL DE CELEBRAÇÃO */}
        {currentData.type === 'celebration' && (
            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50 animate-enter text-center p-4">
                <Sparkles size={100} className="text-yellow-400 animate-spin-slow mb-6" />
                <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-4">PARABÉNS!</h1>
                <p className="text-2xl text-slate-300 mb-8 max-w-2xl">Você completou a Missão 01 com excelência. O Universo Tech está orgulhoso de você!</p>
                <button onClick={() => navigate('/')} className="bg-white text-black font-black px-10 py-4 rounded-full text-xl hover:scale-110 transition shadow-[0_0_50px_white]">VOLTAR AO MENU</button>
            </div>
        )}
      </div>
    </div>
  );
}
