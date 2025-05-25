/* empty css                                   */
import { a as createComponent, b as renderComponent, e as renderTemplate } from '../chunks/astro/server_Cdtk5z3h.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_o7msmbgn.mjs';
export { renderers } from '../renderers.mjs';

const $$Write = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Write" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Books", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "D:/projects/scriptora/CURSORAI/scriptora/src/components/admin/Books", "client:component-export": "default" })} ${renderComponent($$result2, "Admin", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "D:/projects/scriptora/CURSORAI/scriptora/src/components/admin/admin", "client:component-export": "default" })} ` })}`;
}, "D:/projects/scriptora/CURSORAI/scriptora/src/pages/write.astro", void 0);

const $$file = "D:/projects/scriptora/CURSORAI/scriptora/src/pages/write.astro";
const $$url = "/write";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Write,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
