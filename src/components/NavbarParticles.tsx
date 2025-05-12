import { useEffect, useRef } from "react";

const NavbarParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      private width: number;
      private height: number;
      private opacity: number;
      private baseSize: number;

      constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseSize = Math.random() * 2 + 1; // Smaller particles for navbar
        this.size = this.baseSize;
        this.speedX = Math.random() * 0.5 - 0.25; // Slower movement
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.3 + 0.1; // More transparent
        this.color = `rgba(188, 143, 143, ${this.opacity})`; // Rosewood color
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Very subtle size animation
        this.size = this.baseSize + Math.sin(Date.now() * 0.0005 + this.x) * 0.3;

        if (this.x > this.width) this.x = 0;
        if (this.x < 0) this.x = this.width;
        if (this.y > this.height) this.y = 0;
        if (this.y < 0) this.y = this.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Create particles
    const particles: Particle[] = [];
    const particleCount = 30; // Fewer particles for navbar
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas.width, canvas.height));
    }

    // Animation loop
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      // Draw connections with reduced distance and opacity
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 50) { // Shorter connection distance
            ctx.beginPath();
            const opacity = 0.1 * (1 - distance / 50); // More transparent connections
            ctx.strokeStyle = `rgba(188, 143, 143, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default NavbarParticles; 