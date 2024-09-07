import esbuild from 'esbuild'
import { GasPlugin } from 'esbuild-gas-plugin'

esbuild
  .build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    outfile: './dist/index.ts',
    plugins: [GasPlugin]
  })
  .then(() => { console.log('Build complete!') })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
