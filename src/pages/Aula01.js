import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, ArrowRight, Gamepad2, MousePointer, Rat, Hand, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

/* =========================================================================
   ESTILOS GLOBAIS (SENIOR LEVEL ANIMATIONS)
   Injetados via JS para garantir performance sem bibliotecas externas
   ========================================================================= */
const GlobalStyles = () => (
  <style>{`
    @keyframes slideUpFade {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
    }
    @keyframes neonPulse {
      0%, 100% { box-shadow: 0 0 10px #22d3ee, 0 0 20px #22d3ee; }
      50% { box-shadow: 0 0 25px #a855f7, 0 0 50px #a855f7; }
    }
    @keyframes scanline {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    }
    .animate-slide-up { animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-neon { animation: neonPulse 3s infinite; }
    .glass-panel {
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    }
    .cursor-glow {
      pointer-events: none;
      position: fixed;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      z-index: 0;
      transition: opacity 0.3s;
    }
  `}</style>
);

/* =========================================================================
   DADOS DA AULA (TEXTOS CORRIGIDOS E REVISADOS)
   ========================================================================= */
const SLIDES_DATA = [
  { type: 'video', src: '/abertura-aula.mp4' },
  { type: 'slide', id: 1,  audio: '/slide-01.wav', gif: '/gif01.gif', title: 'Boas-vindas, Tech Master!', text: 'E aí! Eu sou o Jack, seu Player 2 nessa jornada épica. Se você está aqui, é porque quer dominar a tecnologia de verdade. Preparado para subir de nível?' },
  { type: 'slide', id: 2,  audio: '/slide-02.wav', gif: '/gif02.gif', title: 'Nada de Aulas Chatas', text: 'Esqueça aquela ideia de "aula chata". Aqui nós temos Missões! Cada etapa foi criada para você se divertir enquanto aprende.' },
  { type: 'slide', id: 3,  audio: '/slide-03.wav', gif: '/gif01.gif', title: 'O Mapa de Fases', text: 'Dá uma olhada no nosso mapa! Cada fase desbloqueia um superpoder diferente. Vamos no seu ritmo, do zero ao profissional.' },
  { type: 'slide', id: 4,  audio: '/slide-04.wav', gif: '/gif02.gif', title: 'Objetivo Final', text: 'Ao final desta saga, você vai dominar o Mouse, o Teclado e entender exatamente o que acontece dentro da máquina!' },
  { type: 'slide', id: 5,  audio: '/slide-05.wav', gif: '/gif01.gif', title: 'A Primeira Missão', text: 'Nesta missão inicial, vamos descobrir como a informação viaja até nós. Foca na tela, pois a jornada começa agora!' },
  
  // BLOCO VISUAL
  { type: 'slide', id: 6,  audio: '/slide-06.wav', gif: '/gif02.gif', title: 'O Mouse', text: 'Primeira parada: O Mouse! Você sabia que "Mouse" significa "Rato" em inglês? O formato dele lembrava um ratinho com cauda.', effect: 'mouse-rat' },
  { type: 'slide', id: 7,  audio: '/slide-07.wav', gif: '/gif01.gif', title: 'Ele Não Morde!', text: 'Relaxa, esse rato não morde! Ele é o nosso periférico de entrada principal. Ele funciona como uma extensão da sua mão na tela.', effect: 'hand' },
  { type: 'slide', id: 8,  audio: '/slide-08.wav', gif: '/gif02.gif', title: 'O Cursor', text: 'Quando você move o mouse aqui fora, ele controla aquele Cursor (a setinha) lá dentro. É pura mágica tecnológica!', effect: 'cursor' },
  
  { type: 'slide', id: 9,  audio: '/slide-09.wav', gif: '/gif01.gif', title: 'O Clique', text: 'E tem o clique! É como apertar o gatilho num jogo. O som de "click" confirma que o computador entendeu seu comando.' },
  { type: 'slide', id: 10, audio: '/slide-10.wav', gif: '/gif02.gif', title: 'Ergonomia Pro', text: 'Segredo de Pro Player: Conforto. Ninguém quer ter "Game Over" na mão por causa de dor, né?' },
  { type: 'slide', id: 11, audio: '/slide-11.wav', gif: '/gif01.gif', title: 'Modo Sem Dor', text: 'Usar o mouse do jeito errado cansa rápido. Vamos ativar o Modo Ergonômico para jogar por horas com saúde.' },
  { type: 'slide', id: 12, audio: '/slide-12.wav', gif: '/gif02.gif', title: 'Mão Relaxada', text: 'Regra de ouro: Mão relaxada! Deixe sua mão descansar sobre o mouse, como se fosse um travesseiro macio.' },
  { type: 'slide', id: 13, audio: '/slide-13.wav', gif: '/gif01.gif', title: 'Cuidado com o Punho', text: 'Atenção ao punho! Nada de deixar o pulso dobrado na quina da mesa. O braço precisa ter apoio total.' },
  { type: 'slide', id: 14, audio: '/slide-14.wav', gif: '/gif02.gif', title: 'Desafio de Precisão', text: 'Chega de papo, hora da ação! Vamos ver se você pegou o jeito. Sua missão é levar o cursor do ponto A ao ponto B.' },
  { type: 'slide', id: 15, audio: '/slide-15.wav', gif: '/gif01.gif', title: 'Valendo!', text: 'Tente fazer uma linha reta e suave. Cuidado com os obstáculos vermelhos! Clique abaixo para começar.', isLast: true },
  
  { type: 'game' },
  
  // TELA FINAL
  { type: 'slide', id: 16, audio: '/slide-15.wav', gif: '/gif01.gif', title: 'MISSÃO CUMPRIDA!', text: 'Mandou muito bem! Você dominou o básico do mouse com precisão de mestre. Nos vemos na próxima Missão!', effect: 'fireworks', isCelebration: true }
];

