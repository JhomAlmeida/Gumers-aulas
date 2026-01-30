import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, ArrowRight, Gamepad2, MousePointer, Monitor, Zap, CheckCircle, Trophy, Sparkles, Hand, Keyboard } from 'lucide-react';

/* =========================================================================
   1. ESTILOS GLOBAIS (CSS-IN-JS)
   ========================================================================= */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap');
    
    :root { --neon-blue: #00f3ff; --neon-purple: #bc13fe; --glass: rgba(15, 23, 42, 0.95); }
    body { margin: 0; font-family: 'Fredoka', sans-serif; background-color: #050510; overflow: hidden; }

    /* Animações */
    @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    @keyframes pulse-neon { 0%, 100% { box-shadow: 0 0 10px var(--neon-blue); } 50% { box-shadow: 0 0 25px var(--neon-blue), 0 0 10px var(--neon-purple); } }
    @keyframes particleFade { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(0); opacity: 0; top: -50px; } }

    .animate-enter { animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
    .animate-float { animation: float 6s ease-in-out infinite; }

    /* Painéis de Vidro */
    .glass-panel {
      background: var(--glass); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    }

    /* Avatar do Jack */
    .jack-container { position: relative; width: 200px; height: 200px; display: flex; align-items: flex-end; justify-content: center; }
    .jack-circle {
        position: absolute; bottom: 0; width: 160px; height: 160px;
        background: radial-gradient(circle at center, #1e293b, #0f172a);
        border: 4px solid var(--neon-blue); border-radius: 50%;
        box-shadow: 0 0 30px rgba(0, 243, 255, 0.3); z-index: 10;
    }
    .jack-img {
        position: relative; z-index: 20; width: 180px; /* Maior que o circulo para sair */
        transform: translateY(10px); transition: transform 0.3s;
        filter: drop-shadow(0 5px 15px rgba(0,0,0,0.5));
    }
    
    /* Efeito Mouse Trail */
    .trail {
        position: fixed; pointer-events: none;
        background: var(--neon-blue); border-radius: 50%;
        box-shadow: 0 0 10px var(--neon-blue);
        animation: particleFade 0.8s linear forwards; z-index: 9999;
    }

    /* Jogo da Memória */
    .card-container { perspective: 1000px; width: 100px; height: 120px; cursor: pointer; }
    .card-inner {
      position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.6s;
      transform-style: preserve-3d; border-radius: 12px;
    }
    .card-container.flipped .card-inner { transform: rotateY(180deg); }
    .card-container.matched { opacity: 0.5; pointer-events: none; }
    .card-front, .card-back {
      position: absolute; width: 100%; height: 100%; backface-visibility: hidden;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      border-radius: 12px; border: 2px solid var(--neon-blue);
    }
    .card-front { background: #1e293b; transform: rotateY(180deg); }
    .card-back { background: linear-gradient(135deg, #111, #000033); color: var(--neon-blue); font-size: 2rem; }
  `}</style>
);

/* =========================================================================
   2. DADOS DA AULA (PORTUGUÊS CORRIGIDO)
   ========================================================================= */
const SLIDES_DATA = [
  { type: 'video', src: '/abertura-aula.mp4' },
  { type: 'slide', id: 1,  audio: '/slide-01.wav', gif: '/gif01.gif', title: 'Boas-vindas, Tech Master!', text: 'E aí! Eu sou o Jack, seu Player 2 nessa jornada. Se você está aqui, é porque quer dominar a tecnologia de verdade. Preparado?' },
  { type: 'slide', id: 2,  audio: '/slide-02.wav', gif: '/gif02.gif', title: 'Nada de Tédio', text: 'Esqueça aquela ideia de "aula chata". Aqui nós temos Missões! Cada etapa foi criada para você se divertir enquanto aprende.' },
  { type: 'slide', id: 3,  audio: '/slide-03.wav', gif: '/gif01.gif', title: 'O Mapa de Fases', text: 'Dá uma olhada no nosso mapa! Cada fase desbloqueia um superpoder diferente. Vamos no seu ritmo, do zero ao profissional.' },
  { type: 'slide', id: 4,  audio: '/slide-04.wav', gif: '/gif02.gif', title: 'Objetivo Final', text: 'Ao final desta saga, você vai dominar o Mouse, o Teclado e entender exatamente o que acontece dentro da máquina!' },
  { type: 'slide', id: 5,  audio: '/slide-05.wav', gif: '/gif01.gif', title: 'A Primeira Missão', text: 'Nesta missão inicial, vamos descobrir como a informação viaja até nós. Foca na tela, pois a jornada começa agora!' },
  { type: 'slide', id: 6,  audio: '/slide-06.wav', gif: '/gif02.gif', title: 'O Mouse', text: 'Primeira parada: O Mouse! Você sabia que "Mouse" significa "Rato" em inglês? O formato dele lembrava um ratinho com cauda.', effect: 'mouse-rat' },
  { type: 'slide', id: 7,  audio: '/slide-07.wav', gif: '/gif01.gif', title: 'Ele Não Morde!', text: 'Relaxa, esse rato não morde! Ele é o nosso periférico de entrada principal. Ele funciona como uma extensão da sua mão na tela.', effect: 'hand' },
  { type: 'slide', id: 8,  audio: '/slide-08.wav', gif: '/gif02.gif', title: 'O Cursor', text: 'Quando você move o mouse aqui fora, ele controla aquele Cursor (a setinha) lá dentro. É pura mágica tecnológica!', effect: 'cursor' },
  { type: 'slide', id: 9,  audio: '/slide-09.wav', gif: '/gif01.gif', title: 'O Clique', text: 'E tem o clique! É como apertar o gatilho num jogo. O som de "click" confirma que o computador entendeu seu comando.' },
  { type: 'slide', id: 10, audio: '/slide-10.wav', gif: '/gif02.gif', title: 'Ergonomia Pro', text: 'Segredo de Pro Player: Conforto. Ninguém quer ter "Game Over" na mão por causa de dor, né?' },
  { type: 'slide', id: 11, audio: '/slide-11.wav', gif: '/gif01.gif', title: 'Modo Sem Dor', text: 'Usar o mouse do jeito errado cansa rápido. Vamos ativar o Modo Ergonômico para jogar por horas com saúde.' },
  { type: 'slide', id: 12, audio: '/slide-12.wav', gif: '/gif02.gif', title: 'Mão Relaxada', text: 'Regra de ouro: Mão relaxada! Deixe sua mão descansar sobre o mouse, como se fosse um travesseiro macio.' },
  { type: 'slide', id: 13, audio: '/slide-13.wav', gif: '/gif01.gif', title: 'Cuidado com o Punho', text: 'Atenção ao punho! Nada de deixar o pulso dobrado na quina da mesa. O braço precisa ter apoio total.' },
  { type: 'slide', id: 14, audio: '/slide-14.wav', gif: '/gif02.gif', title: 'Desafio de Precisão', text: 'Chega de papo, hora da ação! Vamos ver se você pegou o jeito. Sua missão é levar o cursor do ponto A ao ponto B.' },
  { type: 'game-ninja' }, 
  { type: 'slide', id: 15, audio: '/slide-15.wav', gif: '/gif01.gif', title: 'Desafio Final', text: 'Incrível! Seus reflexos são ótimos. Agora, para ganhar seu Emblema, vença o Desafio da Memória Gumers!', isLast: true },
  { type: 'game-memory' }, 
  { type: 'celebration' }
];

/* =========================================================================
   3. COMPONENTES AUXILIARES (FIXED TYPING LOGIC)
   ========================================================================= */
const TypingText = ({ text, speed = 30 }) => {
    const [displayed, setDisplayed] = useState("");
    useEffect(() => {
      let i = 0;
      setDisplayed(""); // Limpa antes de começar
      const interval = setInterval(() => {
        i++; // Incrementa antes
        setDisplayed(text.slice(0, i)); // Usa slice para garantir que o texto inteiro apareça
        if (i >= text.length) clearInterval(interval);
      }, speed);
      return () => clearInterval(interval);
    }, [text, speed]);
    return <span>{displayed}</span>;
};

const CreativeOverlay = ({ type }) => {
    if (!type) return null;
    return (
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-40">
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
   4. JOGO 1: NINJA LINE GAME
   ========================================================================= */
const NinjaLineGame = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const [level] = useState(1);
  const [gameState, setGameState] = useState('start'); 
  const [msg, setMsg] = useState("Toque no círculo azul!");
  
  const gl = useRef({ width: 0, height: 0, obstacles: [], mouse: {x:0,y:0}, active: false, hasEnergy: false, particles: [], animId: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
        gl.current.width = window.innerWidth; gl.current.height = window.innerHeight;
        canvas.width = gl.current.width; canvas.height = gl.current.height;
        gl.current.pointA = { x: gl.current.width * 0.15, y: gl.current.height / 2, r: 40, color: '#00f3ff', label: 'INÍCIO' };
        gl.current.pointB = { x: gl.current.width * 0.85, y: gl.current.height / 2, r: 40, color: '#bc13fe', label: 'FIM' };
        if(gl.current.active) initObs();
    };
    window.addEventListener('resize', resize); resize();

    function initObs() {
        gl.current.obstacles = [];
        for(let i=1; i<=3; i++) {
            gl.current.obstacles.push({
                x: (gl.current.width * 0.25) * i, y: gl.current.height/2, 
                w: 40, h: 150, dir: i%2===0?1:-1, speed: 2 
            });
        }
    }

    const loop = () => {
        const { width, height, active, hasEnergy, obstacles, particles, pointA, pointB } = gl.current;
        ctx.fillStyle = '#050510'; ctx.fillRect(0, 0, width, height);
        
        ctx.strokeStyle = 'rgba(0,243,255,0.05)'; ctx.lineWidth = 1;
        for(let i=0; i<width; i+=50) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,height); ctx.stroke(); }

        if (active) {
            [pointA, pointB].forEach(p => {
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
                ctx.strokeStyle = p.color; ctx.lineWidth = 4; ctx.stroke();
                ctx.fillStyle = 'white'; ctx.font = 'bold 14px sans'; ctx.textAlign = 'center'; 
                ctx.fillText(p.label, p.x, p.y + 55);
            });

            obstacles.forEach(obs => {
                obs.y += obs.speed * obs.dir;
                if(obs.y < 50 || obs.y > height - obs.h - 50) obs.dir *= -1;
                ctx.fillStyle = '#ef4444'; ctx.shadowBlur = 15; ctx.shadowColor = '#ef4444';
                ctx.fillRect(obs.x, obs.y, obs.w, obs.h); ctx.shadowBlur = 0;
                
                if (hasEnergy && gl.current.mouse.x > obs.x && gl.current.mouse.x < obs.x + obs.w && gl.current.mouse.y > obs.y && gl.current.mouse.y < obs.y + obs.h) {
                    gl.current.hasEnergy = false; setMsg("BATEU! VOLTE AO INÍCIO!");
                }
            });

            const distA = Math.hypot(gl.current.mouse.x - pointA.x, gl.current.mouse.y - pointA.y);
            if(distA < pointA.r) { gl.current.hasEnergy = true; setMsg("ENERGIA PEGUE! VÁ PARA O FIM!"); }

            const distB = Math.hypot(gl.current.mouse.x - pointB.x, gl.current.mouse.y - pointB.y);
            if(distB < pointB.r && hasEnergy) { gl.current.active = false; setGameState('win'); }
            
            if(hasEnergy) { ctx.strokeStyle = '#00f3ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(pointA.x, pointA.y); ctx.lineTo(gl.current.mouse.x, gl.current.mouse.y); ctx.stroke(); }
        }

        for(let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.03;
            ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
            if(p.life <= 0) particles.splice(i, 1);
        }
        ctx.globalAlpha = 1;
        gl.current.animId = requestAnimationFrame(loop);
    };
    
    if(gameState === 'playing') { initObs(); loop(); }
    
    return () => { 
        window.removeEventListener('resize', resize); 
        if (gl.current.animId) cancelAnimationFrame(gl.current.animId); 
    };
  }, [gameState, level]); // Correção: Dependência do useEffect

  const handleMove = (e) => {
      const cx = e.clientX || e.touches?.[0]?.clientX;
      const cy = e.clientY || e.touches?.[0]?.clientY;
      if(cx && cy) { 
          gl.current.mouse.x = cx; gl.current.mouse.y = cy; 
          // Trail
          if(Math.random()>0.5) gl.current.particles.push({x:cx,y:cy,vx:(Math.random()-0.5)*2,vy:(Math.random()-0.5)*2,life:1,color:gl.current.hasEnergy?'#fcd34d':'#fff',size:Math.random()*3});
      }
  };

  return (
    <div className="w-full h-full relative cursor-crosshair" onMouseMove={handleMove} onTouchMove={handleMove}>
        <canvas ref={canvasRef} className="block touch-none" />
        <div className="absolute bottom-10 width-full text-center w-full pointer-events-none">
            <span className="glass-panel px-6 py-2 rounded-full text-white font-bold">{msg}</span>
        </div>
        
        {gameState === 'start' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
                <div className="glass-panel p-8 rounded-2xl text-center max-w-md">
                    <Gamepad2 size={60} className="mx-auto text-cyan-400 mb-4 animate-bounce" />
                    <h2 className="text-3xl font-bold text-white mb-2">DESAFIO DO MOUSE</h2>
                    <p className="text-slate-300 mb-6">Pegue a energia no azul e leve até o roxo sem tocar no vermelho!</p>
                    <button onClick={() => { gl.current.active = true; setGameState('playing'); }} className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-full hover:scale-105 transition">JOGAR</button>
                </div>
            </div>
        )}
        {gameState === 'win' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
                <div className="glass-panel p-8 rounded-2xl text-center">
                    <CheckCircle size={60} className="mx-auto text-green-400 mb-4" />
                    <h2 className="text-3xl font-bold text-white mb-4">MANDOU BEM!</h2>
                    <button onClick={onComplete} className="px-8 py-3 bg-green-600 text-white font-bold rounded-full hover:scale-105 transition">PRÓXIMO DESAFIO</button>
                </div>
            </div>
        )}
    </div>
  );
};

/* =========================================================================
   5. JOGO 2: JOGO DA MEMÓRIA
   ========================================================================= */
const MemoryGame = ({ onComplete }) => {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [won, setWon] = useState(false);

    useEffect(() => {
        const types = [
            { id: 1, name: 'Mouse', icon: <MousePointer /> },
            { id: 2, name: 'Teclado', icon: <Keyboard /> },
            { id: 3, name: 'Gamer', icon: <Gamepad2 /> }
        ];
        const deck = [...types, ...types].sort(() => Math.random() - 0.5).map((card, i) => ({ ...card, uid: i }));
        setCards(deck);
    }, []);

    const handleClick = (card) => {
        if (flipped.length === 2 || flipped.some(c => c.uid === card.uid) || matched.includes(card.id)) return;
        const newFlipped = [...flipped, card];
        setFlipped(newFlipped);
        
        if (newFlipped.length === 2) {
            if (newFlipped[0].id === newFlipped[1].id) {
                setMatched(prev => [...prev, newFlipped[0].id]);
                setFlipped([]);
                if (matched.length + 1 === 3) setWon(true);
            } else {
                setTimeout(() => setFlipped([]), 1000);
            }
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 relative">
            <h2 className="text-3xl font-bold text-cyan-400 mb-8 animate-pulse">DESAFIO DA MEMÓRIA</h2>
            <div className="grid grid-cols-3 gap-4 z-10 p-4">
                {cards.map(card => {
                    const isFlipped = flipped.some(c => c.uid === card.uid) || matched.includes(card.id);
                    return (
                        <div key={card.uid} className={`card-container ${isFlipped ? 'flipped' : ''} ${matched.includes(card.id) ? 'matched' : ''}`} onClick={() => handleClick(card)}>
                            <div className="card-inner">
                                <div className="card-front"><div className="text-cyan-400 scale-150">{card.icon}</div></div>
                                <div className="card-back"><Zap className="text-cyan-500 animate-pulse" /></div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {won && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50 animate-enter">
                    <div className="glass-panel p-10 rounded-2xl text-center border-2 border-cyan-500">
                        <Trophy size={80} className="mx-auto text-yellow-400 mb-4 animate-bounce" />
                        <h1 className="text-4xl font-black text-white mb-4">VOCÊ É UM GUMER!</h1>
                        <button onClick={onComplete} className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black rounded-full hover:scale-105 transition">PEGAR CERTIFICADO</button>
                    </div>
                </div>
            )}
        </div>
    );
};

/* =========================================================================
   6. COMPONENTE PRINCIPAL
   ========================================================================= */
export default function Aula01() {
  const [stage, setStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const data = SLIDES_DATA[stage];
  const progress = ((stage + 1) / SLIDES_DATA.length) * 100;

  useEffect(() => {
    if (data.type === 'slide' && audioRef.current) {
        audioRef.current.pause(); audioRef.current.currentTime = 0; audioRef.current.src = data.audio;
        setTimeout(() => { 
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }, 200);
    }
  }, [stage, data]);

  const toggleAudio = () => {
      if(audioRef.current.paused) { audioRef.current.play(); setIsPlaying(true); } else { audioRef.current.pause(); setIsPlaying(false); }
  };

  return (
    <div className="w-full h-screen bg-slate-900 text-white font-sans overflow-hidden relative">
      <GlobalStyles />
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      {/* Barra de Progresso */}
      <div className="absolute top-0 left-0 w-full h-2 bg-slate-800" style={{ zIndex: 9999 }}>
        <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-600 shadow-[0_0_20px_#00f3ff] transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="flex-1 w-full h-full relative">
        
        {/* VIDEO */}
        {data.type === 'video' && (
            <div className="absolute inset-0 bg-black z-50 flex items-center justify-center">
                <video src={data.src} className="w-full h-full object-cover" autoPlay playsInline onEnded={() => setStage(prev => prev + 1)} />
                <button onClick={() => setStage(prev => prev + 1)} className="absolute bottom-10 right-10 glass-panel px-6 py-2 rounded-full uppercase text-sm hover:bg-white/10 transition z-50">Pular Intro</button>
            </div>
        )}

        {/* SLIDES */}
        {data.type === 'slide' && (
            <div className="h-full w-full flex flex-col relative overflow-hidden">
                <button onClick={toggleAudio} className="absolute top-6 right-6 z-50 glass-panel p-3 rounded-full hover:bg-white/10 transition">
                    {isPlaying ? <Volume2 className="text-cyan-400" /> : <VolumeX className="text-slate-500" />}
                </button>

                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center mt-[-60px] animate-enter">
                    <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-purple-500 mb-8 drop-shadow-2xl">{data.title}</h1>
                </div>

                <div className="absolute bottom-0 w-full flex flex-col items-center justify-end pb-8 px-4 z-40">
                    <div className="w-full max-w-5xl flex items-end gap-6 md:gap-10">
                        {/* JACK AVATAR - AGORA FORA DO OVERFLOW */}
                        <div className="jack-container">
                             <div className="jack-circle"></div>
                             <img src={data.gif} alt="Jack" className="jack-img" />
                             <div className="absolute bottom-0 bg-cyan-600 text-white text-xs font-bold px-4 py-1 rounded-full z-30 border border-cyan-400">JACK</div>
                        </div>

                        <div className="flex-1 glass-panel p-8 rounded-[2rem] rounded-bl-none shadow-2xl mb-6 relative flex flex-col justify-between border-l-4 border-l-cyan-500">
                            <div className="text-xl md:text-2xl text-slate-100 font-medium leading-relaxed">
                                <TypingText text={data.text} />
                            </div>
                            <div className="flex justify-end mt-4">
                                <button onClick={() => setStage(prev => prev + 1)} className="flex items-center gap-2 bg-slate-700/50 hover:bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 px-6 py-2.5 rounded-full font-bold transition hover:scale-105">
                                    {data.isLast ? "VAMOS LÁ!" : "CONTINUAR"} <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* JOGOS */}
        {data.type === 'game-ninja' && <NinjaLineGame onComplete={() => setStage(prev => prev + 1)} />}
        {data.type === 'game-memory' && <MemoryGame onComplete={() => setStage(prev => prev + 1)} />}
        
        {/* FINAL */}
        {data.type === 'celebration' && (
            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50 animate-enter text-center p-4">
                <Sparkles size={100} className="text-yellow-400 animate-spin-slow mb-6" />
                <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 mb-4">PARABÉNS!</h1>
                <p className="text-2xl text-slate-300 mb-8 max-w-2xl">Você completou a Missão 01 com excelência. O Universo Tech está orgulhoso de você!</p>
                <button onClick={() => navigate('/')} className="bg-white text-black font-black px-10 py-4 rounded-full text-xl hover:scale-110 transition shadow-[0_0_50px_white]">VOLTAR AO MENU</button>
            </div>
        )}
      </div>
    </div>
  );
}
