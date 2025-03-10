import { IntTypes, FloatTypes, PixelTypes  } from 'itk-wasm'

interface ReadImageOptions {
  /** Component type, from itk-wasm IntTypes, FloatTypes, for the output pixel components. Defaults to the input component type. */
  componentType?: typeof IntTypes[keyof typeof IntTypes] | typeof FloatTypes[keyof typeof FloatTypes]

  /** Pixel type, from itk-wasm PixelTypes, for the output pixels. Defaults to the input pixel type. */
  pixelType?: typeof PixelTypes[keyof typeof PixelTypes]

  /** Only read image metadata -- do not read pixel data. */
  informationOnly?: boolean
}

export default ReadImageOptions
