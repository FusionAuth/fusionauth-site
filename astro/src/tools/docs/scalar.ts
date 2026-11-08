// shared Scalar setup for the per-endpoint clients (ScalarClient) and the full spec page (OpenApiReference)
export const SCALAR_CDN = 'https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.64.0';

// requests go to a local FusionAuth, which needs CORS configured for the docs origin
export const LOCAL_SERVERS = [{
  url: 'http://localhost:9011',
  description: '⚠️ Requests failing? [Configure CORS](/docs/apis/configure-cors) for your test instance.',
}];

const BASE_CSS = `
    .darklight-reference,
    .api-reference-toolbar,
    .download-container,
    .scalar-api-reference-header { display: none !important; }

    input[type="text"],
    input[type="password"],
    input:not([type]) {
      border: 1px solid var(--scalar-border-color) !important;
      background: var(--scalar-background-2) !important;
      border-radius: 4px !important;
      padding: 4px 8px !important;
    }
    input[type="text"]:focus,
    input[type="password"]:focus,
    input:not([type]):focus {
      outline: none !important;
      border-color: var(--scalar-color-accent) !important;
      box-shadow: 0 0 0 2px rgba(245, 131, 32, 0.25) !important;
    }

    body {
      --scalar-color-accent: #f58320;
      --scalar-background-accent: #fff1e0;
      --scalar-color-1: #0f172a;
      --scalar-color-2: #334155;
      --scalar-color-3: #64748b;
      --scalar-background-1: #ffffff;
      --scalar-background-2: #f8fafc;
      --scalar-background-3: #f1f5f9;
      --scalar-border-color: #e2e8f0;
      --scalar-sidebar-background-1: #f8fafc;
      --scalar-sidebar-color-1: #0f172a;
      --scalar-sidebar-color-2: #475569;
      --scalar-sidebar-border-color: #e2e8f0;
      --scalar-sidebar-color-active: #f58320;
      --scalar-sidebar-background-active: #fff1e0;
    }

    body.dark, .dark {
      --scalar-color-1: #f1f5f9;
      --scalar-color-2: #cbd5e1;
      --scalar-color-3: #94a3b8;
      --scalar-background-1: #0f172a;
      --scalar-background-2: #1e293b;
      --scalar-background-3: #334155;
      --scalar-border-color: #334155;
      --scalar-sidebar-background-1: #0b1224;
      --scalar-sidebar-color-1: #f1f5f9;
      --scalar-sidebar-color-2: #94a3b8;
      --scalar-sidebar-border-color: #1e293b;
      --scalar-sidebar-color-active: #f58320;
      --scalar-sidebar-background-active: rgba(245, 131, 32, 0.12);
    }
`;

// a single operation drops Scalar's headings and chrome so it reads as part of the page
const SINGLE_OPERATION_CSS = `

    h3 { font-family: monospace !important; }
    .section-column { min-height: 0px !important; }
    .section-columns { display: inline !important; }
    .section-content .badge { display: none !important; }

    .introduction-description,
    .introduction-description-heading,
    .section-header-wrapper,
    .scalar-reference-intro-clients,
    .operation-title,
    .scalar-sidebar-toggle { display: none !important; }

    header { display: none !important; max-height: 0px !important; }
    .section { padding: 10px 0 10px 0 !important; }
    .operation-layout { display: block !important; }
    .section-container { border-top-width: 0px !important; border-bottom-width: 0px !important; }
    .scalar-app-exit { background: rgba(0,0,0,0.8) !important; }
    .badge { display: inline-flex !important; align-items: center !important; padding: 5px 6px 3px !important; line-height: 1 !important; }

    aside.t-doc__sidebar { top: 65px !important; height: calc(100vh - 65px) !important; }
    [id] { scroll-margin-top: 65px !important; }
`;

const BASE_CONFIG = {
  layout: 'modern',
  hideDarkModeToggle: true,
  documentDownloadType: 'none',
  agent: { disabled: true },
  withDefaultFonts: false,
};

function configAttribute(config: object): string {
  return JSON.stringify(config).replace(/'/g, '&#39;');
}

// Runs in each iframe to sync dark mode from the parent page.
const THEME_SYNC_FN = `(function(){
  function sync(){
    try{
      var p=window.parent.document.documentElement;
      var dark=p.classList.contains('dark')||p.getAttribute('data-theme')==='dark';
      document.documentElement.classList.toggle('dark',dark);
      document.body.classList.toggle('dark',dark);
    }catch(e){}
  }
  sync();
  try{
    new MutationObserver(sync).observe(
      window.parent.document.documentElement,
      {attributes:true,attributeFilter:['class','data-theme']}
    );
  }catch(e){}
})();`;

function srcdoc(isDark: boolean, apiReferenceScript: string): string {
  const bg = isDark ? '#0f172a' : '#ffffff';
  return [
    `<!DOCTYPE html><html style="background:${bg}"><head><meta charset="utf-8"/><style>html,body{background:${bg}}</style></head><body>`,
    '<script>', THEME_SYNC_FN, '<\/script>',
    apiReferenceScript,
    '<script src="', SCALAR_CDN, '"><\/script>',
    '</body></html>',
  ].join('');
}

// one operation, with its spec inlined
export function buildOperationSrcdoc(specJson: string, isDark: boolean): string {
  const config = configAttribute({ ...BASE_CONFIG, showSidebar: false, customCss: BASE_CSS + SINGLE_OPERATION_CSS });
  return srcdoc(isDark, `<script id="api-reference" type="application/json" data-configuration='${config}'>${specJson}<\/script>`);
}

// the whole spec, loaded from its URL, with Scalar's sidebar for browsing
export function buildFullSpecSrcdoc(specUrl: string, isDark: boolean): string {
  const config = configAttribute({ ...BASE_CONFIG, showSidebar: true, servers: LOCAL_SERVERS, customCss: BASE_CSS });
  return srcdoc(isDark, `<script id="api-reference" data-url="${specUrl}" data-configuration='${config}'><\/script>`);
}
