/* empty css                                   */
import { c as createAstro, a as createComponent, b as renderComponent, e as renderTemplate, m as maybeRenderHead, f as addAttribute } from '../chunks/astro/server_Cdtk5z3h.mjs';
import 'kleur/colors';
import { jsxs, jsx } from 'react/jsx-runtime';
import { $ as $$Layout } from '../chunks/Layout_o7msmbgn.mjs';
import { useRef, useEffect } from 'react';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

function FlippingPageBook() {
  return /* @__PURE__ */ jsxs("div", { className: "relative w-64 h-80", children: [
    /* @__PURE__ */ jsxs("div", { className: "absolute w-48 h-64 bg-white rounded-lg shadow-lg transform rotate-[-5deg] animate-float-slow", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-rosewood opacity-10 rounded-lg" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-4 left-4 w-8 h-8 bg-mauve rounded-full" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4 w-16 h-2 bg-gold rounded-full" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-16 left-4 w-32 h-2 bg-gold rounded-full" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-24 left-4 w-24 h-2 bg-gold rounded-full" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "absolute w-48 h-64 bg-white rounded-lg shadow-lg transform rotate-[5deg] translate-x-8 translate-y-4 animate-float", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-sienna opacity-10 rounded-lg" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-4 left-4 w-8 h-8 bg-mauve rounded-full" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4 w-16 h-2 bg-gold rounded-full" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-16 left-4 w-32 h-2 bg-gold rounded-full" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-24 left-4 w-24 h-2 bg-gold rounded-full" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "absolute w-48 h-64 bg-white rounded-lg shadow-lg transform rotate-[-8deg] translate-x-[-8px] translate-y-8 animate-float-slow", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gold opacity-10 rounded-lg" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-4 left-4 w-8 h-8 bg-mauve rounded-full" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4 w-16 h-2 bg-gold rounded-full" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-16 left-4 w-32 h-2 bg-gold rounded-full" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-24 left-4 w-24 h-2 bg-gold rounded-full" })
    ] })
  ] });
}

const ParticleBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    class Particle {
      x;
      y;
      size;
      speedX;
      speedY;
      color;
      width;
      height;
      opacity;
      baseSize;
      constructor(width, height) {
        this.width = width;
        this.height = height;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseSize = Math.random() * 4 + 2;
        this.size = this.baseSize;
        this.speedX = Math.random() * 1.5 - 0.75;
        this.speedY = Math.random() * 1.5 - 0.75;
        this.opacity = Math.random() * 0.5 + 0.5;
        this.color = `rgba(188, 143, 143, ${this.opacity})`;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.size = this.baseSize + Math.sin(Date.now() * 1e-3 + this.x) * 0.5;
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
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(188, 143, 143, 0.3)";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    const particles = [];
    const particleCount = 70;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas.width, canvas.height));
    }
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            ctx.beginPath();
            const opacity = 0.2 * (1 - distance / 150);
            ctx.strokeStyle = `rgba(188, 143, 143, ${opacity})`;
            ctx.lineWidth = 1;
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
  return /* @__PURE__ */ jsx(
    "canvas",
    {
      ref: canvasRef,
      className: "absolute inset-0 w-full h-full pointer-events-none",
      style: { zIndex: 0 }
    }
  );
};

const $$Astro = createAstro("https://livre.com");
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Welcome", "data-astro-cid-j7pv25f6": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="relative overflow-hidden py-20 animate-fade-in min-h-[90vh] flex items-center" data-astro-cid-j7pv25f6> ${renderComponent($$result2, "ParticleBackground", ParticleBackground, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/projects/scriptora/CURSORAI/scriptora/src/components/ParticleBackground", "client:component-export": "default", "data-astro-cid-j7pv25f6": true })} <div class="absolute inset-0 bg-gradient-to-br from-blush/30 to-peach/30 backdrop-blur-sm" data-astro-cid-j7pv25f6></div> <div class="container mx-auto px-4 relative z-10" data-astro-cid-j7pv25f6> <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" data-astro-cid-j7pv25f6> <div class="text-left" data-astro-cid-j7pv25f6> <h1 class="text-6xl font-bold text-rosewood mb-6 leading-tight animate-slide-up" data-astro-cid-j7pv25f6>
Your Story
<span class="block text-taupe" data-astro-cid-j7pv25f6>Begins Here</span> </h1> <p class="text-xl text-taupe mb-8 max-w-lg animate-slide-up" style="animation-delay: 0.2s" data-astro-cid-j7pv25f6>
Discover captivating stories, share your own tales, and connect with
            fellow book lovers in our vibrant community.
