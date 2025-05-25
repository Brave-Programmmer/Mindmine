/* empty css                                   */
import { a as createComponent, b as renderComponent, e as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Cdtk5z3h.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_o7msmbgn.mjs';
export { renderers } from '../renderers.mjs';

const $$Books = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Books" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<h2 class="mt-6 text-3xl font-bold mb-8 text-center text-rosewood">
📚 All Books from All Authors
</h2> ${renderComponent($$result2, "AllBooksGrid", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "D:/projects/scriptora/CURSORAI/scriptora/src/components/AllBooksGrid", "client:component-export": "default" })} ` })}`;
}, "D:/projects/scriptora/CURSORAI/scriptora/src/pages/books.astro", void 0);

const $$file = "D:/projects/scriptora/CURSORAI/scriptora/src/pages/books.astro";
const $$url = "/books";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Books,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
