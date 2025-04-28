import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { readFileSync, existsSync } from 'fs'
import { config } from 'dotenv'

config()

const { NODE_ENV } = process.env

const originDomain = NODE_ENV === 'production' ? 'band4band.wtf' : 'localhost'

const port = 3000

// Check if SSL certificates exist
const sslCertPath = '/etc/letsencrypt/live/band4band.wtf/fullchain.pem'
const sslKeyPath = '/etc/letsencrypt/live/band4band.wtf/privkey.pem'
const sslExists = NODE_ENV === 'production' && existsSync(sslKeyPath) && existsSync(sslCertPath)

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
    host: (sslExists ? 'https://' : 'http://') + originDomain + ':' + port,
    allowedHosts: [originDomain],
    origin: (sslExists ? 'https://' : 'http://') + originDomain + ':' + port,
    port: port,
    open: false,
    publicDir: 'static/uploads', // Default: "public"
    https: sslExists
      ? {
          key: readFileSync(sslKeyPath),
          cert: readFileSync(sslCertPath),
        }
      : false,
  },
})
