import { c as createAstro, a as createComponent, r as renderHead, b as renderComponent, d as renderSlot, e as renderTemplate } from './astro/server_Cdtk5z3h.mjs';
import 'kleur/colors';
/* empty css                           */

const $$Astro = createAstro("https://livre.com");
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title>${renderHead()}</head> <body class="pt-navbar"> ${renderComponent($$result, "Navbar", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "D:/projects/scriptora/CURSORAI/scriptora/src/components/Navbar.tsx", "client:component-export": "Navbar" })} ${renderSlot($$result, $$slots["default"])} ${renderComponent($$result, "Footer", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "D:/projects/scriptora/CURSORAI/scriptora/src/components/Footer", "client:component-export": "Footer" })} </body></html>`;
}, "D:/projects/scriptora/CURSORAI/scriptora/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
