import { handler } from './build/handler.js'
import express from 'express'
import { createServer as createHttpServer } from 'node:http'
import { createServer as createHttpsServer } from 'node:https'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { config } from 'dotenv'
import compression from 'compression'
import { rateLimit } from 'express-rate-limit'
import { lookup } from 'ip-location-api'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

config()

const app = express()
app.disable('x-powered-by')
app.use(handler)

const headers = {
  // CORS headers:
  'Access-Control-Allow-Origin': 'https://band4band.wtf',
  'Vary': 'Origin',
  // Other security headers:
  'Content-Security-Policy': `default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' https://band4band.wtf data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests`, // Mitigate against XSS and other attacks
  'Cross-Origin-Opener-Policy': 'same-origin', // Help process-isolate the page
  'Cross-Origin-Resource-Policy': 'same-site', // Block others from loading resources cross-origin (apparently same-site is less secure than same-origin)
  'Origin-Agent-Cluster': '?1', // Isolate origins from other processes
  // Referrer Header:
  'Referrer-Policy': 'no-referrer', // Control the 'Referrer' request header
  // HSTS Policy:
  // 'Strict-Transport-Security': 'max-age=15552000; includeSubDomains',// Tells browsers to prefer HTTPS (for the next 180 days)
  // MIME Sniffing & XSS Headers:
  'X-Content-Type-Options': 'nosniff', // Mitigates MIME type sniffing
  'X-Download-Options': 'noopen', // Mitigate HTML execution on site context for IE8
  'X-Frame-Options': 'SAMEORIGIN', // Mitigate clickjacking attacks on older browsers
  'X-Permitted-Cross-Domain-Policies': 'none', // Tells clients (mainly Adobe) not to load cross-domain content
  'X-XSS-Protection': '0', // Disables browsers' buggy cross-site scripting filter
}

function HeaderSecurity(req, res, next) {
  const ipv6 = req.ip
  const ipv4 = ipv6.replace('::ffff:', '')
  const { country } = lookup(ipv4)
  req.id = randomUUID()
  req.geo_origin = { ipv4, country }
  res.set(headers)
  next()
}

class TooManyRequests extends Error {
  constructor() {
    super('Too many requests!')
    this.name = this.constructor.name
    this.status = 429
  }
}

function APIErrorHandler429(req, res, next, options) {
  if (typeof req.id === 'undefined' || typeof req.geo_origin === 'undefined') {
    const ipv6 = req.ip
    const ipv4 = ipv6.replace('::ffff:', '')
    const { country } = lookup(ipv4)
    req.id = randomUUID()
    req.geo_origin = { ipv4, country }
  }
  throw new TooManyRequests()
}

const whitelist = []

app.use(HeaderSecurity)

// Unauthorized rate limit: 60 requests / minute (3600 requests / hour)
const RateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute (60000ms) (default)
  limit: 60, // Limit each IP to 120 requests per `window` (here, per 1 minute)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req, res) => req.ip, // IP address by default
  message: 'Too many requests, please try again later.', // likely unused
  statusCode: 429, // likely unused
  skip: (req, res) => whitelist.includes(req.ip),
  handler: APIErrorHandler429,
})

// Authorized rate limit:   120 requests / minute (7200 requests / hour) (TODO)
// const AuthLimiter = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute (60000ms) (default)
//   limit: 120, // Limit each IP to 120 requests per `window` (here, per 1 minute)
//   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
//   keyGenerator: (req, res) => req.ip, // IP address by default
//   message: 'Too many requests, please try again later.',
//   statusCode: 429,
//   skip: (req, res) => whitelist.includes(req.ip),
//   handler: APIErrorHandler429,
// })

app.use(compression())
app.use(RateLimiter)
// app.use(express.json()) // for parsing application/json
// app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// app.use('/uploads', express.static(join('/var/www/app/static/uploads')))

// Check for development environment
const isDev = process.env.NODE_ENV === 'development';

// Function to create HTTPS server with proper certificate handling
function createSecureServer() {
  try {
    // Try to use production certificates if they exist
    const certPath = '/etc/letsencrypt/live/band4band.wtf';
    
    if (fs.existsSync(path.join(certPath, 'privkey.pem')) && 
        fs.existsSync(path.join(certPath, 'fullchain.pem'))) {
      const key = readFileSync(path.join(certPath, 'privkey.pem'));
      const cert = readFileSync(path.join(certPath, 'fullchain.pem'));
      return createHttpsServer({ key, cert }, app);
    } else {
      console.log('Production certificates not found, using HTTP for development');
      return createHttpServer(app);
    }
  } catch (error) {
    console.log('Error setting up HTTPS server, falling back to HTTP:', error.message);
    return createHttpServer(app);
  }
}

const server = createSecureServer();

// Start appropriate server
if (server.constructor.name === 'HttpsServer') {
  server.listen(443);
  console.log('Running at https://band4band.wtf:443');
  
  // HTTP upgrader for HTTPS
  const httpServer = createHttpServer(function (req, res) {
    res.writeHead(301, { 'Location': 'https://band4band.wtf' + req.url });
    res.end();
  });
  httpServer.listen(80);
  console.log('Running at http://band4band.wtf:80 (redirecting to HTTPS)');
} else {
  // Development mode - just use HTTP
  server.listen(3000);
  console.log('Development server running at http://localhost:3000');
}
