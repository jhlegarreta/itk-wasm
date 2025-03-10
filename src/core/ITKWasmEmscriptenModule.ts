/// <reference types="emscripten" />

interface ITKWasmEmscriptenModule extends EmscriptenModule {
  mountContainingDir: (filePath: string) => string
  unmountContainingDir: (filePath: string) => void
  mountDir: (filePath: string) => string
  unmountDir: (filePath: string) => void

  fs_mkdirs: (dirs: string) => void
  fs_readFile: (path: string, opts: { encoding?: string, flags?: string }) => string | Uint8Array
  fs_writeFile: (path: string, data: string | ArrayBufferView, opts?: { flags?: string }) => void
  fs_unlink: (path: string) => void
  fs_open: (path: string, flags: string, mode?: string) => object
  fs_stat: (path: string) => { size: number }
  fs_close: (stream: object) => void
  fs_read: (stream: object, buffer: ArrayBufferView, offset: number, length: number, position?: number) => void
}

export default ITKWasmEmscriptenModule
