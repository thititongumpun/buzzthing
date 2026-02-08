import {
    build
} from 'esbuild'
import {
    injectManifest
} from 'workbox-build'
import {
    resolve,
    dirname
} from 'path'
import {
    fileURLToPath
} from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url)) 
const root = resolve(__dirname, '..') 
const SW_SRC = resolve(root, 'src/sw.ts') 
const SW_DEST = resolve(root, 'dist/client/sw.js') 
console.log('[generate-sw] Bundling service worker...') 
await build({
    entryPoints: [SW_SRC],
    outfile: SW_DEST,
    bundle: true,
    format: 'esm',
    minify: true,
    sourcemap: false
}) 
console.log('[generate-sw] Injecting precache manifest...') 
const {
    count,
    size
} = await injectManifest({
    swSrc: SW_DEST,
    swDest: SW_DEST,
    globDirectory: resolve(root, 'dist/client'),
    globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'],
    globIgnores: ['sw.js'],
}) 

console.log(`[generate-sw] Done! Precached ${count} files, totalling ${(size / 1024).toFixed(1)} KB`)