/* empty css                                   */
import { a as createComponent, b as renderComponent, e as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Cdtk5z3h.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_o7msmbgn.mjs';
export { renderers } from '../renderers.mjs';

const $$Login = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Login" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen bg-blush flex items-center justify-center px-4 py-16"> <div class="w-full max-w-md"> ${renderComponent($$result2, "Auth", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "D:/projects/scriptora/CURSORAI/scriptora/src/components/Auth", "client:component-export": "Auth" })} </div> </main> ` })}`;
}, "D:/projects/scriptora/CURSORAI/scriptora/src/pages/login.astro", void 0);

const $$file = "D:/projects/scriptora/CURSORAI/scriptora/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
