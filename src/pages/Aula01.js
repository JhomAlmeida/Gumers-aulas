import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, ArrowRight, Gamepad2, Home } from 'lucide-react';

/* =========================================================================
   DADOS DA AULA (15 FASES: Vídeo -> Slides -> Jogo)
   ========================================================================= */
const SLIDES_DATA = [
  { type: 'video', src: '/abertura-aula.mp4' },
  { type: 'slide', id: 1,  audio: '/slide-01.wav', gif: '/gif01.gif', title: 'Boas-vindas', text: 'E aí, futuro mestre da tecnologia! Eu sou o Jack e serei seu player 2 nessa jornada épica. Preparado para upar suas habilidades?' },
  { type: 'slide', id: 2,  audio: '/slide-02.wav', gif: '/gif02.gif', title: 'Nada de Aulas Chatas', text: 'Esqueça aquela ideia de "aulas chatas". Aqui, nós temos Missões preparadas especialmente para você se divertir enquanto aprende.' },
  { type: 'slide', id: 3,  audio: '/slide-03.wav', gif: '/gif01.gif', title: 'Mapa de Fases', text: 'Dá uma olhada no nosso mapa! Cada fase traz um superpoder diferente. Vamos no seu ritmo, do zero ao profissional.' },
  { type: 'slide', id: 4,  audio: '/slide-04.wav', gif: '/gif02.gif', title: 'O Objetivo Final', text: 'Ao final dessa saga, você vai dominar o Mouse, o Teclado e entender o que tem dentro da máquina!' },
  { type: 'slide', id: 5,  audio: '/slide-05.wav', gif: '/gif01.gif', title: 'A Primeira Missão', text: 'Nesta primeira missão, vamos descobrir como a informação viaja até nós. Foca na tela que a nossa jornada começa agora!' },
  { type: 'slide', id: 6,  audio: '/slide-06.wav', gif: '/gif02.gif', title: 'O Mouse', text: 'Primeira parada: O Mouse! Você sabia que "Mouse" significa "Rato" em inglês? O formato dele lembrava um ratinho.' },
  { type: 'slide', id: 7,  audio: '/slide-07.wav', gif: '/gif01.gif', title: 'Não Morde!', text: 'Relaxa, esse rato não morde! Ele é o nosso periférico de entrada principal. Ele funciona como sua mão dentro da tela.' },
  { type: 'slide', id: 8,  audio: '/slide-08.wav', gif: '/gif02.gif', title: 'O Cursor', text: 'Quando você mexe o mouse aqui fora, ele controla aquele Cursor (a setinha) lá dentro. É pura mágica tecnológica!' },
  { type: 'slide', id: 9,  audio: '/slide-09.wav', gif: '/gif01.gif', title: 'O Clique', text: 'E tem o clique! É como apertar o gatilho num jogo. Faz "click" e confirma a sua ação no computador.' },
  { type: 'slide', id: 10, audio: '/slide-10.wav', gif: '/gif02.gif', title: 'Ergonomia Pro', text: 'Agora, um segredo de Pro Player: o conforto. Ninguém quer ter "Game Over" na mão por causa de dor, né?' },
  { type: 'slide', id: 11, audio: '/slide-11.wav', gif: '/gif01.gif', title: 'Modo Sem Dor', text: 'Usar o mouse do jeito errado pode cansar. Vamos ativar o Modo Ergonômico para jogar por horas sem problemas.' },
  { type: 'slide', id: 12, audio: '/slide-12.wav', gif: '/gif02.gif', title: 'Mão Relaxada', text: 'Regra de ouro: Mão relaxada! Deixe sua mão descansar sobre o mouse, como se fosse um travesseiro macio.' },
  { type: 'slide', id: 13, audio: '/slide-13.wav', gif: '/gif01.gif', title: 'Cuidado com o Punho', text: 'Atenção ao punho! Nada de deixar o pulso dobrado na quina da mesa. O braço precisa ter apoio total.' },
  { type: 'slide', id: 14, audio: '/slide-14.wav', gif: '/gif02.gif', title: 'Desafio de Precisão', text: 'Chega de papo, hora da ação! Vamos ver se você pegou o jeito. Sua missão é levar o cursor do ponto A ao ponto B.' },
  { type: 'slide', id: 15, audio: '/slide-15.wav', gif: '/gif01.gif', title: 'Valendo!', text: 'Tente fazer uma linha reta e suave. Cuidado com os obstáculos! Clique no botão abaixo para começar o Jogo.' },
  { type: 'game' } // Fase final
];

