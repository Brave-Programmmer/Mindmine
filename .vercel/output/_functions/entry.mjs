import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_B5ant3vu.mjs';
import { manifest } from './manifest_DTrKddcA.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/authors.astro.mjs');
const _page2 = () => import('./pages/books/_id_.astro.mjs');
const _page3 = () => import('./pages/books.astro.mjs');
const _page4 = () => import('./pages/login.astro.mjs');
const _page5 = () => import('./pages/rss.xml.astro.mjs');
const _page6 = () => import('./pages/write.astro.mjs');
const _page7 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/authors.astro", _page1],
    ["src/pages/books/[id].astro", _page2],
    ["src/pages/books.astro", _page3],
    ["src/pages/login.astro", _page4],
    ["src/pages/rss.xml.ts", _page5],
    ["src/pages/write.astro", _page6],
    ["src/pages/index.astro", _page7]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "78b7533a-9b39-4d17-8294-f918d8c8bd98",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
