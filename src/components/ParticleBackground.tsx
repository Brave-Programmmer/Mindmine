import { useEffect, useRef, useCallback, useMemo } from "react";

const CONFIG = {
  PARTICLE_COUNT: 40,
  CONNECTION_DISTANCE: 180,
  CONNECTION_OPACITY_FACTOR: 0.15,
  BASE_FONT_SIZE: 12,
  MAX_FONT_SIZE_VARIATION: 10,
  PARTICLE_SPEED_RANGE: 0.7,
  GLOW_BLUR: 15,
  ANIMATION_SPEED: 0.0005,
  RESIZE_DEBOUNCE: 200,
  MAX_FPS: 60,
} as const;

const COLORS = {
  ROSEWOOD: [188, 143, 143] as const,
  GLOW: [188, 143, 143] as const,
} as const;

interface ParticleBackgroundProps {
  className?: string;
}

class Particle {
  x: number;
  y: number;
  text: string;
  fontSize: number;
  baseFontSize: number;
  speedX: number;
  speedY: number;
  opacity: number;
  initialOpacity: number;
  phase: number;
  color: string;
  textMetrics: TextMetrics | null = null;

  constructor(
    private canvasWidth: number,
    private canvasHeight: number,
    private wordPool: readonly string[]
  ) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;

    this.text = wordPool[Math.floor(Math.random() * wordPool.length)];
    this.baseFontSize = Math.random() * CONFIG.MAX_FONT_SIZE_VARIATION + CONFIG.BASE_FONT_SIZE;
    this.fontSize = this.baseFontSize;
    this.speedX = (Math.random() - 0.5) * CONFIG.PARTICLE_SPEED_RANGE;
    this.speedY = (Math.random() - 0.5) * CONFIG.PARTICLE_SPEED_RANGE;
    this.initialOpacity = Math.random() * 0.3 + 0.5;
    this.opacity = this.initialOpacity;
    this.phase = Math.random() * Math.PI * 2;
    this.color = this.getColorString();
  }

  private getColorString(): string {
    return `rgba(${COLORS.ROSEWOOD.join(", ")}, ${this.opacity})`;
  }

  update(canvasWidth: number, canvasHeight: number, deltaTime: number): void {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x += this.speedX * deltaTime;
    this.y += this.speedY * deltaTime;

    const currentTime = performance.now() * CONFIG.ANIMATION_SPEED;
    const timeFactor = currentTime + this.phase;
    this.fontSize = this.baseFontSize + Math.sin(timeFactor) * 1.5;
    this.opacity = Math.max(0.1, this.initialOpacity + Math.sin(timeFactor * 0.7) * 0.15);
    this.color = this.getColorString();

    const textWidth = this.textMetrics ? this.textMetrics.width : this.fontSize;
    const textHeight = this.fontSize;

    if (this.x > canvasWidth + textWidth / 2) this.x = -textWidth / 2;
    else if (this.x < -textWidth / 2) this.x = canvasWidth + textWidth / 2;

    if (this.y > canvasHeight + textHeight / 2) this.y = -textHeight / 2;
    else if (this.y < -textHeight / 2) this.y = canvasHeight + textHeight / 2;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.font = `${this.fontSize}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (!this.textMetrics) {
      this.textMetrics = ctx.measureText(this.text);
    }

    ctx.shadowBlur = CONFIG.GLOW_BLUR;
    ctx.shadowColor = `rgba(${COLORS.GLOW.join(", ")}, 0.3)`;
    ctx.fillText(this.text, this.x, this.y);
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
  }
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  className = "absolute inset-0 w-full h-full pointer-events-none",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  const WORD_POOL = useMemo(
    () => [
      "Story", "Idea", "Dream", "Mind", "Create", "Imagine", "Write",
      "Read", "Learn", "Share", "Connect", "Wisdom", "Insight",
      "Explore", "Journey", "Verse", "Chapter", "Narrate",
      "Enlighten", "Inspire", "Discovery",
    ],
    []
  );

  const resizeCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const { innerWidth, innerHeight, devicePixelRatio = 1 } = window;
    const scale = Math.min(devicePixelRatio, 2);

    canvas.width = innerWidth * scale;
    canvas.height = innerHeight * scale;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }, []);

  const initParticles = useCallback((width: number, height: number) => {
    particlesRef.current = Array.from(
      { length: CONFIG.PARTICLE_COUNT },
      () => new Particle(width, height, WORD_POOL)
    );
  }, [WORD_POOL]);

  const drawConnections = useCallback((ctx: CanvasRenderingContext2D) => {
    const particles = particlesRef.current;
    const maxDistSq = CONFIG.CONNECTION_DISTANCE ** 2;

    ctx.lineWidth = 0.8;

    for (let i = 0; i < particles.length - 1; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          const opacity = CONFIG.CONNECTION_OPACITY_FACTOR * (1 - Math.sqrt(distSq) / CONFIG.CONNECTION_DISTANCE);
          ctx.strokeStyle = `rgba(${COLORS.ROSEWOOD.join(", ")}, ${opacity})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    resizeCanvas(canvas);
    initParticles(window.innerWidth, window.innerHeight);

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resizeCanvas(canvas);
        initParticles(window.innerWidth, window.innerHeight);
      }, CONFIG.RESIZE_DEBOUNCE);
    };

    const targetFrameTime = 1000 / CONFIG.MAX_FPS;

    const animate = (currentTime: number) => {
      if (currentTime - lastFrameTime.current < targetFrameTime) {
        animationFrameId.current = requestAnimationFrame(animate);
        return;
      }
      const deltaTime = Math.min((currentTime - lastFrameTime.current) / targetFrameTime, 2);
      lastFrameTime.current = currentTime;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const particle of particlesRef.current) {
        particle.update(window.innerWidth, window.innerHeight, deltaTime);
        particle.draw(ctx);
      }

      drawConnections(ctx);
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      clearTimeout(resizeTimeout);
    };
  }, [resizeCanvas, initParticles, drawConnections]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ zIndex: 0 }}
      aria-hidden="true"
      role="presentation"
    />
  );
};

export default ParticleBackground;
