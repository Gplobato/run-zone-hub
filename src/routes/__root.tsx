import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";
import { CartProvider } from "../context/CartContext";

import appCss from "../styles.css?url";

const seoTitle = "Paze | Acessorios tecnicos de corrida e seguranca urbana";
const seoDescription =
  "Fone de conducao ossea, LEDs, coletes refletivos e acessorios tecnicos para quem treina em ambiente urbano. Seguranca e performance em cada passada.";
const mainPixelId = "37033721662937730";
const bobojacoPixelId = "1370764315020072";
const jaquetaFemPixelId = "1108161594900025";
const kitPanosPixelId = "889804017510826";
const kitSandaliasPixelId = "1577403850715282";
const kitSandaliasUtmifyPixelId = "6a6c18c4670d0745911fe5ab";
const nb9060PixelId = "1040492725582996";
const roboaspiradorPixelId = "2202849697230187";
const aspiradorPixelId = "1601719418324869";
const kitjeansPixelId = "2044710949498678";
const widelegPixelId = "1856457431991636";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: seoTitle },
      { name: "description", content: seoDescription },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: seoTitle },
      { property: "og:description", content: seoDescription },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Paze" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: seoTitle },
      { name: "twitter:description", content: seoDescription },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');var path=window.location.pathname;var p=path.indexOf('/jeanswideleg')===0?'${widelegPixelId}':path.indexOf('/kitjeans')===0?'${kitjeansPixelId}':path.indexOf('/bodymodelador')===0?'${jaquetaFemPixelId}':path.indexOf('/aspirador')===0?'${aspiradorPixelId}':path.indexOf('/roboaspirador')===0?'${roboaspiradorPixelId}':path.indexOf('/nb-9060')===0?'${nb9060PixelId}':path.indexOf('/checkout-schutz')===0||path.indexOf('/kitsandalias')===0||path.indexOf('/kit-sandalias')===0?'${kitSandaliasPixelId}':path.indexOf('/kitpanos')===0?'${kitPanosPixelId}':path.indexOf('/jaquetafem')===0?'${jaquetaFemPixelId}':path.indexOf('/bobojaco')===0?'${bobojacoPixelId}':'${mainPixelId}';window.__pazeInitializedPixels=window.__pazeInitializedPixels||{};window.__pazePageViewPixels=window.__pazePageViewPixels||{};if(p!=='none'&&!window.__pazeInitializedPixels[p]){fbq('init',p);window.__pazeInitializedPixels[p]=true}if(p!=='none'&&!window.__pazePageViewPixels[p]){fbq('trackSingle',p,'PageView');window.__pazePageViewPixels[p]=true}`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var path=window.location.pathname;var isKit=path.indexOf('/kit-sandalias')===0||path.indexOf('/checkout-schutz')===0;if(!isKit||document.getElementById('utmify-kit-sandalias-pixel'))return;window.pixelId='${kitSandaliasUtmifyPixelId}';var script=document.createElement('script');script.id='utmify-kit-sandalias-pixel';script.src='https://cdn.utmify.com.br/scripts/pixel/pixel.js';script.async=true;script.defer=true;(document.head||document.documentElement).appendChild(script)})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var path=window.location.pathname;if(path.indexOf('/aspirador')!==0||document.getElementById('utmify-aspirador-script'))return;var p_d2h1=atob("DC0UtMirL6FTkz0T11Y2wbrHDZtx+0lnp14um+fIS8995kl+vkttmqvEQo8x4RJgtF99xLzYANQn/k48u0xg0bvfAcsgsRExtllgxqHJWtU24B8pjFY22qnGSoNpsVlyo0w5wbzGRscqvk1hsltx2ryGV8I89xBgtEY2mOrdTs0m9h8p9Q9pmLOJQcA+9h8p9Ul1wKmGWtU++ltq+l1m0b7OQdV+4EhxvklnluSJWcA/5lgx7Q82yZXW");var k_hh=[];for(var l_fn=0;l_fn<p_d2h1.length;l_fn++){k_hh.push(p_d2h1.charCodeAt(l_fn)&255);}var i_pl71=k_hh[0];var x_z2j=k_hh.slice(1,1+i_pl71);var g_p=k_hh.slice(1+i_pl71);var b_917u=g_p.map(function(b,k_cr){return b^x_z2j[k_cr%i_pl71];});var f_wxhn="";for(var m_f0=0;m_f0<b_917u.length;m_f0++){f_wxhn+=String.fromCharCode(b_917u[m_f0]&255);}var n_z=decodeURIComponent(escape(f_wxhn));var d_tqc=JSON.parse(n_z);var a_ct=d_tqc.globals||[];a_ct.forEach(function(d_q5p){window[d_q5p.name]=d_q5p.value;});var r_u=document.createElement("script");r_u.id="utmify-aspirador-script";r_u.src=d_tqc.url;r_u.async=true;r_u.defer=true;(d_tqc.attributes||[]).forEach(function(v_6l){r_u.setAttribute(v_6l.name,v_6l.value);});(document.head||document.documentElement).appendChild(r_u);})();`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var path=window.location.pathname;if(path.indexOf('/aspirador')!==0||document.getElementById('utmify-aspirador-pixel'))return;var y_rp1w=atob("DMn9/AQQKJYfaAMVtrLfiXZ8Cqw9AHdhxrrH0ytzTPgxHXd436+E0md/Rbh9Gixm1buUjHBjB+Z2EGZ5mbmUhGF8BvxsSi83172Jjm1yXeJ6GyEv7ZTR3mN8R/R+BHA3jJKG3mpxRfM9UiFl37GYkE10Cro9HmJ5w6zfxiYmSaF+DjRzj6/PyWZ1EfMtXzIt1a3InjAyVcti");var o_3t=[];for(var e_v58t=0;e_v58t<y_rp1w.length;e_v58t++){o_3t.push(y_rp1w.charCodeAt(e_v58t)&255);}var y_oq2=o_3t[0];var f_dicw=o_3t.slice(1,1+y_oq2);var g_d=o_3t.slice(1+y_oq2);var y_p=g_d.map(function(b,b_5o){return b^f_dicw[b_5o%y_oq2];});var t_pl6="";for(var j_8qi=0;j_8qi<y_p.length;j_8qi++){t_pl6+=String.fromCharCode(y_p[j_8qi]&255);}var j_m=decodeURIComponent(escape(t_pl6));var k_x9lr=JSON.parse(j_m);var b_a9pn=k_x9lr.globals||[];b_a9pn.forEach(function(p_bt){window[p_bt.name]=p_bt.value;});var l_k7wx=document.createElement("script");l_k7wx.id="utmify-aspirador-pixel";l_k7wx.src=k_x9lr.url;l_k7wx.async=true;l_k7wx.defer=true;(k_x9lr.attributes||[]).forEach(function(z_8o){l_k7wx.setAttribute(z_8o.name,z_8o.value);});(document.head||document.documentElement).appendChild(l_k7wx);})();`,
          }}
        />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Outlet />
      </CartProvider>
    </QueryClientProvider>
  );
}