/* =========================================================================
   COMPONENTE: EFEITO DE DIGITAÇÃO (Typewriter)
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
   COMPONENTE: EFEITOS VISUAIS FLUTUANTES (Overlay)
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
            {type === 'fireworks' && <FireworksCanvas />}
        </div>
    );
};

/* =========================================================================
   COMPONENTE: FOGOS DE ARTIFÍCIO (Canvas Otimizado)
   ========================================================================= */
const FireworksCanvas = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width; canvas.height = height;
        
        let particles = [];
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'];

        const createFirework = () => {
            const x = Math.random() * width;
            const y = Math.random() * (height / 2);
            const color = colors[Math.floor(Math.random() * colors.length)];
            for(let i=0; i<60; i++) {
                particles.push({
                    x, y, color,
                    vx: (Math.random() - 0.5) * 12,
                    vy: (Math.random() - 0.5) * 12,
                    life: 1, decay: 0.01 + Math.random() * 0.02
                });
            }
        };

        const interval = setInterval(createFirework, 600);

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.1)'; // Rastro suave
            ctx.fillRect(0, 0, width, height);

            for(let i=particles.length-1; i>=0; i--) {
                let p = particles[i];
                p.x += p.vx; p.y += p.vy; p.life -= p.decay;
                p.vy += 0.15; // Gravidade
                
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
                ctx.fill();

                if(p.life <= 0) particles.splice(i, 1);
            }
            requestAnimationFrame(animate);
        };
        animate();
        return () => clearInterval(interval);
    }, []);
    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

/* =========================================================================
   COMPONENTE: JOGO NINJA (Lógica Sênior - Sem Bugs)
   ========================================================================= */
