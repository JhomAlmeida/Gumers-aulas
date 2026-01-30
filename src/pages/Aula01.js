import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, ArrowRight, Gamepad2, MousePointer, Rat, Hand, Zap, CheckCircle, Brain, Sparkles } from 'lucide-react';

/* =========================================================================
   ESTILOS GLOBAIS & ANIMAÇÕES (CSS IN JS)
   ========================================================================= */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap');
    
    body { font-family: 'Fredoka', sans-serif; background-color: #050510; }

    /* Animações Gerais */
    @keyframes slideUpFade { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
    @keyframes neonPulse { 0%, 100% { box-shadow: 0 0 10px #00f3ff, 0 0 20px #00f3ff; } 50% { box-shadow: 0 0 25px #bc13fe, 0 0 50px #bc13fe; } }
    @keyframes shine { from { transform: scale(1); filter: drop-shadow(0 0 10px cyan); } to { transform: scale(1.1); filter: drop-shadow(0 0 30px #00f3ff); } }
    @keyframes pulse-card { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }

    .animate-slide-up { animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-float { animation: float 6s ease-in-out infinite; }
    
    /* Classes Utilitárias */
    .glass-panel {
      background: rgba(26, 26, 46, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(0, 243, 255, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    /* Efeito Mouse Trail (Glitter) */
    .trail {
        position: fixed; pointer-events: none;
        background: #00f3ff; border-radius: 50%;
        box-shadow: 0 0 10px #00f3ff, 0 0 20px #bc13fe;
        animation: particleFade 1s linear forwards; z-index: 9999;
    }
    @keyframes particleFade { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(0); opacity: 0; top: -50px; } }

    /* Cartas do Jogo da Memória */
    .memory-card { transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1); }
    .memory-card.flip { transform: rotateY(180deg); }
    .memory-card.matched { animation: pulse-card 0.5s ease-in-out; opacity: 0.7; }
    .front-face, .back-face {
        backface-visibility: hidden; position: absolute; width: 100%; height: 100%;
        border-radius: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center;
        border: 2px solid #00f3ff; box-shadow: 0 0 15px rgba(0, 243, 255, 0.15);
    }
    .front-face { background: #fff; color: #333; transform: rotateY(180deg); }
    .back-face { background: linear-gradient(135deg, #111 0%, #000033 100%); color: #00f3ff; font-size: 2rem; }
  `}</style>
);

/* =========================================================================
   DADOS DA AULA (Roteiro Completo)
   ========================================================================= */
const SLIDES_DATA = [
  { type: 'video', src: '/abertura-aula.mp4' },
  { type: 'slide', id: 1,  audio: '/slide-01.wav', gif: '/gif01.gif', title: 'Boas-vindas, Tech Master!', text: 'E aí! Eu sou o Jack, seu Player 2 nessa jornada épica. Se você está aqui, é porque quer dominar a tecnologia de verdade. Preparado para subir de nível?' },
  { type: 'slide', id: 2,  audio: '/slide-02.wav', gif: '/gif02.gif', title: 'Nada de Aulas Chatas', text: 'Esqueça aquela ideia de "aula chata". Aqui nós temos Missões! Cada etapa foi criada para você se divertir enquanto aprende.' },
  { type: 'slide', id: 3,  audio: '/slide-03.wav', gif: '/gif01.gif', title: 'O Mapa de Fases', text: 'Dá uma olhada no nosso mapa! Cada fase desbloqueia um superpoder diferente. Vamos no seu ritmo, do zero ao profissional.' },
  { type: 'slide', id: 4,  audio: '/slide-04.wav', gif: '/gif02.gif', title: 'Objetivo Final', text: 'Ao final desta saga, você vai dominar o Mouse, o Teclado e entender exatamente o que acontece dentro da máquina!' },
  { type: 'slide', id: 5,  audio: '/slide-05.wav', gif: '/gif01.gif', title: 'A Primeira Missão', text: 'Nesta missão inicial, vamos descobrir como a informação viaja até nós. Foca na tela, pois a jornada começa agora!' },
  
  // BLOCO VISUAL
  { type: 'slide', id: 6,  audio: '/slide-06.wav', gif: '/gif02.gif', title: 'O Mouse', text: 'Primeira parada: O Mouse! Você sabia que "Mouse" significa "Rato" em inglês? O formato dele lembra um ratinho com cauda.', effect: 'mouse-rat' },
  { type: 'slide', id: 7,  audio: '/slide-07.wav', gif: '/gif01.gif', title: 'Ele Não Morde!', text: 'Relaxa, esse rato não morde! Ele é o nosso periférico de entrada principal. Ele funciona como uma extensão da sua mão na tela.', effect: 'hand' },
  { type: 'slide', id: 8,  audio: '/slide-08.wav', gif: '/gif02.gif', title: 'O Cursor', text: 'Quando você move o mouse aqui fora, ele controla aquele Cursor (a setinha) lá dentro. É pura mágica tecnológica!', effect: 'cursor' },
  
  { type: 'slide', id: 9,  audio: '/slide-09.wav', gif: '/gif01.gif', title: 'O Clique', text: 'E tem o clique! É como apertar o gatilho num jogo. O som de "click" confirma que o computador entendeu seu comando.' },
  { type: 'slide', id: 10, audio: '/slide-10.wav', gif: '/gif02.gif', title: 'Ergonomia Pro', text: 'Segredo de Pro Player: Conforto. Ninguém quer ter "Game Over" na mão por causa de dor, né?' },
  { type: 'slide', id: 11, audio: '/slide-11.wav', gif: '/gif01.gif', title: 'Modo Sem Dor', text: 'Usar o mouse do jeito errado cansa rápido. Vamos ativar o Modo Ergonômico para usar o computador por horas com saúde.' },
  { type: 'slide', id: 12, audio: '/slide-12.wav', gif: '/gif02.gif', title: 'Mão Relaxada', text: 'Regra de ouro: Mão relaxada! Deixe sua mão descansar sobre o mouse, como se fosse um travesseiro macio.' },
  { type: 'slide', id: 13, audio: '/slide-13.wav', gif: '/gif01.gif', title: 'Cuidado com o Punho', text: 'Atenção ao punho! Nada de deixar o pulso dobrado na quina da mesa. O braço precisa ter apoio total.' },
  
  { type: 'slide', id: 14, audio: '/slide-14.wav', gif: '/gif02.gif', title: 'Desafio de Precisão', text: 'Chega de papo, hora da ação! Vamos ver se você pegou o jeito. Sua missão é levar o cursor do ponto A ao ponto B.' },
  { type: 'game-ninja' }, // Jogo 1
  
  { type: 'slide', id: 15, audio: '/slide-15.wav', gif: '/gif01.gif', title: 'Desafio Final', text: 'Incrível! Seus reflexos são ótimos. Agora, vamos testar sua memória tecnológica com o Desafio Ninja Final!', isLast: true },
  { type: 'game-memory' } // Jogo 2 (Final)
];

/* =========================================================================
   COMPONENTE: EFEITO DE DIGITAÇÃO
   ========================================================================= */
const TypingText = ({ text, speed = 25 }) => {
    const [displayedText, setDisplayedText] = useState("");
    useEffect(() => {
      setDisplayedText(""); 
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
    return <span className="leading-relaxed">{displayedText}</span>;
};

/* =========================================================================
   COMPONENTE: ILUSTRAÇÕES FLUTUANTES
   ========================================================================= */
const CreativeOverlay = ({ type }) => {
    if (!type) return null;
    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-40">
            {type === 'mouse-rat' && (
                <div className="relative animate-float">
                    <MousePointer size={300} className="text-cyan-500 absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]" />
                    <Rat size={300} className="text-pink-500 absolute top-0 left-32 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_30px_rgba(236,72,153,0.5)]" />
                </div>
            )}
            {type === 'hand' && (
                <div className="animate-float">
                     <Hand size={400} className="text-yellow-400 drop-shadow-[0_0_50px_rgba(250,204,21,0.5)] rotate-12" />
                </div>
            )}
            {type === 'cursor' && (
                <div className="animate-pulse">
                    <Zap size={400} className="text-blue-500 blur-sm opacity-80" />
                </div>
            )}
        </div>
    );
};

/* =========================================================================
   JOGO 1: DESAFIO NINJA (LINE GAME)
   ========================================================================= */
const NinjaLineGame = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState('start'); 
  const [msg, setMsg] = useState("Toque no círculo azul!");
  const [msgColor, setMsgColor] = useState("white");

  const glRef = useRef({
    width: 0, height: 0, particles: [], obstacles: [], mouse: { x: 0, y: 0 },
    hasEnergy: false, active: false,
    pointA: { x: 0, y: 0, radius: 45, color: '#22d3ee', label: 'INÍCIO' },
    pointB: { x: 0, y: 0, radius: 45, color: '#a855f7', label: 'FIM' },
    animationFrameId: null
  });

  const levels = {
    1: { name: "Nível 1: Treino Básico", obsCount: 0, speed: 0 },
    2: { name: "Nível 2: Templo do Perigo", obsCount: 2, speed: 2 },
    3: { name: "Nível 3: Mestre das Sombras", obsCount: 4, speed: 3.5 }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const gl = glRef.current;

    const resize = () => {
      gl.width = window.innerWidth; gl.height = window.innerHeight;
      canvas.width = gl.width; canvas.height = gl.height;
      gl.pointA.x = gl.width * 0.15; gl.pointA.y = gl.height / 2;
      gl.pointB.x = gl.width * 0.85; gl.pointB.y = gl.height / 2;
      if (gl.active) initObstacles();
    };
    window.addEventListener('resize', resize);
    resize();

    function initObstacles() {
      gl.obstacles = [];
      const count = levels[level].obsCount;
      if(count === 0) return;
      const step = (gl.pointB.x - gl.pointA.x) / (count + 1);
      for (let i = 1; i <= count; i++) {
        gl.obstacles.push({
            x: gl.pointA.x + (step * i) - 20,
            y: (gl.height / 2) - 60 + (Math.random() * 100 - 50),
            w: 40, h: 120, speed: levels[level].speed, dir: Math.random() > 0.5 ? 1 : -1
        });
      }
    }

    const animate = () => {
      ctx.fillStyle = '#050510'; ctx.fillRect(0, 0, gl.width, gl.height);
      // Grid
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)'; ctx.lineWidth = 1;
      for(let i=0; i<gl.width; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,gl.height); ctx.stroke(); }

      if (gl.active) {
        drawPoint(ctx, gl.pointA, gl.hasEnergy ? '#334155' : gl.pointA.color, !gl.hasEnergy);
        drawPoint(ctx, gl.pointB, gl.hasEnergy ? gl.pointB.color : '#334155', gl.hasEnergy);
        
        gl.obstacles.forEach(obs => {
            obs.y += obs.speed * obs.dir;
            if (obs.y < 50 || obs.y > gl.height - obs.h - 50) obs.dir *= -1;
            ctx.shadowBlur = 15; ctx.shadowColor = '#ef4444'; ctx.fillStyle = '#ef4444'; 
            ctx.beginPath(); ctx.roundRect(obs.x, obs.y, obs.w, obs.h, 8); ctx.fill(); ctx.shadowBlur = 0;
        });
      }

      // Particles
      for (let i = gl.particles.length - 1; i >= 0; i--) {
        let p = gl.particles[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.03;
        ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        if (p.life <= 0) gl.particles.splice(i, 1);
      }
      gl.animationFrameId = requestAnimationFrame(animate);
    };

    const drawPoint = (ctx, p, color, active) => {
        ctx.save(); ctx.shadowBlur = active ? 30 : 0; ctx.shadowColor = color; ctx.strokeStyle = color; ctx.lineWidth = active ? 6 : 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1; ctx.fillStyle = 'white'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(p.label, p.x, p.y + p.radius + 30); ctx.restore();
    };

    const handleMove = (e) => {
        if (!gl.active) return;
        const cx = e.clientX || e.touches?.[0]?.clientX;
        const cy = e.clientY || e.touches?.[0]?.clientY;
        if(!cx || !cy) return;
        gl.mouse.x = cx; gl.mouse.y = cy;

        // Mouse Trail
        if(Math.random()>0.5) gl.particles.push({x:cx,y:cy,vx:(Math.random()-0.5)*2,vy:(Math.random()-0.5)*2,life:1,color:gl.hasEnergy?'#fcd34d':'#fff',size:Math.random()*3});

        const distA = Math.hypot(gl.mouse.x - gl.pointA.x, gl.mouse.y - gl.pointA.y);
        if (distA < gl.pointA.radius && !gl.hasEnergy) {
            gl.hasEnergy = true; setMsg("ENERGIA COLETADA! ⚡"); setMsgColor("#fcd34d");
        }

        const distB = Math.hypot(gl.mouse.x - gl.pointB.x, gl.mouse.y - gl.pointB.y);
        if (distB < gl.pointB.radius && gl.hasEnergy) {
            gl.active = false; setGameState('win');
            for(let i=0; i<30; i++) gl.particles.push({x:gl.pointB.x,y:gl.pointB.y,vx:(Math.random()-0.5)*15,vy:(Math.random()-0.5)*15,life:1,color:'#a855f7',size:Math.random()*5});
        }

        if (gl.hasEnergy) {
            gl.obstacles.forEach(obs => {
                if (gl.mouse.x > obs.x && gl.mouse.x < obs.x + obs.w && gl.mouse.y > obs.y && gl.mouse.y < obs.y + obs.h) {
                    gl.hasEnergy = false; setMsg("💥 VOCÊ BATEU! VOLTE AO INÍCIO!"); setMsgColor("#ef4444");
                    for(let i=0; i<20; i++) gl.particles.push({x:gl.mouse.x,y:gl.mouse.y,vx:(Math.random()-0.5)*10,vy:(Math.random()-0.5)*10,life:1,color:'#ef4444',size:Math.random()*5});
                }
            });
        }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    animate();

    return () => {
        window.removeEventListener('resize', resize); window.removeEventListener('mousemove', handleMove); window.removeEventListener('touchmove', handleMove);
        cancelAnimationFrame(gl.animationFrameId);
    };
  }, [level]);

  const next = () => {
      if(level >= 3) onComplete();
      else { setLevel(prev => prev + 1); setGameState('playing'); glRef.current.active = true; glRef.current.hasEnergy = false; }
  };

  return (
    <div className="w-full h-full relative font-sans overflow-hidden bg-[#050510] cursor-crosshair">
        <canvas ref={canvasRef} className="block touch-none" />
        <div className="absolute top-20 w-full flex justify-center pointer-events-none"><div className="glass-panel px-6 py-2 rounded-full text-purple-300 font-bold uppercase tracking-widest">{levels[level].name}</div></div>
        <div className="absolute bottom-10 w-full text-center pointer-events-none"><span className="inline-block px-8 py-3 rounded-2xl glass-panel font-bold text-xl" style={{ color: msgColor }}>{msg}</span></div>
        
        {gameState === 'start' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
                <div className="glass-panel p-8 rounded-[2rem] max-w-md text-center">
                    <Gamepad2 size={64} className="mx-auto text-cyan-400 mb-4 animate-bounce" />
                    <h2 className="text-3xl font-bold text-white mb-2">DESAFIO NINJA</h2>
                    <p className="text-slate-300 mb-6">Leve a energia do ponto A ao B sem tocar no vermelho!</p>
                    <button onClick={() => { glRef.current.active = true; setGameState('playing'); }} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition">COMEÇAR</button>
                </div>
            </div>
        )}
        {gameState === 'win' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
                <div className="glass-panel p-8 rounded-[2rem] max-w-md text-center">
                    <CheckCircle size={64} className="mx-auto text-green-400 mb-4 animate-pulse" />
                    <h2 className="text-3xl font-bold text-white mb-2">{level === 3 ? "MESTRE SUPREMO!" : "VITÓRIA!"}</h2>
                    <button onClick={next} className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition">{level === 3 ? "IR PARA DESAFIO FINAL" : "PRÓXIMO NÍVEL"}</button>
                </div>
            </div>
        )}
    </div>
  );
};

/* =========================================================================
   JOGO 2: DESAFIO DA MEMÓRIA (FINAL)
   ========================================================================= */
const MemoryGame = ({ onComplete }) => {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [won, setWon] = useState(false);

    useEffect(() => {
        // Efeito do Mouse Glitter
        const handleMouseMove = (e) => {
            const p = document.createElement('div');
            p.classList.add('trail');
            p.style.left = e.pageX + 'px'; p.style.top = e.pageY + 'px';
            const size = Math.random() * 8 + 4;
            p.style.width = size + 'px'; p.style.height = size + 'px';
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 800);
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Setup Cartas
        const concepts = [
            { id: 1, name: "Mouse", icon: <MousePointer size={40} /> },
            { id: 2, name: "Teclado", icon: "⌨️" },
            { id: 3, name: "Gamer", icon: <Gamepad2 size={40} /> }
        ];
        // Duplicar e embaralhar
        const deck = [...concepts, ...concepts].map((item, idx) => ({ ...item, uniqueId: idx }));
        setCards(deck.sort(() => Math.random() - 0.5));

        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleCardClick = (card) => {
        if (flipped.length === 2 || flipped.some(c => c.uniqueId === card.uniqueId) || matched.includes(card.id)) return;
        
        const newFlipped = [...flipped, card];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            if (newFlipped[0].id === newFlipped[1].id) {
                setMatched([...matched, newFlipped[0].id]);
                setFlipped([]);
                if (matched.length + 1 === 3) setWon(true);
            } else {
                setTimeout(() => setFlipped([]), 1000);
            }
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#050510] relative overflow-hidden">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-8 animate-pulse text-center uppercase tracking-widest" style={{ textShadow: '0 0 20px rgba(0,243,255,0.3)' }}>Desafio Final</h2>
            
            <div className="grid grid-cols-3 gap-4 max-w-2xl w-full p-4 z-10">
                {cards.map(card => {
                    const isFlipped = flipped.some(c => c.uniqueId === card.uniqueId) || matched.includes(card.id);
                    return (
                        <div key={card.uniqueId} 
                             onClick={() => handleCardClick(card)}
                             className={`memory-card relative h-32 cursor-pointer transition-all duration-500 ${isFlipped ? 'flip' : ''} ${matched.includes(card.id) ? 'matched' : ''}`}>
                            <div className="front-face">
                                <div className="text-cyan-500 animate-bounce">{card.icon}</div>
                                <span className="mt-2 font-bold text-sm text-slate-700">{card.name}</span>
                            </div>
                            <div className="back-face flex items-center justify-center">
                                <Zap size={32} className="animate-pulse" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {won && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50 animate-fade-in">
                    <div className="glass-panel p-10 rounded-[2rem] text-center border-2 border-cyan-500 shadow-[0_0_100px_cyan]">
                        <Sparkles size={80} className="mx-auto text-yellow-400 mb-4 animate-spin-slow" />
                        <h1 className="text-5xl font-black text-white mb-4">VOCÊ É UM GUMER!</h1>
                        <p className="text-xl text-cyan-200 mb-8">Parabéns! Você completou todas as missões com excelência.</p>
                        <button onClick={onComplete} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black rounded-full text-2xl hover:scale-105 shadow-lg transition">PEGAR CERTIFICADO</button>
                    </div>
                </div>
            )}
        </div>
    );
};

/* =========================================================================
   COMPONENTE PRINCIPAL: AULA 01
   ========================================================================= */
export default function Aula01() {
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  const currentData = SLIDES_DATA[currentStage];
  const progressPercent = ((currentStage + 1) / SLIDES_DATA.length) * 100;

  useEffect(() => {
    if (currentData.type === 'slide' && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = currentData.audio;
        setTimeout(() => {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }, 100);
    }
  }, [currentStage, currentData]);

  const nextStage = () => {
    if (currentStage < SLIDES_DATA.length - 1) setCurrentStage(prev => prev + 1);
    else navigate('/'); // Fim da aula
  };

  const toggleAudio = () => {
    if (audioRef.current) {
        if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
        else { audioRef.current.play(); setIsPlaying(true); }
    }
  };

  return (
    <div className="w-full h-screen bg-[#050510] text-slate-100 font-sans overflow-hidden flex flex-col relative selection:bg-cyan-500 selection:text-white">
      <GlobalStyles />
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      {/* BARRA NEON DE PROGRESSO */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-900 z-[100]">
        <div className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_15px_#22d3ee] transition-all duration-700 ease-out" style={{ width: `${progressPercent}%` }}></div>
      </div>

      <div className="flex-1 relative flex flex-col w-full h-full">
        
        {/* VÍDEO INTRODUTÓRIO */}
        {currentData.type === 'video' && (
            <div className="absolute inset-0 bg-black z-[90] flex items-center justify-center animate-fade-in">
                <video src={currentData.src} className="w-full h-full object-cover opacity-90" autoPlay playsInline onEnded={nextStage} />
                <button onClick={nextStage} className="absolute bottom-12 right-12 text-white/50 hover:text-white border border-white/20 hover:border-white px-6 py-2 rounded-full uppercase tracking-widest text-sm transition-all z-[100] hover:bg-white/10">Pular Introdução</button>
            </div>
        )}

        {/* SLIDES */}
        {currentData.type === 'slide' && (
            <div className="h-full w-full flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-indigo-900/30 via-[#050510] to-black z-0">
                    <CreativeOverlay type={currentData.effect} />
                </div>

                <div className="absolute top-6 right-6 z-40">
                    <button onClick={toggleAudio} className="glass-panel p-3 rounded-full hover:bg-white/5 transition active:scale-95 group">
                        {isPlaying ? <Volume2 className="text-cyan-400 group-hover:text-cyan-300" /> : <VolumeX className="text-slate-500" />}
                    </button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 text-center max-w-5xl mx-auto mt-[-60px]">
                    <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-blue-400 to-purple-500 mb-8 drop-shadow-2xl animate-slide-up tracking-tight">
                        {currentData.title}
                    </h1>
                </div>

                {/* JACK E DIÁLOGO */}
                <div className="absolute bottom-0 w-full flex flex-col items-center justify-end pb-8 px-4 z-40">
                    <div className="w-full max-w-5xl flex items-end gap-6 md:gap-10">
                        <div className="w-40 h-40 md:w-56 md:h-56 relative flex-shrink-0 group">
                             <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full animate-pulse"></div>
                             <div className="absolute bottom-0 w-full h-full rounded-full bg-slate-800 border-[3px] border-cyan-500/50 shadow-2xl overflow-hidden z-10 glass-panel">
                                 <div className="w-full h-full bg-gradient-to-t from-black/80 to-transparent"></div>
                             </div>
                             <img src={currentData.gif} alt="Jack" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[130%] max-w-none z-20 transition-transform duration-500 group-hover:scale-105" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }} />
                             <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-cyan-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg z-30 border border-cyan-400/50">Jack</div>
                        </div>

                        <div className="flex-1 glass-panel p-8 rounded-[2rem] rounded-bl-none shadow-2xl mb-6 relative min-h-[180px] flex flex-col justify-between animate-slide-up border-l-4 border-l-cyan-500">
                            <div className="text-xl md:text-2xl text-slate-100 font-medium leading-relaxed drop-shadow-md">
                                <TypingText text={currentData.text} speed={30} />
                                <span className="inline-block w-2 h-6 bg-cyan-400 ml-1 animate-pulse align-middle"></span>
                            </div>
                            <div className="flex justify-end mt-4">
                                <button onClick={nextStage} className={`flex items-center gap-2 ${currentData.isLast ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'bg-slate-700/50 hover:bg-cyan-600/20 text-cyan-300 border border-cyan-500/30'} px-6 py-2.5 rounded-full font-bold text-base transition-all hover:scale-105 group`}>
                                    {currentData.isLast ? "INICIAR DESAFIO FINAL" : "CONTINUAR"} <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* JOGOS */}
        {currentData.type === 'game-ninja' && <NinjaLineGame onComplete={nextStage} />}
        {currentData.type === 'game-memory' && <MemoryGame onComplete={() => alert("CURSO FINALIZADO! PARABÉNS!")} />}
      </div>
    </div>
  );
}
