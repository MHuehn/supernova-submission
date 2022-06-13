import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import * as path from 'path'
import { resolve } from 'path'
import dfxJson from './dfx.json'
import * as fs from 'fs'

const isDev = process.env['DFX_NETWORK'] !== 'ic'

type Network = 'ic' | 'local'

interface CanisterIds {
  [key: string]: { [key in Network]: string }
}

const DFX_HOST = process.env?.DFX_HOST ?? dfxJson.networks.local.bind.split(':')[0]
const DFX_PORT = process.env?.DFX_PORT ?? dfxJson.networks.local.bind.split(':')[1]
const DFX_PROTOCOL = process.env?.DFX_PROTOCOL ?? 'http'

// eslint-disable-next-line no-console
console.log('⚠️', 'Network settings of the replica', {
  DFX_HOST,
  DFX_PORT,
  DFX_PROTOCOL,
})

let canisterIds: CanisterIds = {}

try {
  canisterIds = JSON.parse(
    fs
      .readFileSync(isDev ? '.dfx/local/canister_ids.json' : './canister_ids.json')
      .toString(),
  )
} catch (e) {
  // eslint-disable-next-line no-console
  console.error('\n⚠️  Before starting the dev server run: dfx deploy\n\n')
}

// List of all canisterAliases for canisters
// This will allow us to: import { canisterName } from "canisters/canisterName"
const canisterAliases = Object.entries(dfxJson.canisters).reduce(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (acc, [name, _value]) => {
    // Get the network name, or `local` by default.
    const networkName = process.env['DFX_NETWORK'] || 'local'
    const outputRoot = path.join(__dirname, '.dfx', networkName, 'canisters', name)

    return {
      ...acc,
      ['canisters/' + name]: path.join(outputRoot, 'index' + '.js'),
    }
  },
  {},
)

// Generate canister ids, required by the generated canister code in .dfx/local/canisters/*
// This strange way of JSON.stringifying the value is required by vite
const canisterDefinitions = Object.entries(canisterIds).reduce(
  (acc, [key, val]) => ({
    ...acc,
    [`process.env.${key.toUpperCase()}_CANISTER_ID`]: isDev
      ? JSON.stringify(val.local)
      : JSON.stringify(val.ic),
  }),
  {},
)

export const frontendAliases = {
  ...canisterAliases,
  '~': `${resolve(__dirname, 'src/frontend')}/`,
  '@': `${resolve(__dirname, 'src/frontend')}/`,
}

// See guide on how to configure Vite at:
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  root: resolve(__dirname, 'src/frontend'),
  resolve: {
    alias: {
      // Here we tell Vite the "fake" modules that we want to define
      ...frontendAliases,
    },
  },
  build: {
    outDir: '../../dist',
    target: ['es2020'], // @warn we have to clarify whether that affects our audience
  },
  server: {
    fs: {
      allow: ['.'],
    },
    proxy: {
      // This proxies all http requests made to /api to our running dfx instance
      '/api': {
        target: `${DFX_PROTOCOL}://${DFX_HOST}:${DFX_PORT}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  define: {
    // Here we can define global constants
    // This is required for now because the code generated by dfx relies on process.env being set
    ...canisterDefinitions,
    'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
  },
})