/* =========================================================================
   COMPONENTE: JOGO NINJA
   ========================================================================= */
const NinjaGame = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('start'); 
  const [level, setLevel] = useState(1);
  const [diamonds, setDiamonds] = useState(0);
  const [msg, setMsg] = useState("Toque no círculo azul para coletar energia!");
  const [msgColor, setMsgColor] = useState("white");

  // Refs de lógica
  const glRef = useRef({
    width: 0, height: 0, particles: [], obstacles: [], mouse: { x: 0, y: 0 },
    hasEnergy: false, active: false,
    pointA: { x: 0, y: 0, radius: 45, color: '#22d3ee', label: 'INÍCIO' },
    pointB: { x: 0, y: 0, radius: 45, color: '#a855f7', label: 'FIM' },
    animationFrameId: null
  });

  const levels = {
    1: { name: "Fase 1: Treino Ninja", obsCount: 0, speed: 0 },
    2: { name: "Fase 2: Perigo no Templo", obsCount: 2, speed: 1.5 },
    3: { name: "Fase 3: Mestre das Sombras", obsCount: 4, speed: 2.5 }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const gl = glRef.current;

    const resize = () => {
      gl.width = window.innerWidth;
      gl.height = window.innerHeight;
      canvas.width = gl.width;
      canvas.height = gl.height;
      gl.pointA.x = gl.width * 0.15; gl.pointA.y = gl.height / 2;
      gl.pointB.x = gl.width * 0.85; gl.pointB.y = gl.height / 2;
      if (gl.active) initObstacles();
    };

    window.addEventListener('resize', resize);
    resize();

    // Classes Lógicas
    class Particle {
      constructor(x, y, color, scale = 1) {
        this.x = x; this.y = y; this.color = color;
        this.size = Math.random() * 4 + 2;
        this.vx = (Math.random() - 0.5) * 6 * scale; this.vy = (Math.random() - 0.5) * 6 * scale;
        this.life = 1.0; this.decay = Math.random() * 0.02 + 0.012;
      }
      update() { this.x += this.vx; this.y += this.vy; this.life -= this.decay; }
      draw() { ctx.globalAlpha = this.life; ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
    }

    class Obstacle {
      constructor() {
        this.w = 35; this.h = 100; this.x = 0; this.y = 0;
        this.speed = levels[level].speed; this.dir = Math.random() > 0.5 ? 1 : -1;
      }
      update() { this.y += this.speed * this.dir; if (this.y < 90 || this.y > gl.height - this.h - 90) this.dir *= -1; }
      draw() { ctx.fillStyle = '#ef4444'; ctx.shadowBlur = 10; ctx.shadowColor = '#ef4444'; ctx.beginPath(); ctx.roundRect(this.x, this.y, this.w, this.h, 10); ctx.fill(); ctx.shadowBlur = 0; }
    }

    function initObstacles() {
      gl.obstacles = [];
      const count = levels[level].obsCount;
      const step = (gl.pointB.x - gl.pointA.x) / (count + 1);
      for (let i = 1; i <= count; i++) {
        let obs = new Obstacle();
        obs.x = gl.pointA.x + (step * i) - (obs.w / 2);
        obs.y = (gl.height / 2) - (obs.h / 2) + (Math.random() * 50 - 25);
        gl.obstacles.push(obs);
      }
    }

    const animate = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, gl.width, gl.height);
      if (gl.active) {
        drawPoint(ctx, gl.pointA, gl.hasEnergy ? '#1e293b' : gl.pointA.color);
        drawPoint(ctx, gl.pointB, gl.hasEnergy ? gl.pointB.color : '#1e293b');
        gl.obstacles.forEach(obs => { obs.update(); obs.draw(); });
      }
      for (let i = gl.particles.length - 1; i >= 0; i--) {
        gl.particles[i].update(); gl.particles[i].draw();
        if (gl.particles[i].life <= 0) gl.particles.splice(i, 1);
      }
      gl.animationFrameId = requestAnimationFrame(animate);
    };

    const drawPoint = (context, p, color) => {
        context.save(); context.shadowBlur = 20; context.shadowColor = color;
        context.beginPath(); context.strokeStyle = color; context.lineWidth = 4;
        context.arc(p.x, p.y, p.radius, 0, Math.PI * 2); context.stroke();
        const pulse = Math.sin(Date.now() / 250) * 5;
        context.beginPath(); context.fillStyle = color;
        context.arc(p.x, p.y, (p.radius * 0.5) + pulse, 0, Math.PI * 2); context.fill();
        context.fillStyle = 'white'; context.font = 'bold 14px sans-serif';
        context.textAlign = 'center'; context.fillText(p.label, p.x, p.y + p.radius + 25);
        context.restore();
    };

    const handleMove = (e) => {
        if (!gl.active) return;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        gl.mouse.x = clientX; gl.mouse.y = clientY;

        if (gl.hasEnergy) gl.particles.push(new Particle(gl.mouse.x, gl.mouse.y, '#fcd34d', 0.5));

        const distA = Math.hypot(gl.mouse.x - gl.pointA.x, gl.mouse.y - gl.pointA.y);
        if (distA < gl.pointA.radius && !gl.hasEnergy) {
            gl.hasEnergy = true; setMsg("Energia Carregada! ✨ Cuidado com o vermelho!"); setMsgColor("#fcd34d");
            createExplosion(gl.pointA.x, gl.pointA.y, gl.pointA.color);
        }
        const distB = Math.hypot(gl.mouse.x - gl.pointB.x, gl.mouse.y - gl.pointB.y);
        if (distB < gl.pointB.radius && gl.hasEnergy) winLevelInternal();

        if (gl.hasEnergy) {
            gl.obstacles.forEach(obs => {
                if (gl.mouse.x > obs.x && gl.mouse.x < obs.x + obs.w && gl.mouse.y > obs.y && gl.mouse.y < obs.y + obs.h) {
                    gl.hasEnergy = false; setMsg("Ops! Encostou! Volte ao início."); setMsgColor("#ef4444");
                    createExplosion(gl.mouse.x, gl.mouse.y, "#ef4444");
                }
            });
        }
    };

    const createExplosion = (x, y, color) => { for(let i=0; i<25; i++) gl.particles.push(new Particle(x, y, color)); };
    const winLevelInternal = () => { gl.active = false; setGameState('win'); createExplosion(gl.pointB.x, gl.pointB.y, gl.pointB.color, 2); };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
    animate();

    return () => {
        window.removeEventListener('resize', resize); window.removeEventListener('mousemove', handleMove); window.removeEventListener('touchmove', handleMove);
        cancelAnimationFrame(gl.animationFrameId);
    };
  }, [level]);

  const startGame = () => { glRef.current.active = true; glRef.current.hasEnergy = false; setGameState('playing'); setMsg("Toque no círculo azul!"); setMsgColor("white"); };
  const nextLevel = () => {
      if (level >= 3) { alert("Parabéns Mestre Ninja!"); navigate('/'); } 
      else { setLevel(prev => prev + 1); setGameState('playing'); glRef.current.active = true; glRef.current.hasEnergy = false; }
  };

  return (
    <div className="w-full h-full relative font-sans overflow-hidden">
        <canvas ref={canvasRef} className="block cursor-crosshair touch-none" />
        <div className="absolute top-16 w-full p-4 flex justify-between items-center z-10">
            <button onClick={() => navigate('/')} className="bg-slate-700 text-white px-4 py-1 rounded-full border border-cyan-500">🏠 Sair</button>
            <div className="text-purple-400 font-bold bg-purple-900/30 px-4 py-1 rounded-full border border-purple-500">{levels[level].name}</div>
        </div>
        <div className="absolute bottom-8 left-0 w-full text-center pointer-events-none">
            <span className="px-6 py-2 rounded-full bg-black/40 backdrop-blur-md font-bold text-lg" style={{ color: msgColor }}>{msg}</span>
        </div>
        {gameState === 'start' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm z-50">
                <div className="bg-slate-800 p-8 rounded-3xl border-4 border-cyan-500 max-w-md text-center">
                    <h2 className="text-4xl font-black text-cyan-400 mb-4">DESAFIO NINJA</h2>
                    <button onClick={startGame} className="w-full py-4 bg-cyan-500 text-slate-900 font-black rounded-xl text-xl hover:scale-105 transition">COMEÇAR</button>
                </div>
            </div>
        )}
        {gameState === 'win' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm z-50">
                <div className="bg-slate-800 p-8 rounded-3xl border-4 border-green-500 max-w-md text-center">
                    <h2 className="text-4xl font-black text-green-400 mb-2">{level === 3 ? "MESTRE!" : "VITÓRIA!"}</h2>
                    <button onClick={nextLevel} className="w-full py-4 bg-green-500 text-slate-900 font-black rounded-xl text-xl hover:scale-105 transition">PRÓXIMA FASE</button>
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

  const currentData = SLIDES_DATA[currentStage];
  const progressPercent = ((currentStage + 1) / SLIDES_DATA.length) * 100;

  // Gerenciamento de Áudio
  useEffect(() => {
    if (currentData.type === 'slide' && audioRef.current) {
        audioRef.current.src = currentData.audio;
        audioRef.current.load();
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
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
    <div className="w-full h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden flex flex-col relative selection:bg-cyan-500 selection:text-white">
      {/* Áudio Invisível */}
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      {/* BARRA NEON DE PROGRESSO (Sem Texto) */}
      <div className="absolute top-0 left-0 w-full h-2 bg-slate-800 z-50">
        <div 
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_15px_#22d3ee] transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* RENDERIZAÇÃO DO CONTEÚDO */}
      <div className="flex-1 relative flex flex-col">
        
        {/* CASO 1: VÍDEO (Intro) */}
        {currentData.type === 'video' && (
            <div className="fixed inset-0 bg-black z-40 flex items-center justify-center">
                <video 
                    src={currentData.src} 
                    className="w-full h-full object-cover"
                    autoPlay playsInline
                    onEnded={nextStage}
                    onClick={nextStage}
                />
                <button onClick={nextStage} className="absolute bottom-10 right-10 text-white/30 hover:text-white border border-white/20 px-4 py-2 rounded">PULAR</button>
            </div>
        )}

        {/* CASO 2: SLIDES (Jack Narrador) */}
        {currentData.type === 'slide' && (
            <div className="h-full w-full flex flex-col relative">
                {/* Fundo */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-black pointer-events-none"></div>

                {/* HUD Superior (Botão de Som) */}
                <div className="absolute top-6 right-6 z-40">
                    <button onClick={toggleAudio} className="bg-slate-800/80 p-3 rounded-full border border-cyan-500/30 hover:bg-slate-700 transition">
                        {isPlaying ? <Volume2 className="text-green-400 animate-pulse" /> : <VolumeX className="text-slate-400" />}
                    </button>
                </div>

                {/* Conteúdo Central */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 text-center max-w-4xl mx-auto mt-[-100px]">
                    <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-6 drop-shadow-lg">
                        {currentData.title}
                    </h1>
                </div>

                {/* JACK E BALÃO DE FALA (Fixed Bottom) */}
                <div className="absolute bottom-0 w-full flex flex-col items-center justify-end pb-6 px-4 z-40">
                    <div className="w-full max-w-4xl flex items-end gap-4">
                        
                        {/* Avatar do Jack (CORRIGIDO: Agora usa o GIF corretamente) */}
                        <div className="w-28 h-28 sm:w-40 sm:h-40 relative flex-shrink-0">
                            {/* Círculo com efeito de brilho */}
                            <div className="w-full h-full rounded-full border-4 border-cyan-400 bg-slate-800 shadow-[0_0_30px_rgba(34,211,238,0.4)] overflow-hidden relative z-10">
                                {/* O GIF é carregado aqui dentro */}
                                <img 
                                    src={currentData.gif} 
                                    alt="Jack" 
                                    className="w-full h-full object-cover transform scale-125 translate-y-2"
                                />
                            </div>
                            {/* Etiqueta Jack */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-cyan-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-lg z-20 border border-cyan-400">
                                Jack
                            </div>
                        </div>

                        {/* Balão de Fala */}
                        <div className="flex-1 bg-slate-800/95 backdrop-blur-xl border-2 border-cyan-500/50 p-4 sm:p-6 rounded-2xl rounded-bl-none shadow-2xl mb-4 relative min-h-[140px] flex flex-col">
                            <p className="text-base sm:text-lg text-white font-medium leading-relaxed drop-shadow-md flex-1">
                                {currentData.text}
                            </p>
                            <div className="flex justify-end mt-2">
                                <button 
                                    onClick={nextStage}
                                    className="flex items-center gap-2 bg-cyan-900/50 hover:bg-cyan-800 text-cyan-200 border border-cyan-700 px-4 py-2 rounded-full font-bold text-sm transition-all hover:scale-105"
                                >
                                    CONTINUAR <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* CASO 3: JOGO */}
        {currentData.type === 'game' && (
            <NinjaGame onComplete={() => alert('Curso Finalizado!')} />
        )}
      </div>
    </div>
  );
}
