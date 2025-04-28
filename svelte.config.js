import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import dotenv from 'dotenv'

dotenv.config()

const production = process.env.NODE_ENV === 'production'

const port = 3000

const baseCsp = [
    'self',
    'https://band4band.wtf',
    'wss://band4band.wtf',
    'https://api.band4band.wtf',
]

if (!production) {
    baseCsp.push('http://localhost:' + port)
    baseCsp.push('ws://localhost:' + port)
}

const unsafeEval = [
    'https://api.band4band.wtf/',
    // 'https://oauth.telegram.org/'
]
  
const mediaCdns = [
    // 'https://dd.dexscreener.com/',
]

// Disable specific warnings
const suppressedWarnings = [
    // a11y
    'a11y_no_static_element_interactions',
    'a11y_click_events_have_key_events',
    'a11y_missing_attribute',
    'a11y_consider_explicit_label',
    'a11y_invalid_attribute',
    'a11y_interactive_supports_focus',
    'a11y_label_has_associated_control',
    'a11y_autofocus',
    // CSS
    'css_unused_selector',
    // ES6
    'export_let_unused',
    // Svelte
    'block_empty',
    'element_invalid_self_closing_tag',
    // Svelte 5
    'non_reactive_update',
    'event_directive_deprecated',
]

// const config = { kit: { adapter: adapter() } };

// export default config;
/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),
  
    kit: {
      adapter: adapter({
        out: 'build',
        precompress: true,
      }),
      csp: {
        mode: 'auto',
        directives: {
          'default-src': [...baseCsp],
          'script-src': ['unsafe-inline', ...baseCsp, 'unsafe-eval', ...unsafeEval],
          'script-src-attr': ['unsafe-inline', ...baseCsp, 'unsafe-eval', ...unsafeEval],
          'img-src': ['data:', 'blob:', ...baseCsp, ...mediaCdns],
          'style-src': ['unsafe-inline', ...baseCsp],
          'object-src': ['none'],
          'base-uri': ['self'],
        },
      },
      files: {
        serviceWorker: 'src/service-worker.js',
      },
      alias: {
        $components: 'src/lib/client/components',
        '$components/*': 'src/lib/client/components/*',
        $client: 'src/lib/client',
        '$client/*': 'src/lib/client/*',
        $stores: 'src/lib/client/stores',
        '$stores/*': 'src/lib/client/stores/*',
        $server: 'src/lib/server',
        '$server/*': 'src/lib/server/*',
      },
      csrf: {
        checkOrigin: true,
      },
    },
  
    onwarn: (warning, handler) => {
      if (suppressedWarnings.includes(warning.code)) {
        return
      }
      handler(warning)
    },
}
  
export default config