const NinjaGame = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('start'); 
  const [level, setLevel] = useState(1);
  const [msg, setMsg] = useState("Toque no círculo azul para coletar energia!");
  const [msgColor, setMsgColor] = useState("white");

  // Uso de Ref para estado mutável do jogo (Performance 60FPS)
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
      
      // Responsividade dos pontos
      gl.pointA.x = gl.width * 0.15; gl.pointA.y = gl.height / 2;
      gl.pointB.x = gl.width * 0.85; gl.pointB.y = gl.height / 2;
      
      if (gl.active) initObstacles();
    };

    window.addEventListener('resize', resize);
    resize();

    class Obstacle {
      constructor() {
        this.w = 40; this.h = 120; this.x = 0; this.y = 0;
        this.speed = levels[level].speed; this.dir = Math.random() > 0.5 ? 1 : -1;
      }
      update() { 
        this.y += this.speed * this.dir; 
        // Colisão com bordas da tela
        if (this.y < 50 || this.y > gl.height - this.h - 50) this.dir *= -1; 
      }
      draw() { 
        // Efeito de brilho no obstáculo
        ctx.shadowBlur = 15; ctx.shadowColor = '#ef4444';
        ctx.fillStyle = '#ef4444'; 
        ctx.beginPath(); ctx.roundRect(this.x, this.y, this.w, this.h, 8); ctx.fill(); 
        ctx.shadowBlur = 0;
      }
    }

    function initObstacles() {
      gl.obstacles = [];
      const count = levels[level].obsCount;
      if (count === 0) return;
      
      const step = (gl.pointB.x - gl.pointA.x) / (count + 1);
      for (let i = 1; i <= count; i++) {
        let obs = new Obstacle();
        obs.x = gl.pointA.x + (step * i) - (obs.w / 2);
        obs.y = (gl.height / 2) - (obs.h / 2) + (Math.random() * 100 - 50);
        gl.obstacles.push(obs);
      }
    }

    const animate = () => {
      // Limpar tela com fade para rastro
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, gl.width, gl.height);
      
      // Grid futurista de fundo
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for(let x=0; x<gl.width; x+=gridSize) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,gl.height); ctx.stroke(); }
      for(let y=0; y<gl.height; y+=gridSize) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(gl.width,y); ctx.stroke(); }

      if (gl.active) {
        drawPoint(ctx, gl.pointA, gl.hasEnergy ? '#334155' : gl.pointA.color, !gl.hasEnergy);
        drawPoint(ctx, gl.pointB, gl.hasEnergy ? gl.pointB.color : '#334155', gl.hasEnergy);
        gl.obstacles.forEach(obs => { obs.update(); obs.draw(); });
      }

      // Partículas
      for (let i = gl.particles.length - 1; i >= 0; i--) {
        let p = gl.particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.02;
        ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        if (p.life <= 0) gl.particles.splice(i, 1);
      }
      gl.animationFrameId = requestAnimationFrame(animate);
    };

    const drawPoint = (context, p, color, active) => {
        context.save(); 
        context.shadowBlur = active ? 30 : 0; context.shadowColor = color;
        context.strokeStyle = color; context.lineWidth = active ? 6 : 2;
        context.beginPath(); context.arc(p.x, p.y, p.radius, 0, Math.PI * 2); context.stroke();
        
        if (active) {
            const pulse = Math.sin(Date.now() / 200) * 8;
            context.fillStyle = color; context.globalAlpha = 0.3;
            context.beginPath(); context.arc(p.x, p.y, p.radius + pulse, 0, Math.PI * 2); context.fill();
        }

        context.globalAlpha = 1; context.fillStyle = 'white'; 
        context.font = 'bold 16px sans-serif'; context.textAlign = 'center'; 
        context.fillText(p.label, p.x, p.y + p.radius + 30);
        context.restore();
    };

    const handleMove = (e) => {
        if (!gl.active) return;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        gl.mouse.x = clientX; gl.mouse.y = clientY;

        // Rastro do mouse
        if (Math.random() > 0.5) gl.particles.push({ x: clientX, y: clientY, vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2, life: 1, color: gl.hasEnergy ? '#fcd34d' : 'rgba(255,255,255,0.3)', size: Math.random()*3 });

        // Lógica de Colisão A (Início)
        const distA = Math.hypot(gl.mouse.x - gl.pointA.x, gl.mouse.y - gl.pointA.y);
        if (distA < gl.pointA.radius && !gl.hasEnergy) {
            gl.hasEnergy = true; 
            setMsg("ENERGIA COLETADA! ⚡ LEVE ATÉ O ROXO!"); setMsgColor("#fcd34d");
            createExplosion(gl.pointA.x, gl.pointA.y, gl.pointA.color);
        }

        // Lógica de Colisão B (Fim)
        const distB = Math.hypot(gl.mouse.x - gl.pointB.x, gl.mouse.y - gl.pointB.y);
        if (distB < gl.pointB.radius && gl.hasEnergy) winLevelInternal();

        // Lógica de Obstáculos
        if (gl.hasEnergy) {
            gl.obstacles.forEach(obs => {
                // Colisão simples AABB (Axis-Aligned Bounding Box)
                if (gl.mouse.x > obs.x && gl.mouse.x < obs.x + obs.w && gl.mouse.y > obs.y && gl.mouse.y < obs.y + obs.h) {
                    gl.hasEnergy = false; 
                    setMsg("💥 VOCÊ BATEU! VOLTE AO INÍCIO!"); setMsgColor("#ef4444");
                    createExplosion(gl.mouse.x, gl.mouse.y, "#ef4444", 20);
                }
            });
        }
    };

    const createExplosion = (x, y, color, count=15) => { 
        for(let i=0; i<count; i++) glRef.current.particles.push({ x, y, color, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, life: 1, size: Math.random()*5+2 }); 
    };
    
    const winLevelInternal = () => { 
        glRef.current.active = false; 
        setGameState('win'); 
        createExplosion(glRef.current.pointB.x, glRef.current.pointB.y, '#a855f7', 40); 
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
    animate();

    return () => {
        window.removeEventListener('resize', resize); window.removeEventListener('mousemove', handleMove); window.removeEventListener('touchmove', handleMove);
        cancelAnimationFrame(glRef.current.animationFrameId);
    };
  }, [level]);

  const startGame = () => { 
      glRef.current.active = true; 
      glRef.current.hasEnergy = false; 
      setGameState('playing'); 
      setMsg("TOQUE NO CÍRCULO AZUL!"); 
      setMsgColor("white"); 
      // Reinicia obstáculos
      if(level > 1) { 
        // Forçar reinício dos obstaculos será tratado no loop do animate pelo estado active
      }
  };

  const nextLevel = () => {
      if (level >= 3) { 
        onComplete(); 
      } else { 
          setLevel(prev => prev + 1); 
          setGameState('playing'); 
          glRef.current.active = true; 
          glRef.current.hasEnergy = false; 
      }
  };

  return (
    <div className="w-full h-full relative font-sans overflow-hidden bg-slate-900 cursor-crosshair">
        <canvas ref={canvasRef} className="block touch-none" />
        
        {/* HUD JOGO */}
        <div className="absolute top-20 w-full flex justify-center z-10 pointer-events-none">
            <div className="bg-slate-900/80 border border-purple-500/50 px-6 py-2 rounded-full text-purple-300 font-bold uppercase tracking-widest shadow-lg backdrop-blur-md">
                {levels[level].name}
            </div>
        </div>

        <div className="absolute bottom-10 left-0 w-full text-center pointer-events-none px-4">
            <span className="inline-block px-8 py-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 font-bold text-xl shadow-2xl transition-all duration-300 animate-slide-up" style={{ color: msgColor, textShadow: `0 0 10px ${msgColor}` }}>
                {msg}
            </span>
        </div>

        {gameState === 'start' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 animate-fade-in">
                <div className="bg-slate-900 p-8 rounded-[2rem] border-2 border-cyan-500 max-w-md text-center shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                    <Gamepad2 size={64} className="mx-auto text-cyan-400 mb-4 animate-bounce" />
                    <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">DESAFIO NINJA</h2>
                    <p className="text-slate-400 mb-8 font-medium">Leve a energia do ponto A ao B sem tocar nos obstáculos vermelhos. Mão firme!</p>
                    <button onClick={startGame} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black rounded-xl text-xl hover:scale-105 hover:shadow-lg transition-all active:scale-95">
                        COMEÇAR
                    </button>
                </div>
            </div>
        )}

        {gameState === 'win' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 animate-fade-in">
                <div className="bg-slate-900 p-8 rounded-[2rem] border-2 border-green-500 max-w-md text-center shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                    <CheckCircle size={64} className="mx-auto text-green-400 mb-4 animate-pulse" />
                    <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">{level === 3 ? "MESTRE SUPREMO!" : "VITÓRIA!"}</h2>
                    <p className="text-slate-400 mb-8 font-medium">Seus reflexos estão afiados. Continue assim!</p>
                    <button onClick={nextLevel} className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black rounded-xl text-xl hover:scale-105 hover:shadow-lg transition-all active:scale-95">
                        {level === 3 ? "CONCLUIR TREINAMENTO" : "PRÓXIMO NÍVEL"}
                    </button>
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

  // Gerenciamento Inteligente de Áudio
  useEffect(() => {
    if (currentData.type === 'slide' && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = currentData.audio;
        
        // Pequeno delay para garantir carregamento e evitar erro de play interrupted
        const timer = setTimeout(() => {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch((err) => {
                        console.warn("Autoplay impedido pelo navegador:", err);
                        setIsPlaying(false);
                    });
            }
        }, 100); // 100ms de buffer
        return () => clearTimeout(timer);
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
    <div className="w-full h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden flex flex-col relative selection:bg-cyan-500 selection:text-white">
      <GlobalStyles />
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      {/* BARRA NEON DE PROGRESSO (FIXED TOP Z-100) */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-900 z-[100]">
        <div 
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_15px_#22d3ee] transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="flex-1 relative flex flex-col w-full h-full">
        
        {/* VÍDEO INTRODUTÓRIO (Z-INDEX MAXIMO) */}
        {currentData.type === 'video' && (
            <div className="absolute inset-0 bg-black z-[90] flex items-center justify-center animate-fade-in">
                <video 
                    src={currentData.src} 
                    className="w-full h-full object-cover opacity-90"
                    autoPlay playsInline
                    onEnded={nextStage}
                />
                <button 
                    onClick={nextStage} 
                    className="absolute bottom-12 right-12 text-white/50 hover:text-white border border-white/20 hover:border-white px-6 py-2 rounded-full uppercase tracking-widest text-sm transition-all z-[100] hover:bg-white/10"
                >
                    Pular Introdução
                </button>
            </div>
        )}

        {/* SLIDES (Narrativa) */}
        {currentData.type === 'slide' && (
            <div className="h-full w-full flex flex-col relative overflow-hidden">
                
                {/* Efeito Glow do Mouse no Fundo */}
                <div className="cursor-glow"></div>

                {/* Fundo Animado */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-black z-0">
                    <CreativeOverlay type={currentData.effect} />
                </div>

                {/* HUD Superior */}
                <div className="absolute top-6 right-6 z-40">
                    <button onClick={toggleAudio} className="glass-panel p-3 rounded-full hover:bg-white/5 transition active:scale-95 group">
                        {isPlaying ? <Volume2 className="text-cyan-400 group-hover:text-cyan-300" /> : <VolumeX className="text-slate-500" />}
                    </button>
                </div>

                {/* Título Central */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 text-center max-w-5xl mx-auto mt-[-60px]">
                    <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-blue-400 to-purple-500 mb-8 drop-shadow-2xl animate-slide-up tracking-tight">
                        {currentData.title}
                    </h1>
                </div>

                {/* JACK E DIÁLOGO (Inferior) */}
                <div className="absolute bottom-0 w-full flex flex-col items-center justify-end pb-8 px-4 z-40">
                    <div className="w-full max-w-5xl flex items-end gap-6 md:gap-10">
                        
                        {/* Avatar do Jack 3D (Refatorado para não cortar) */}
                        <div className="w-40 h-40 md:w-56 md:h-56 relative flex-shrink-0 group">
                             {/* Aura Neon Atrás */}
                             <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full animate-pulse"></div>
                             
                             {/* Base do Círculo (Fundo) */}
                             <div className="absolute bottom-0 w-full h-full rounded-full bg-slate-800 border-[3px] border-cyan-500/50 shadow-2xl overflow-hidden z-10 glass-panel">
                                 <div className="w-full h-full bg-gradient-to-t from-black/80 to-transparent"></div>
                             </div>
                             
                             {/* GIF do Jack (Z-Index 20 para sobrepor a borda inferior) */}
                             <img 
                                src={currentData.gif} 
                                alt="Jack" 
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[130%] max-w-none z-20 transition-transform duration-500 group-hover:scale-105"
                                style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
                             />
                             
                             {/* Etiqueta */}
                             <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-cyan-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg z-30 border border-cyan-400/50">
                                Jack
                             </div>
                        </div>

                        {/* Balão de Texto Glassmorphism */}
                        <div className="flex-1 glass-panel p-8 rounded-[2rem] rounded-bl-none shadow-2xl mb-6 relative min-h-[180px] flex flex-col justify-between animate-slide-up border-l-4 border-l-cyan-500">
                            <div className="text-xl md:text-2xl text-slate-100 font-medium leading-relaxed drop-shadow-md">
                                <TypingText text={currentData.text} speed={30} />
                                <span className="inline-block w-2 h-6 bg-cyan-400 ml-1 animate-pulse align-middle"></span>
                            </div>
                            
                            <div className="flex justify-end mt-4">
                                {currentData.isCelebration ? (
                                     <button 
                                        onClick={() => navigate('/')}
                                        className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:shadow-[0_0_50px_rgba(34,197,94,0.6)] animate-neon transform transition hover:-translate-y-1"
                                    >
                                        CONCLUIR MISSÃO <CheckCircle size={24} />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={nextStage}
                                        className="flex items-center gap-2 bg-slate-700/50 hover:bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 px-6 py-2.5 rounded-full font-bold text-base transition-all hover:scale-105 group"
                                    >
                                        {currentData.isLast ? "INICIAR DESAFIO" : "CONTINUAR"} 
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* JOGO */}
        {currentData.type === 'game' && (
            <NinjaGame onComplete={nextStage} />
        )}
      </div>
    </div>
  );
}
