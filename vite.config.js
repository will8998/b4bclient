import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { readFileSync } from 'fs'
import { config } from 'dotenv'

config()

const { NODE_ENV } = process.env

const originDomain = NODE_ENV === 'production' ? 'band4band.wtf' : 'localhost'

const port = 3000

/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [
    sveltekit(),
  ],
  serviceWorker: {
    // todo check below line:
    files: (filepath) => !/\.DS_Store/.test(filepath),
  },
  server: {
    host: 'http://' + originDomain + ':' + port,
    allowedHosts: [originDomain],
    origin: 'http://' + originDomain + ':' + port,
    port: port,
    open: false,
    publicDir: 'static/uploads', // Default: "public"
    https:
      NODE_ENV !== 'production' ?
        null
      : {
          key: readFileSync('/etc/letsencrypt/live/band4band.wtf/privkey.pem'),
          cert: readFileSync('/etc/letsencrypt/live/band4band.wtf/fullchain.pem'),
        },
  },
})
