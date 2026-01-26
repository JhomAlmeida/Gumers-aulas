import React, { useState, useEffect, useRef } from 'react';
import { Play, MousePointer, Hand, CheckCircle, XCircle, ArrowRight, Monitor, Gamepad2, Map, Volume2, VolumeX, ChevronRight, Rat } from 'lucide-react';

// URL das imagens e audio
// Nota: O nome do arquivo com espaços e parênteses pode causar problemas em alguns servidores.
// Se persistir, tente renomear o arquivo para "audio_aula.wav".
const ASSETS = {
  jackAvatar: "Gemini_Generated_Image_l5q15ul5q15ul5q1.jpg", 
  audioFile: "download (20).wav"
};

/**
 * COMPONENTE PRINCIPAL: APP
 */
export default function App() {
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Função para avançar de fase
  const nextStage = () => setCurrentStage(prev => prev + 1);
  const resetMission = () => setCurrentStage(0);

  // Controle de Áudio Robusto (Fix para UnhandledRejection)
  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // O play() retorna uma Promise. Precisamos tratar erros (como falta de fonte ou autoplay bloqueado)
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((error) => {
              console.warn("Erro ao tentar reproduzir áudio:", error);
              setIsPlaying(false);
              // Não travamos a app, apenas logamos o aviso e mantemos o estado como "pausado"
            });
        }
      }
    }
  };

  return (
    <div className="w-full h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden flex flex-col relative selection:bg-cyan-500 selection:text-white">
      {/* Elemento de Áudio Invisível com Tratamento de Erro de Carga */}
      <audio 
        ref={audioRef} 
        src={ASSETS.audioFile} 
        loop={false} 
        onError={(e) => console.log("Áudio não pôde ser carregado (verifique o nome do arquivo):", e)}
      />

      {/* Barra Superior - HUD */}
      <div className="absolute top-0 w-full p-4 flex justify-between items-center z-50 bg-slate-900/90 backdrop-blur-md border-b border-cyan-500/30 shadow-lg">
        <div className="flex items-center gap-2">
          <Gamepad2 className="text-cyan-400" size={28} />
          <span className="font-bold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 hidden sm:inline">
            UNIVERSO TECH
          </span>
        </div>

        <div className="flex items-center gap-6">
          {/* Player de Áudio Simplificado */}
          <button 
            onClick={toggleAudio}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full border border-cyan-500/50 transition-all active:scale-95"
          >
            {isPlaying ? <Volume2 className="text-green-400 animate-pulse" size={20} /> : <VolumeX className="text-slate-400" size={20} />}
            <span className="text-xs font-bold text-slate-300 uppercase hidden sm:inline">{isPlaying ? "Ouvindo Jack" : "Dar Play no Áudio"}</span>
          </button>

          {/* Barra de Progresso */}
          <div className="flex flex-col items-end">
            <div className="text-xs text-cyan-200 mb-1 font-mono">MISSÃO 01: FASE {currentStage + 1}/5</div>
            <div className="h-2 w-24 sm:w-32 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 ease-out" 
                style={{ width: `${((currentStage + 1) / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Renderização Condicional das Fases */}
      <div className="flex-1 relative flex flex-col">
        {currentStage === 0 && <StageIntro onNext={nextStage} />}
        {currentStage === 1 && <StageMouseTheory onNext={nextStage} />}
        {currentStage === 2 && <StageErgonomics onNext={nextStage} />}
        {currentStage === 3 && <StageGameIntro onNext={nextStage} />}
        {currentStage === 4 && <StageGamePlay onReset={resetMission} />}
      </div>
    </div>
  );
}

/**
 * COMPONENTE: NARRADOR JACK (Com Sistema de Diálogos)
 */
const JackNarrator = ({ dialogues, onCompleteStage, showNextButton = true }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const currentText = dialogues[currentLineIndex] || "";

  // Efeito de digitação
  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const speed = 20; // Velocidade da digitação
    const interval = setInterval(() => {
      if (i < currentText.length) {
        setDisplayedText(currentText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [currentText]);

  const handleNextLine = () => {
    if (currentLineIndex < dialogues.length - 1) {
      setCurrentLineIndex(prev => prev + 1);
    } else {
      if (onCompleteStage) onCompleteStage();
    }
  };

  const isLastLine = currentLineIndex === dialogues.length - 1;

  return (
    <div className="absolute bottom-0 w-full flex flex-col items-center justify-end pb-6 px-4 z-40 pointer-events-none">
      <div className="w-full max-w-4xl flex items-end gap-4">
        
        {/* Avatar do Jack */}
        <div className="w-28 h-28 sm:w-40 sm:h-40 relative flex-shrink-0 group">
          <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 blur-xl animate-pulse group-hover:opacity-40 transition-opacity"></div>
          <img 
            src={ASSETS.jackAvatar} 
            alt="Jack" 
            className="w-full h-full object-cover rounded-full border-4 border-cyan-400 bg-slate-800 shadow-[0_0_20px_rgba(34,211,238,0.5)] relative z-10"
          />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-cyan-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg z-20 border border-cyan-400">
            Jack
          </div>
        </div>

        {/* Balão de Fala */}
        <div className="flex-1 bg-slate-800/95 backdrop-blur-xl border-2 border-cyan-500/50 p-4 sm:p-6 rounded-2xl rounded-bl-none shadow-2xl mb-4 pointer-events-auto relative min-h-[140px] flex flex-col">
          <h3 className="text-cyan-400 text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-2">
            <Monitor size={14} /> Transmissão Recebida
          </h3>
          
          <p className="text-base sm:text-lg text-white font-medium leading-relaxed drop-shadow-md flex-1">
            {displayedText}<span className="animate-pulse text-cyan-400">|</span>
          </p>

          {/* Botão de Avançar Diálogo */}
          {showNextButton && (
            <div className="flex justify-end mt-2">
              <button 
                onClick={handleNextLine}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${
                  isLastLine 
                    ? "bg-green-500 hover:bg-green-400 text-slate-900 shadow-[0_0_15px_rgba(74,222,128,0.4)] hover:scale-105" 
                    : "bg-cyan-900/50 hover:bg-cyan-800 text-cyan-200 border border-cyan-700"
                }`}
              >
                {isLastLine ? "PRÓXIMA FASE" : "CONTINUAR"} <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * FASE 0: INTRODUÇÃO
 */
const StageIntro = ({ onNext }) => {
  const script = [
    "E aí, futuro mestre da tecnologia! Eu sou o Jack e serei seu player 2 nessa jornada épica pelo mundo da informática!",
    "Se você está aqui, é porque quer dominar os computadores e não apenas usá-los, acertei?",
    "Nós vamos passar um tempo incrível juntos. Esqueça aquela ideia de 'aulas chatas'. Aqui, nós temos 8 Missões preparadas especialmente para você upar suas habilidades.",
    "Dá uma olhada no nosso mapa no telão! Cada fase traz um superpoder diferente. Vamos no seu ritmo.",
    "Ao final dessa saga, você vai dominar o Mouse e o Teclado como um profissional e entender o que tem dentro da máquina.",
    "Nesta primeira missão, vamos descobrir como a informação viaja até nós e por que a internet é tão importante. Preparado para dar o Start?"
  ];

  return (
    <div className="h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black relative">
      {/* Elementos de fundo decorativos */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Conteúdo Central */}
      <div className="h-[60%] flex flex-col items-center justify-center p-8 text-center animate-fade-in-up">
         <h1 className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mb-6 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
          MISSÃO 01
        </h1>
        <p className="text-xl text-cyan-100 font-light tracking-widest uppercase border-b border-cyan-500/30 pb-2">
          O Universo Tech e o Controle Mestre
        </p>
      </div>

      <JackNarrator dialogues={script} onCompleteStage={onNext} />
    </div>
  );
};

/**
 * FASE 1: TEORIA DO MOUSE
 */
const StageMouseTheory = ({ onNext }) => {
  const [showRatAnimation, setShowRatAnimation] = useState(false);

  const script = [
    "Primeira parada: O Mouse! Você sabia que 'Mouse' significa 'Rato' em inglês?",
    "O nome pegou porque o formato dele, com o fiozinho saindo atrás, lembrava muito um ratinho de verdade.",
    "Mas relaxa, esse aqui não morde! Ele funciona como a sua mão dentro da tela.",
    "Quando você mexe o mouse aqui fora, ele controla aquele Cursor (a setinha) lá dentro.",
    "E tem o clique! É como apertar o gatilho num jogo. Confirma a sua ação."
  ];

  // Ativa a animação do rato quando o diálogo estiver na linha 1 (índice 1)
  // Simulação manual de estado baseada no tempo de leitura ou interação seria ideal, 
  // aqui vamos deixar o usuário controlar via botão na tela para ver o efeito.

  return (
    <div className="h-full flex items-center justify-center relative bg-slate-900">
      
      {/* Área Visual Principal */}
      <div className="absolute top-20 w-full flex flex-col items-center justify-center pointer-events-none z-0">
        <div className="relative w-64 h-64 flex items-center justify-center">
          
          {/* Círculo Holográfico */}
          <div className="absolute inset-0 border-2 border-dashed border-cyan-500/30 rounded-full animate-spin-slow"></div>
          
          {/* Transformação Mouse/Rato */}
          <div className={`transition-all duration-500 transform ${showRatAnimation ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
            <MousePointer size={140} className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
          </div>
          
          <div className={`absolute transition-all duration-500 transform ${showRatAnimation ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 -rotate-180'}`}>
            <Rat size={140} className="text-pink-400 drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]" />
          </div>

        </div>

        {/* Botão Interativo para Efeito */}
        <div className="mt-8 pointer-events-auto z-10">
          <button 
            onClick={() => setShowRatAnimation(!showRatAnimation)}
            className="bg-slate-800 border border-slate-600 hover:border-cyan-400 text-slate-300 px-6 py-2 rounded-full text-sm font-bold transition-all hover:bg-slate-700 flex items-center gap-2"
          >
            {showRatAnimation ? "Transformar em Mouse" : "Ver a Mágica (Mouse vs Rato)"}
          </button>
        </div>
      </div>

      <JackNarrator dialogues={script} onCompleteStage={onNext} />
    </div>
  );
};

/**
 * FASE 2: ERGONOMIA
 */
const StageErgonomics = ({ onNext }) => {
  const [posture, setPosture] = useState(null); // 'good' or 'bad'

  const script = [
    "Agora, um segredo de quem joga e trabalha muito no PC: o conforto. Ninguém quer ter 'Game Over' na mão por causa de dor, né?",
    "Para evitar isso, vamos ativar o Modo Ergonômico. Regra de ouro: Mão relaxada! Deixe sua mão descansar sobre o mouse.",
    "E atenção ao punho! Nada de deixar o pulso dobrado ou 'quebrado' na quina da mesa. O braço precisa ter apoio.",
    "O segredo é movimentar o mouse usando o braço todo, deslizando sobre a mesa. Selecione a postura correta abaixo!"
  ];

  return (
    <div className="h-full flex flex-col items-center pt-24 px-4 bg-slate-900 relative">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <Hand className="text-yellow-400" />
        Modo "Pro Player"
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full z-10">
        {/* Opção Errada */}
        <button 
          onClick={() => setPosture('bad')}
          className={`relative p-6 rounded-2xl border-4 transition-all duration-300 group ${
            posture === 'bad' 
              ? 'bg-red-900/30 border-red-500 scale-105 ring-4 ring-red-500/20' 
              : 'bg-slate-800 border-slate-700 hover:border-red-400 opacity-80 hover:opacity-100'
          }`}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 px-4 py-0.5 rounded-full border border-slate-700">
            <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Errado</span>
          </div>
          <div className="h-24 flex items-center justify-center mb-2">
             <div className="w-20 h-6 bg-slate-600 rounded-full relative rotate-12 group-hover:bg-red-500/50 transition-colors">
                <div className="absolute -right-2 top-0 w-10 h-8 bg-slate-500 rounded-full rotate-45 border-2 border-slate-400"></div>
                {/* Indicador de dor */}
                <div className="absolute right-0 top-0 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75"></div>
             </div>
          </div>
          <p className="text-slate-300 text-sm font-medium">Pulso dobrado na quina</p>
          {posture === 'bad' && <XCircle className="absolute top-4 right-4 text-red-500 w-6 h-6 animate-bounce" />}
        </button>

        {/* Opção Certa */}
        <button 
          onClick={() => setPosture('good')}
          className={`relative p-6 rounded-2xl border-4 transition-all duration-300 group ${
            posture === 'good' 
              ? 'bg-green-900/30 border-green-500 scale-105 ring-4 ring-green-500/20' 
              : 'bg-slate-800 border-slate-700 hover:border-green-400 opacity-80 hover:opacity-100'
          }`}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 px-4 py-0.5 rounded-full border border-slate-700">
            <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Certo (Pro)</span>
          </div>
          <div className="h-24 flex items-center justify-center mb-2">
             <div className="w-28 h-6 bg-slate-600 rounded-full relative group-hover:bg-green-500/50 transition-colors">
                <div className="absolute -right-2 top-0 w-10 h-8 bg-slate-500 rounded-full border-2 border-slate-400"></div>
             </div>
          </div>
          <p className="text-slate-300 text-sm font-medium">Antebraço apoiado reto</p>
          {posture === 'good' && <CheckCircle className="absolute top-4 right-4 text-green-500 w-6 h-6 animate-bounce" />}
        </button>
      </div>

      {/* Jack só avança se escolher o certo */}
      <JackNarrator 
        dialogues={script} 
        onCompleteStage={() => {
           if (posture === 'good') onNext();
           else alert("Ops! Selecione a postura correta (Modo Pro) para continuar!");
        }} 
      />
    </div>
  );
};

/**
 * FASE 3: PRÉ-JOGO (Instruções)
 */
const StageGameIntro = ({ onNext }) => {
  const script = [
    "Chega de papo, hora da ação! Vamos ver se você pegou o jeito. Lembra da postura? Braço apoiado, mão relaxada.",
    "Sua Missão: Na tela vão aparecer dois alvos: o Ponto A e o Ponto B.",
    "Eu quero que você leve o cursor do Ponto A até o Ponto B. Mas cuidado: tente fazer uma linha reta e suave.",
    "Valendo!"
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900 z-0">
      <div className="mb-20 animate-pulse">
        <Gamepad2 size={100} className="text-cyan-400 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white mb-2">DESAFIO DE PRECISÃO</h1>
        <div className="h-1 w-32 bg-cyan-500 mx-auto rounded-full"></div>
      </div>
      <JackNarrator dialogues={script} onCompleteStage={onNext} />
    </div>
  );
};

/**
 * FASE 4: O JOGO (CANVAS)
 */
const StageGamePlay = ({ onReset }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [gameState, setGameState] = useState('playing'); // playing, won

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    
    let width = container.clientWidth;
    let height = container.clientHeight;
    
    canvas.width = width;
    canvas.height = height;

    let particles = [];
    let mouse = { x: 0, y: 0 };
    let hasEnergy = false;
    let active = true;

    let pointA = { x: width * 0.15, y: height / 2, radius: 45, color: '#22d3ee', label: 'INÍCIO' };
    let pointB = { x: width * 0.85, y: height / 2, radius: 45, color: '#818cf8', label: 'FIM' };

    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width;
      canvas.height = height;
      pointA.x = width * 0.15;
      pointA.y = height / 2;
      pointB.x = width * 0.85;
      pointB.y = height / 2;
    };
    window.addEventListener('resize', handleResize);

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 6 + 2;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.015;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
      }
      draw() {
        ctx.globalAlpha = this.life;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const createExplosion = (x, y, color) => {
      for (let i = 0; i < 20; i++) {
        let p = new Particle(x, y, color);
        p.vx *= 4;
        p.vy *= 4;
        particles.push(p);
      }
    };

    const winGame = () => {
      active = false;
      hasEnergy = false;
      setGameState('won');
      for (let i = 0; i < 100; i++) {
        const colors = ['#ff0000', '#00ff00', '#ffff00', '#ff00ff', '#00ffff'];
        let p = new Particle(width/2, height/2, colors[Math.floor(Math.random()*colors.length)]);
        p.vx = (Math.random() - 0.5) * 15;
        p.vy = (Math.random() - 0.5) * 15;
        p.decay = 0.01;
        particles.push(p);
      }
    };

    const handleMove = (e) => {
      if (!active) return;
      
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      
      mouse.x = clientX - rect.left;
      mouse.y = clientY - rect.top;

      if (hasEnergy) {
        for (let i = 0; i < 3; i++) {
          particles.push(new Particle(mouse.x, mouse.y, '#fcd34d'));
        }
      } else {
        particles.push(new Particle(mouse.x, mouse.y, 'rgba(255,255,255,0.3)'));
      }

      const distA = Math.hypot(mouse.x - pointA.x, mouse.y - pointA.y);
      if (distA < pointA.radius && !hasEnergy) {
        hasEnergy = true;
        createExplosion(pointA.x, pointA.y, pointA.color);
      }

      const distB = Math.hypot(mouse.x - pointB.x, mouse.y - pointB.y);
      if (distB < pointB.radius && hasEnergy) {
        createExplosion(pointB.x, pointB.y, pointB.color);
        winGame();
      }
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchmove', handleMove, { passive: false });

    let animationFrameId;
    const animate = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      drawPoint(ctx, pointA, hasEnergy ? '#1e293b' : pointA.color);
      drawPoint(ctx, pointB, hasEnergy ? pointB.color : '#1e293b');

      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0) particles.splice(i, 1);
      }
      
      if (hasEnergy && active) {
          ctx.beginPath();
          ctx.strokeStyle = '#fcd34d';
          ctx.setLineDash([10, 10]);
          ctx.lineWidth = 2;
          ctx.moveTo(pointA.x, pointA.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
          ctx.setLineDash([]);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const drawPoint = (context, p, color) => {
      context.save();
      context.shadowBlur = 20;
      context.shadowColor = color;
      context.beginPath();
      context.strokeStyle = color;
      context.lineWidth = 4;
      context.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      context.stroke();
      
      const pulse = Math.sin(Date.now() / 300) * 5;
      context.beginPath();
      context.fillStyle = color;
      context.arc(p.x, p.y, p.radius * 0.6 + pulse, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = 'white';
      context.font = 'bold 14px sans-serif';
      context.textAlign = 'center';
      context.fillText(p.label, p.x, p.y + p.radius + 25);
      context.restore();
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('touchmove', handleMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      <canvas ref={canvasRef} className="block cursor-none touch-none" />
      
      <div className="absolute top-24 w-full flex justify-center pointer-events-none">
        <div className="bg-slate-800/90 px-8 py-3 rounded-full border border-cyan-500/50 backdrop-blur-md shadow-lg">
            {gameState === 'playing' ? (
                <span className="text-cyan-300 font-bold animate-pulse text-lg">LEVE A ENERGIA ATÉ O PONTO B!</span>
            ) : (
                <span className="text-green-400 font-bold text-lg">MISSÃO CUMPRIDA!</span>
            )}
        </div>
      </div>

      {gameState === 'won' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 animate-fade-in backdrop-blur-sm p-4">
          <div className="bg-slate-900 p-8 rounded-3xl border-2 border-green-500 text-center shadow-[0_0_50px_rgba(34,197,94,0.3)] max-w-md w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-green-500/10 animate-pulse"></div>
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-4 relative z-10">
              VITORIA!
            </h2>
            <p className="text-slate-300 text-lg mb-8 relative z-10">
              Você completou a Missão 01 com reflexos de ninja!
            </p>
            <button 
              onClick={onReset}
              className="w-full py-4 bg-green-500 hover:bg-green-400 text-slate-900 font-bold rounded-xl text-xl shadow-lg hover:scale-105 transition-all relative z-10"
            >
              Jogar Novamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