</p> <div class="flex gap-4 animate-slide-up" style="animation-delay: 0.4s" data-astro-cid-j7pv25f6> <a href="/books" class="bg-rosewood text-white px-8 py-3 rounded-full hover:bg-sienna transition-all transform hover:scale-105 shadow-lg hover:shadow-xl" data-astro-cid-j7pv25f6>
Explore Books
</a> <a href="/write" class="border-2 border-rosewood text-rosewood px-8 py-3 rounded-full hover:bg-rosewood hover:text-white transition-all transform hover:scale-105 shadow-lg hover:shadow-xl" data-astro-cid-j7pv25f6>
Start Writing
</a> </div> </div> <div class="relative h-[400px] block scale-75 sm:scale-90 md:scale-100 animate-slide-up" style="animation-delay: 0.6s" data-astro-cid-j7pv25f6> <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" data-astro-cid-j7pv25f6> ${renderComponent($$result2, "FlippingPageBook", FlippingPageBook, { "data-astro-cid-j7pv25f6": true })} </div> </div> </div> </div> </section> <section class="grid grid-cols-1 md:grid-cols-2 gap-8 py-12" data-astro-cid-j7pv25f6> <div class="bg-white p-8 rounded-lg shadow-lg animate-slide-up" data-astro-cid-j7pv25f6> <h2 class="text-3xl font-bold text-rosewood mb-4" data-astro-cid-j7pv25f6>For Readers</h2> <p class="text-taupe mb-6" data-astro-cid-j7pv25f6>
Discover new stories, follow your favorite authors, and build your
        reading list.
</p> <a href="/books" class="inline-block bg-rosewood text-white px-6 py-3 rounded-full hover:bg-sienna transition-colors" data-astro-cid-j7pv25f6>
Explore Books
</a> </div> <div class="bg-white p-8 rounded-lg shadow-lg animate-slide-up" style="animation-delay: 0.2s" data-astro-cid-j7pv25f6> <h2 class="text-3xl font-bold text-rosewood mb-4" data-astro-cid-j7pv25f6>For Authors</h2> <p class="text-taupe mb-6" data-astro-cid-j7pv25f6>
Share your stories with the world, connect with readers, and grow your
        audience.
</p> <a href="/write" class="inline-block bg-rosewood text-white px-6 py-3 rounded-full hover:bg-sienna transition-colors" data-astro-cid-j7pv25f6>
Start Writing
</a> </div> </section> <section class="bg-peach py-16 mt-12 rounded-lg" data-astro-cid-j7pv25f6> <div class="container mx-auto px-4" data-astro-cid-j7pv25f6> <h2 class="text-3xl font-bold text-rosewood text-center mb-8" data-astro-cid-j7pv25f6>
Popular Genres
</h2> <div class="grid grid-cols-2 md:grid-cols-4 gap-6" data-astro-cid-j7pv25f6> ${["Romance", "Fantasy", "Mystery", "Science Fiction"].map(
    (genre, index) => renderTemplate`<div class="text-center animate-slide-up"${addAttribute(`animation-delay: ${index * 0.1}s`, "style")} data-astro-cid-j7pv25f6> <div class="w-20 h-20 bg-mauve rounded-full mx-auto mb-4 flex items-center justify-center" data-astro-cid-j7pv25f6> <span class="text-rosewood text-xl font-bold" data-astro-cid-j7pv25f6> ${genre[0]} </span> </div> <h3 class="text-taupe font-semibold" data-astro-cid-j7pv25f6>${genre}</h3> </div>`
  )} </div> </div> </section> <section class="py-16" data-astro-cid-j7pv25f6> <div class="text-center mb-12" data-astro-cid-j7pv25f6> <h2 class="text-3xl font-bold text-rosewood mb-4" data-astro-cid-j7pv25f6>Featured Books</h2> <p class="text-taupe" data-astro-cid-j7pv25f6>
