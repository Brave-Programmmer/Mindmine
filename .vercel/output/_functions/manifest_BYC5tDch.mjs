import 'kleur/colors';
import { g as decodeKey } from './chunks/astro/server_Cdtk5z3h.mjs';
import 'clsx';
import 'cookie';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_DpWdmQC2.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///D:/projects/scriptora/CURSORAI/scriptora/","cacheDir":"file:///D:/projects/scriptora/CURSORAI/scriptora/node_modules/.astro/","outDir":"file:///D:/projects/scriptora/CURSORAI/scriptora/dist/","srcDir":"file:///D:/projects/scriptora/CURSORAI/scriptora/src/","publicDir":"file:///D:/projects/scriptora/CURSORAI/scriptora/public/","buildClientDir":"file:///D:/projects/scriptora/CURSORAI/scriptora/dist/client/","buildServerDir":"file:///D:/projects/scriptora/CURSORAI/scriptora/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/authors.y_YlSmoA.css"},{"type":"inline","content":".page{box-shadow:0 0 15px #0000004d;transform-style:preserve-3d;will-change:transform}#mobile-menu-button.active svg{transform:rotate(90deg);transition:transform .3s ease-in-out}.admin-navbar a:hover{color:rgb(78 59 54 / var(--tw-text-opacity, 1))}.aged-paper{background-color:#d5c5aa;background-image:radial-gradient(rgba(0,0,0,.06) 1px,transparent 1px),radial-gradient(rgba(0,0,0,.06) 1px,transparent 1px);background-position:0 0,25px 25px;background-size:50px 50px;position:relative;box-shadow:inset 0 0 30px #cbb78a;overflow:hidden}.fold-corner:after{content:\"\";position:absolute;top:0;right:0;border-top:40px solid #f3eadd;border-left:40px solid transparent;z-index:20}\n"}],"routeData":{"route":"/authors","isIndex":false,"type":"page","pattern":"^\\/authors\\/?$","segments":[[{"content":"authors","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/authors.astro","pathname":"/authors","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/authors.y_YlSmoA.css"},{"type":"inline","content":".page{box-shadow:0 0 15px #0000004d;transform-style:preserve-3d;will-change:transform}#mobile-menu-button.active svg{transform:rotate(90deg);transition:transform .3s ease-in-out}.admin-navbar a:hover{color:rgb(78 59 54 / var(--tw-text-opacity, 1))}.aged-paper{background-color:#d5c5aa;background-image:radial-gradient(rgba(0,0,0,.06) 1px,transparent 1px),radial-gradient(rgba(0,0,0,.06) 1px,transparent 1px);background-position:0 0,25px 25px;background-size:50px 50px;position:relative;box-shadow:inset 0 0 30px #cbb78a;overflow:hidden}.fold-corner:after{content:\"\";position:absolute;top:0;right:0;border-top:40px solid #f3eadd;border-left:40px solid transparent;z-index:20}\n"}],"routeData":{"route":"/books/[id]","isIndex":false,"type":"page","pattern":"^\\/books\\/([^/]+?)\\/?$","segments":[[{"content":"books","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/books/[id].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/authors.y_YlSmoA.css"},{"type":"inline","content":".page{box-shadow:0 0 15px #0000004d;transform-style:preserve-3d;will-change:transform}#mobile-menu-button.active svg{transform:rotate(90deg);transition:transform .3s ease-in-out}.admin-navbar a:hover{color:rgb(78 59 54 / var(--tw-text-opacity, 1))}.aged-paper{background-color:#d5c5aa;background-image:radial-gradient(rgba(0,0,0,.06) 1px,transparent 1px),radial-gradient(rgba(0,0,0,.06) 1px,transparent 1px);background-position:0 0,25px 25px;background-size:50px 50px;position:relative;box-shadow:inset 0 0 30px #cbb78a;overflow:hidden}.fold-corner:after{content:\"\";position:absolute;top:0;right:0;border-top:40px solid #f3eadd;border-left:40px solid transparent;z-index:20}\n"}],"routeData":{"route":"/books","isIndex":false,"type":"page","pattern":"^\\/books\\/?$","segments":[[{"content":"books","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/books.astro","pathname":"/books","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/authors.y_YlSmoA.css"},{"type":"inline","content":".page{box-shadow:0 0 15px #0000004d;transform-style:preserve-3d;will-change:transform}#mobile-menu-button.active svg{transform:rotate(90deg);transition:transform .3s ease-in-out}.admin-navbar a:hover{color:rgb(78 59 54 / var(--tw-text-opacity, 1))}.aged-paper{background-color:#d5c5aa;background-image:radial-gradient(rgba(0,0,0,.06) 1px,transparent 1px),radial-gradient(rgba(0,0,0,.06) 1px,transparent 1px);background-position:0 0,25px 25px;background-size:50px 50px;position:relative;box-shadow:inset 0 0 30px #cbb78a;overflow:hidden}.fold-corner:after{content:\"\";position:absolute;top:0;right:0;border-top:40px solid #f3eadd;border-left:40px solid transparent;z-index:20}\n"},{"type":"external","src":"/_astro/Auth.GNLSjkBZ.css"}],"routeData":{"route":"/login","isIndex":false,"type":"page","pattern":"^\\/login\\/?$","segments":[[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/login.astro","pathname":"/login","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/rss.xml","isIndex":false,"type":"endpoint","pattern":"^\\/rss\\.xml\\/?$","segments":[[{"content":"rss.xml","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/rss.xml.ts","pathname":"/rss.xml","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/authors.y_YlSmoA.css"},{"type":"inline","content":".page{box-shadow:0 0 15px #0000004d;transform-style:preserve-3d;will-change:transform}#mobile-menu-button.active svg{transform:rotate(90deg);transition:transform .3s ease-in-out}.admin-navbar a:hover{color:rgb(78 59 54 / var(--tw-text-opacity, 1))}.aged-paper{background-color:#d5c5aa;background-image:radial-gradient(rgba(0,0,0,.06) 1px,transparent 1px),radial-gradient(rgba(0,0,0,.06) 1px,transparent 1px);background-position:0 0,25px 25px;background-size:50px 50px;position:relative;box-shadow:inset 0 0 30px #cbb78a;overflow:hidden}.fold-corner:after{content:\"\";position:absolute;top:0;right:0;border-top:40px solid #f3eadd;border-left:40px solid transparent;z-index:20}\n"}],"routeData":{"route":"/write","isIndex":false,"type":"page","pattern":"^\\/write\\/?$","segments":[[{"content":"write","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/write.astro","pathname":"/write","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/authors.y_YlSmoA.css"},{"type":"inline","content":".animate-float[data-astro-cid-j7pv25f6]{animation:float 6s ease-in-out infinite}.animate-float-slow[data-astro-cid-j7pv25f6]{animation:float 8s ease-in-out infinite}@keyframes float{0%{transform:translateY(0) rotate(var(--rotation))}50%{transform:translateY(-20px) rotate(var(--rotation))}to{transform:translateY(0) rotate(var(--rotation))}}.animate-slide-up[data-astro-cid-j7pv25f6]{opacity:0;animation:slideUp .5s ease-out forwards}@keyframes slideUp{0%{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}\n.page{box-shadow:0 0 15px #0000004d;transform-style:preserve-3d;will-change:transform}#mobile-menu-button.active svg{transform:rotate(90deg);transition:transform .3s ease-in-out}.admin-navbar a:hover{color:rgb(78 59 54 / var(--tw-text-opacity, 1))}.aged-paper{background-color:#d5c5aa;background-image:radial-gradient(rgba(0,0,0,.06) 1px,transparent 1px),radial-gradient(rgba(0,0,0,.06) 1px,transparent 1px);background-position:0 0,25px 25px;background-size:50px 50px;position:relative;box-shadow:inset 0 0 30px #cbb78a;overflow:hidden}.fold-corner:after{content:\"\";position:absolute;top:0;right:0;border-top:40px solid #f3eadd;border-left:40px solid transparent;z-index:20}\n"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"https://livre.com","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["D:/projects/scriptora/CURSORAI/scriptora/src/pages/authors.astro",{"propagation":"none","containsHead":true}],["D:/projects/scriptora/CURSORAI/scriptora/src/pages/books.astro",{"propagation":"none","containsHead":true}],["D:/projects/scriptora/CURSORAI/scriptora/src/pages/books/[id].astro",{"propagation":"none","containsHead":true}],["D:/projects/scriptora/CURSORAI/scriptora/src/pages/index.astro",{"propagation":"none","containsHead":true}],["D:/projects/scriptora/CURSORAI/scriptora/src/pages/login.astro",{"propagation":"none","containsHead":true}],["D:/projects/scriptora/CURSORAI/scriptora/src/pages/write.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000noop-middleware":"_noop-middleware.mjs","\u0000noop-actions":"_noop-actions.mjs","\u0000@astro-page:src/pages/authors@_@astro":"pages/authors.astro.mjs","\u0000@astro-page:src/pages/books@_@astro":"pages/books.astro.mjs","\u0000@astro-page:src/pages/login@_@astro":"pages/login.astro.mjs","\u0000@astro-page:src/pages/rss.xml@_@ts":"pages/rss.xml.astro.mjs","\u0000@astro-page:src/pages/write@_@astro":"pages/write.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-page:src/pages/books/[id]@_@astro":"pages/books/_id_.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","D:/projects/scriptora/CURSORAI/scriptora/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_RoD6bBr1.mjs","\u0000@astrojs-manifest":"manifest_BYC5tDch.mjs","D:/projects/scriptora/CURSORAI/scriptora/src/components/CustomBook":"_astro/CustomBook.CY1sAhXD.js","D:/projects/scriptora/CURSORAI/scriptora/src/components/ParticleBackground":"_astro/ParticleBackground.CFHnnT0W.js","D:/projects/scriptora/CURSORAI/scriptora/src/components/AllBooksGrid":"_astro/AllBooksGrid.CMINoi8p.js","D:/projects/scriptora/CURSORAI/scriptora/src/components/Auth":"_astro/Auth.LIabWQiT.js","D:/projects/scriptora/CURSORAI/scriptora/src/components/admin/Books":"_astro/Books.C2pxc-Zx.js","D:/projects/scriptora/CURSORAI/scriptora/src/components/admin/admin":"_astro/admin.DMBuxINK.js","D:/projects/scriptora/CURSORAI/scriptora/src/components/Navbar.tsx":"_astro/Navbar.Cbvp7MoR.js","D:/projects/scriptora/CURSORAI/scriptora/src/components/Footer":"_astro/Footer.BPACq8ar.js","@astrojs/react/client.js":"_astro/client.pR7JlyYm.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/page-flip.Bv9NNsps.mp3","/_astro/authors.y_YlSmoA.css","/aged-paper.png","/favicon.svg","/assets/page-flip.mp3","/_astro/admin.DMBuxINK.js","/_astro/AllBooksGrid.CMINoi8p.js","/_astro/Auth.GNLSjkBZ.css","/_astro/Auth.LIabWQiT.js","/_astro/authStore.CYTjUqjB.js","/_astro/Books.C2pxc-Zx.js","/_astro/client.pR7JlyYm.js","/_astro/CustomBook.CY1sAhXD.js","/_astro/firebase.Dme28GWg.js","/_astro/Footer.BPACq8ar.js","/_astro/howler.CSHXsghX.js","/_astro/index.B7y88wuR.js","/_astro/index.DXH7Qx-t.js","/_astro/jsx-runtime.D_zvdyIk.js","/_astro/Navbar.Cbvp7MoR.js","/_astro/ParticleBackground.CFHnnT0W.js"],"buildFormat":"directory","checkOrigin":true,"serverIslandNameMap":[],"key":"LTA3SdPPxhUmewD27gfvC0KNnucSRnxn2TtmwDWo43Q="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
