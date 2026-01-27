import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Volume2, VolumeX, Gamepad2 } from 'lucide-react';

/* =========================================================================
   COMPONENT 1: O JOGO NINJA (Mantido igual, apenas integrado ao fluxo)
   ========================================================================= */
const NinjaGame = () => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  
  // Estados para a interface do jogo
  const [gameState, setGameState] = useState('start'); 
  const [level, setLevel] = useState(1);
  const [diamonds, setDiamonds] = useState(0);
  const [msg, setMsg] = useState("Toque no círculo azul para coletar energia!");
  const [msgColor, setMsgColor] = useState("white");

  // Refs de lógica (Game Loop)
  const gameLogic = useRef({
    width: 0, height: 0,
    particles: [], obstacles: [],
    mouse: { x: 0, y: 0 },
    hasEnergy: false,
    active: false,
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
    const gl = gameLogic.current;

    const resize = () => {
      gl.width = window.innerWidth;
      gl.height = window.innerHeight;
      canvas.width = gl.width;
      canvas.height = gl.height;
      gl.pointA.x = gl.width * 0.15;
      gl.pointA.y = gl.height / 2;
      gl.pointB.x = gl.width * 0.85;
      gl.pointB.y = gl.height / 2;
      if (gl.active) initObstacles();
    };

    window.addEventListener('resize', resize);
    resize();

    // Classes Lógicas
    class Particle {
      constructor(x, y, color, scale = 1) {
        this.x = x; this.y = y; this.color = color;
        this.size = Math.random() * 4 + 2;
        this.vx = (Math.random() - 0.5) * 6 * scale;
        this.vy = (Math.random() - 0.5) * 6 * scale;
        this.life = 1.0; this.decay = Math.random() * 0.02 + 0.012;
      }
      update() { this.x += this.vx; this.y += this.vy; this.life -= this.decay; }
      draw() {
        ctx.globalAlpha = this.life; ctx.fillStyle = this.color; ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
      }
    }

    class Obstacle {
      constructor() {
        this.w = 35; this.h = 100; this.x = 0; this.y = 0;
        this.speed = levels[level].speed;
        this.dir = Math.random() > 0.5 ? 1 : -1;
      }
      update() {
        this.y += this.speed * this.dir;
        if (this.y < 90 || this.y > gl.height - this.h - 90) this.dir *= -1;
      }
      draw() {
        ctx.fillStyle = '#ef4444'; ctx.shadowBlur = 10; ctx.shadowColor = '#ef4444';
        ctx.beginPath(); ctx.roundRect(this.x, this.y, this.w, this.h, 10); ctx.fill(); ctx.shadowBlur = 0;
      }
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

      ctx.fillStyle = "rgba(255,255,255,0.08)";
      for(let i=0; i<30; i++) {
        ctx.beginPath(); ctx.arc((i*157)%gl.width, (i*263)%gl.height, 1, 0, Math.PI*2); ctx.fill();
      }

      if (gl.active) {
        drawPoint(ctx, gl.pointA, gl.hasEnergy ? '#1e293b' : gl.pointA.color);
        drawPoint(ctx, gl.pointB, gl.hasEnergy ? gl.pointB.color : '#1e293b');
        gl.obstacles.forEach(obs => { obs.update(); obs.draw(); });
      }

      for (let i = gl.particles.length - 1; i >= 0; i--) {
        gl.particles[i].update();
        gl.particles[i].draw();
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
        context.fillStyle = 'white'; context.font = 'bold 16px sans-serif';
        context.textAlign = 'center'; context.shadowBlur = 0;
        context.fillText(p.label, p.x, p.y + p.radius + 30);
        context.restore();
    };

    const handleMove = (e) => {
        if (!gl.active) return;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        gl.mouse.x = clientX;
        gl.mouse.y = clientY;

        if (gl.hasEnergy) gl.particles.push(new Particle(gl.mouse.x, gl.mouse.y, '#fcd34d', 0.5));

        const distA = Math.hypot(gl.mouse.x - gl.pointA.x, gl.mouse.y - gl.pointA.y);
        if (distA < gl.pointA.radius && !gl.hasEnergy) {
            gl.hasEnergy = true;
            setMsg("Energia Carregada! ✨ Cuidado com o vermelho!");
            setMsgColor("#fcd34d");
            createExplosion(gl.pointA.x, gl.pointA.y, gl.pointA.color);
        }

        const distB = Math.hypot(gl.mouse.x - gl.pointB.x, gl.mouse.y - gl.pointB.y);
        if (distB < gl.pointB.radius && gl.hasEnergy) {
           winLevelInternal();
        }

        if (gl.hasEnergy) {
            gl.obstacles.forEach(obs => {
                if (gl.mouse.x > obs.x && gl.mouse.x < obs.x + obs.w &&
                    gl.mouse.y > obs.y && gl.mouse.y < obs.y + obs.h) {
                    gl.hasEnergy = false;
                    setMsg("Ops! Encostou! Volte ao início.");
                    setMsgColor("#ef4444");
                    createExplosion(gl.mouse.x, gl.mouse.y, "#ef4444");
                }
            });
        }
    };

    const createExplosion = (x, y, color, scale = 1) => {
        for(let i=0; i<25; i++) gl.particles.push(new Particle(x, y, color, scale));
    };

    const winLevelInternal = () => {
        gl.active = false;
        setGameState('win');
        createExplosion(gl.pointB.x, gl.pointB.y, gl.pointB.color, 2);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
    animate();

    return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('touchmove', handleMove);
        cancelAnimationFrame(gl.animationFrameId);
    };
  }, [level]);

  const startGame = () => {
    gameLogic.current.active = true;
    gameLogic.current.hasEnergy = false;
    setGameState('playing');
    setMsg("Toque no círculo azul para coletar a energia!");
    setMsgColor("white");
  };

  const nextLevel = () => {
      if (level >= 3) {
          alert("Parabéns Mestre Ninja! Você completou tudo!");
          navigate('/'); 
      } else {
          setLevel(prev => prev + 1);
          setGameState('playing');
          gameLogic.current.active = true;
          gameLogic.current.hasEnergy = false;
      }
  };

  return (
    <div className="w-full h-screen relative bg-slate-900 font-sans overflow-hidden">
        <canvas ref={canvasRef} className="block cursor-crosshair touch-none" />
        
        {/* HUD */}
        <div className="absolute top-0 w-full p-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-md border-b border-white/10 z-10">
            <button onClick={() => navigate('/')} className="bg-slate-700 text-white px-4 py-1 rounded-full border border-cyan-500 hover:bg-cyan-600 transition">🏠 Sair</button>
            <div className="text-purple-400 font-bold bg-purple-900/30 px-4 py-1 rounded-full border border-purple-500">{levels[level].name}</div>
            <div className="text-xl font-bold text-yellow-400 flex items-center gap-2">{diamonds} 💎</div>
        </div>

        <div className="absolute bottom-8 left-0 w-full text-center pointer-events-none">
            <span className="px-6 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 font-bold text-lg transition-colors duration-300" style={{ color: msgColor }}>
                {msg}
            </span>
        </div>

        {gameState === 'start' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm z-50">
                <div className="bg-slate-800 p-8 rounded-3xl border-4 border-cyan-500 max-w-md text-center shadow-[0_0_50px_rgba(34,211,238,0.3)]">
                    <h2 className="text-4xl font-black text-cyan-400 mb-4">DESAFIO NINJA</h2>
                    <p className="text-slate-300 mb-8 text-lg">Use o mouse para levar a energia do ponto A ao ponto B sem tocar nos obstáculos!</p>
                    <button onClick={startGame} className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black rounded-xl text-xl shadow-lg transition-transform active:scale-95">
                        COMEÇAR
                    </button>
                </div>
            </div>
        )}

        {gameState === 'win' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm z-50 animate-fade-in">
                <div className="bg-slate-800 p-8 rounded-3xl border-4 border-green-500 max-w-md text-center shadow-[0_0_50px_rgba(74,222,128,0.3)]">
                    <h2 className="text-4xl font-black text-green-400 mb-2">{level === 3 ? "MESTRE SUPREMO!" : "VITÓRIA!"}</h2>
                    <div className="text-6xl my-4 animate-bounce">💎</div>
                    <p className="text-slate-300 mb-8 text-lg">
                        {level === 3 ? "Você conquistou o Diamante Mestre!" : "Fase concluída com reflexos perfeitos."}
                    </p>
                    <button onClick={nextLevel} className="w-full py-4 bg-green-500 hover:bg-green-400 text-slate-900 font-black rounded-xl text-xl shadow-lg transition-transform active:scale-95">
                        {level === 3 ? "VOLTAR AO MENU" : "PRÓXIMA FASE"}
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

/* =========================================================================
   COMPONENT 2: AULA DE SLIDES COM JACK (15 Slides)
   ========================================================================= */
const AulaSlides = ({ onFinish }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // LISTA DE SLIDES - MAPEADA COM OS ÁUDIOS QUE VOCÊ ENVIOU
  const slides = [
    {
      id: 1,
      audio: "/slide-01.wav", // Certifique-se que o arquivo existe
      gif: "/gif01.gif",
      title: "Boas-vindas",
      text: "E aí, futuro mestre da tecnologia! Eu sou o Jack e serei seu player 2 nessa jornada épica. Preparado para upar suas habilidades?"
    },
    {
      id: 2,
      audio: "/slide-02.wav",
      gif: "/gif02.gif",
      title: "Nada de Aulas Chatas",
      text: "Esqueça aquela ideia de 'aulas chatas'. Aqui, nós temos Missões preparadas especialmente para você se divertir enquanto aprende."
    },
    {
      id: 3,
      audio: "/slide-03.wav",
      gif: "/gif01.gif",
      title: "Mapa de Fases",
      text: "Dá uma olhada no nosso mapa! Cada fase traz um superpoder diferente. Vamos no seu ritmo, do zero ao profissional."
    },
    {
      id: 4,
      audio: "/slide-04.wav",
      gif: "/gif02.gif",
      title: "O Objetivo Final",
      text: "Ao final dessa saga, você vai dominar o Mouse, o Teclado e entender o que tem dentro da máquina!"
    },
    {
      id: 5,
      audio: "/slide-05.wav",
      gif: "/gif01.gif",
      title: "A Primeira Missão",
      text: "Nesta primeira missão, vamos descobrir como a informação viaja até nós. Foca na tela que a nossa jornada começa agora!"
    },
    {
      id: 6,
      audio: "/slide-06.wav",
      gif: "/gif02.gif",
      title: "O Mouse",
      text: "Primeira parada: O Mouse! Você sabia que 'Mouse' significa 'Rato' em inglês? O formato dele lembrava um ratinho."
    },
    {
      id: 7,
      audio: "/slide-07.wav",
      gif: "/gif01.gif",
      title: "Não Morde!",
      text: "Relaxa, esse rato não morde! Ele é o nosso periférico de entrada principal. Ele funciona como sua mão dentro da tela."
    },
    // ATENÇÃO: Renomeie o arquivo 'slide08' para 'slide-08.wav' na pasta public
    {
      id: 8,
      audio: "/slide-08.wav", 
      gif: "/gif02.gif",
      title: "O Cursor",
      text: "Quando você mexe o mouse aqui fora, ele controla aquele Cursor (a setinha) lá dentro. É pura mágica tecnológica!"
    },
    {
      id: 9,
      audio: "/slide-09.wav",
      gif: "/gif01.gif",
      title: "O Clique",
      text: "E tem o clique! É como apertar o gatilho num jogo. Faz 'click' e confirma a sua ação no computador."
    },
    {
      id: 10,
      audio: "/slide-10.wav",
      gif: "/gif02.gif",
      title: "Ergonomia Pro",
      text: "Agora, um segredo de Pro Player: o conforto. Ninguém quer ter 'Game Over' na mão por causa de dor, né?"
    },
    {
      id: 11,
      audio: "/slide-11.wav",
      gif: "/gif01.gif",
      title: "Modo Sem Dor",
      text: "Usar o mouse do jeito errado pode cansar. Vamos ativar o Modo Ergonômico para jogar por horas sem problemas."
    },
    {
      id: 12,
      audio: "/slide-12.wav",
      gif: "/gif02.gif",
      title: "Mão Relaxada",
      text: "Regra de ouro: Mão relaxada! Deixe sua mão descansar sobre o mouse, como se fosse um travesseiro macio."
    },
    {
      id: 13,
      audio: "/slide-13.wav",
      gif: "/gif01.gif",
      title: "Cuidado com o Punho",
      text: "Atenção ao punho! Nada de deixar o pulso dobrado na quina da mesa. O braço precisa ter apoio total."
    },
    {
      id: 14,
      audio: "/slide-14.wav", // Se não tiver esse arquivo, o site pode travar aqui
      gif: "/gif02.gif",
      title: "Desafio de Precisão",
      text: "Chega de papo, hora da ação! Vamos ver se você pegou o jeito. Sua missão é levar o cursor do ponto A ao ponto B."
    },
    {
      id: 15,
      audio: "/slide-15.wav",
      gif: "/gif01.gif",
      title: "Valendo!",
      text: "Tente fazer uma linha reta e suave. Cuidado com os obstáculos! Clique no botão abaixo para começar o Jogo.",
      isLast: true // Marca o último slide para mudar o botão
    }
  ];

  const currentSlide = slides[slideIndex];

  // Toca o áudio automaticamente ao mudar de slide
  useEffect(() => {
    if (audioRef.current) {
      // Pause o áudio anterior antes de trocar
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
      // Carrega o novo
      audioRef.current.src = currentSlide.audio;
      audioRef.current.load();
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(e => {
             console.log("Autoplay bloqueado:", e);
             setIsPlaying(false);
          });
      }
    }
  }, [slideIndex, currentSlide.audio]);

  const handleNext = () => {
    if (slideIndex < slides.length - 1) {
      setSlideIndex(prev => prev + 1);
    } else {
      onFinish(); // Inicia o jogo
    }
  };

  const toggleAudio = () => {
    if(audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
    } else {
        audioRef.current.pause();
        setIsPlaying(false);
    }
  };

  return (
    <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden font-sans">
        {/* Elemento de Áudio (Invisível) */}
        <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

        {/* Fundo Decorativo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-black z-0"></div>
        
        {/* Container Principal */}
        <div className="relative z-10 w-full max-w-5xl h-[85vh] flex flex-col md:flex-row items-center gap-4 md:gap-8 p-6">
            
            {/* ÁREA DO JACK (Esquerda) */}
            <div className="flex-shrink-0 relative group mt-8 md:mt-0">
                <div className="w-48 h-48 md:w-80 md:h-80 rounded-full border-4 border-cyan-400 bg-slate-800 shadow-[0_0_40px_rgba(34,211,238,0.4)] relative overflow-visible z-10 flex items-end justify-center">
                     <div className="absolute inset-0 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 overflow-hidden"></div>
                     <img 
                        src={currentSlide.gif} 
                        alt="Jack Narrador"
                        className="absolute bottom-0 w-[110%] max-w-none transform translate-y-4 transition-transform duration-300 group-hover:scale-105"
                     />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-cyan-600 text-white font-bold px-6 py-1 rounded-full border-2 border-cyan-300 shadow-lg z-20 uppercase tracking-widest">
                    Jack
                </div>
            </div>

            {/* ÁREA DE CONTEÚDO (Direita) */}
            <div className="flex-1 w-full bg-slate-800/90 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col relative min-h-[300px]">
                {/* Botão de Áudio */}
                <button 
                    onClick={toggleAudio}
                    className="absolute top-4 right-4 bg-slate-700 hover:bg-slate-600 p-2 rounded-full transition-colors z-20"
                >
                    {isPlaying ? <Volume2 className="text-green-400 animate-pulse" /> : <VolumeX className="text-slate-400" />}
                </button>

                <div className="flex-1 flex flex-col justify-center">
                    <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4 md:mb-6">
                        {currentSlide.title}
                    </h2>
                    
                    <p className="text-lg md:text-xl text-slate-200 leading-relaxed font-medium">
                        "{currentSlide.text}"
                    </p>
                </div>

                <div className="flex flex-col gap-4 mt-8 pt-4 border-t border-white/5">
                    {/* Barra de Progresso */}
                    <div className="flex gap-1 h-2 w-full">
                        {slides.map((_, idx) => (
                            <div key={idx} className={`flex-1 rounded-full transition-all duration-300 ${idx <= slideIndex ? 'bg-cyan-400' : 'bg-slate-700'}`}></div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">
                            Slide {slideIndex + 1}/{slides.length}
                        </span>
                        <button 
                            onClick={handleNext}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all hover:scale-105 ${
                                currentSlide.isLast 
                                ? "bg-green-500 hover:bg-green-400 text-slate-900 animate-pulse" 
                                : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
                            }`}
                        >
                            {currentSlide.isLast ? "JOGAR AGORA" : "PRÓXIMO"} 
                            {currentSlide.isLast ? <Gamepad2 /> : <ArrowRight />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

/* =========================================================================
   COMPONENT PRINCIPAL DA ROTA: AULA 01
   ========================================================================= */
const Aula01 = () => {
  const [stage, setStage] = useState('video');

  return (
    <>
      {/* 1. VÍDEO INTRODUTÓRIO */}
      {stage === 'video' && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            <video 
                src="/abertura-aula.mp4" 
                className="w-full h-full object-cover"
                autoPlay 
                playsInline
                onEnded={() => setStage('slides')}
                onClick={() => setStage('slides')} // Clique para pular se precisar
            />
            <button 
                onClick={() => setStage('slides')}
                className="absolute bottom-10 right-10 text-white/30 hover:text-white text-sm uppercase tracking-widest border border-white/20 px-4 py-2 rounded transition-colors"
            >
                Pular Introdução
            </button>
        </div>
      )}

      {/* 2. SLIDES COM O JACK */}
      {stage === 'slides' && (
          <AulaSlides onFinish={() => setStage('game')} />
      )}

      {/* 3. JOGO NINJA */}
      {stage === 'game' && (
          <NinjaGame />
      )}
    </>
  );
};

export default Aula01;