Discover our handpicked selection of amazing stories
</p> </div> <div data-astro-cid-j7pv25f6> ${renderComponent($$result2, "AllBooksGrid", null, { "client:only": "react", "client:component-hydration": "only", "data-astro-cid-j7pv25f6": true, "client:component-path": "D:/projects/scriptora/CURSORAI/scriptora/src/components/AllBooksGrid", "client:component-export": "default" })} <!-- {
        [1, 2, 3].map((_, index) => (
          <div
            class="bg-white p-6 rounded-lg shadow-lg animate-slide-up"
            style={\`animation-delay: \${index * 0.2}s\`}
          >
            <div class="w-full h-48 bg-gold rounded-lg mb-4" />
            <h3 class="text-xl font-bold text-rosewood mb-2">
              Book Title {index + 1}
            </h3>
            <p class="text-taupe mb-4">
              A captivating story that will keep you hooked from start to
              finish.
            </p>
            <a
              href="#"
              class="text-rosewood hover:text-sienna transition-colors"
            >
              Read More →
            </a>
          </div>
        ))
      } --> </div> </section>  <section class="py-20" data-astro-cid-j7pv25f6> <div class="container mx-auto px-4" data-astro-cid-j7pv25f6> <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center" data-astro-cid-j7pv25f6> <div class="p-6" data-astro-cid-j7pv25f6> <div class="text-4xl font-bold text-rosewood mb-2" data-astro-cid-j7pv25f6>10K+</div> <p class="text-taupe" data-astro-cid-j7pv25f6>Active Readers</p> </div> <div class="p-6" data-astro-cid-j7pv25f6> <div class="text-4xl font-bold text-rosewood mb-2" data-astro-cid-j7pv25f6>5K+</div> <p class="text-taupe" data-astro-cid-j7pv25f6>Published Stories</p> </div> <div class="p-6" data-astro-cid-j7pv25f6> <div class="text-4xl font-bold text-rosewood mb-2" data-astro-cid-j7pv25f6>2K+</div> <p class="text-taupe" data-astro-cid-j7pv25f6>Active Writers</p> </div> <div class="p-6" data-astro-cid-j7pv25f6> <div class="text-4xl font-bold text-rosewood mb-2" data-astro-cid-j7pv25f6>50+</div> <p class="text-taupe" data-astro-cid-j7pv25f6>Genres</p> </div> </div> </div> </section>  <section class="py-20 bg-rosewood/5" data-astro-cid-j7pv25f6> <div class="container mx-auto px-4" data-astro-cid-j7pv25f6> <div class="max-w-2xl mx-auto text-center" data-astro-cid-j7pv25f6> <h2 class="text-4xl font-bold text-rosewood mb-4" data-astro-cid-j7pv25f6>Stay Updated</h2> <p class="text-taupe mb-8" data-astro-cid-j7pv25f6>
Subscribe to our newsletter for the latest stories, writing tips, and
          community updates.
</p> <form class="flex flex-col sm:flex-row gap-4 justify-center" data-astro-cid-j7pv25f6> <input type="email" placeholder="Enter your email" class="px-6 py-3 rounded-full border-2 border-rosewood/20 focus:border-rosewood outline-none flex-grow max-w-md" data-astro-cid-j7pv25f6> <button type="submit" class="bg-rosewood text-white px-8 py-3 rounded-full hover:bg-sienna transition-colors" data-astro-cid-j7pv25f6>
Subscribe
</button> </form> </div> </div> </section>  <section class="py-20" data-astro-cid-j7pv25f6> <div class="container mx-auto px-4" data-astro-cid-j7pv25f6> <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center" data-astro-cid-j7pv25f6> <div data-astro-cid-j7pv25f6> <h2 class="text-4xl font-bold text-rosewood mb-6" data-astro-cid-j7pv25f6>
Join Our Community
</h2> <p class="text-taupe mb-8" data-astro-cid-j7pv25f6>
Connect with fellow writers and readers. Share your stories, get
            feedback, and grow together in our supportive community.
</p> <div class="flex gap-4" data-astro-cid-j7pv25f6> <a href="/community" class="bg-rosewood text-white px-8 py-3 rounded-full hover:bg-sienna transition-colors" data-astro-cid-j7pv25f6>
Join Now
</a> <a href="/discussions" class="border-2 border-rosewood text-rosewood px-8 py-3 rounded-full hover:bg-rosewood hover:text-white transition-colors" data-astro-cid-j7pv25f6>
View Discussions
</a> </div> </div> <div class="grid grid-cols-2 gap-4" data-astro-cid-j7pv25f6> ${[1, 2, 3, 4].map((_, index) => renderTemplate`<div class="bg-white p-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300" data-astro-cid-j7pv25f6> <div class="w-12 h-12 bg-mauve rounded-full mb-3 flex items-center justify-center" data-astro-cid-j7pv25f6> <span class="text-rosewood font-bold" data-astro-cid-j7pv25f6>U${index + 1}</span> </div> <h3 class="font-semibold text-rosewood" data-astro-cid-j7pv25f6>User ${index + 1}</h3> <p class="text-sm text-taupe" data-astro-cid-j7pv25f6>Active Member</p> </div>`)} </div> </div> </div> </section> ` })} `;
}, "D:/projects/scriptora/CURSORAI/scriptora/src/pages/index.astro", void 0);

const $$file = "D:/projects/scriptora/CURSORAI/scriptora/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
