/* empty css                                   */
import { a as createComponent, b as renderComponent, e as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Cdtk5z3h.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_o7msmbgn.mjs';
export { renderers } from '../renderers.mjs';

const $$Authors = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Authors" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="container mx-auto px-4 py-12"> <h1 class="text-4xl font-bold text-rosewood mb-8 text-center">Authors</h1> <div class="grid grid-cols-1 md:grid-cols-3 gap-8"> <div class="bg-white rounded-lg shadow-lg p-6 text-center"> <h2 class="text-2xl font-bold text-rosewood mb-2">Jane Doe</h2> <p class="text-taupe mb-1">Fantasy</p> <p class="text-taupe">Award-winning author known for her vivid world-building and unforgettable characters.</p> </div> <div class="bg-white rounded-lg shadow-lg p-6 text-center"> <h2 class="text-2xl font-bold text-rosewood mb-2">John Smith</h2> <p class="text-taupe mb-1">Romance</p> <p class="text-taupe">Bestselling romance novelist with a knack for heartfelt storytelling.</p> </div> <div class="bg-white rounded-lg shadow-lg p-6 text-center"> <h2 class="text-2xl font-bold text-rosewood mb-2">Emily Clark</h2> <p class="text-taupe mb-1">Mystery</p> <p class="text-taupe">Master of suspense, Emily crafts mysteries that keep readers on the edge of their seats.</p> </div> </div> </main> ` })}`;
}, "D:/projects/scriptora/CURSORAI/scriptora/src/pages/authors.astro", void 0);

const $$file = "D:/projects/scriptora/CURSORAI/scriptora/src/pages/authors.astro";
const $$url = "/authors";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Authors,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
