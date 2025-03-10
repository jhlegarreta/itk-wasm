import {
  BinaryFile,
  Image,
  castImage,
  getFileExtension,
} from 'itk-wasm'

import mimeToImageIo from './mime-to-image-io.js'
import extensionToImageIo from './extension-to-image-io.js'
import imageIoIndex from './image-io-index.js'

import ReadImageOptions from './read-image-options.js'
import ReadImageResult from './read-image-result.js'

interface ReaderResult {
  webWorker: Worker,
  couldRead: boolean,
  image: Image
}
interface ReaderOptions {
  /** Only read image metadata -- do not read pixel data. */
  informationOnly?: boolean
}
type Reader = (webWorker: null | Worker, serializedImage: File | BinaryFile, options: ReaderOptions) => Promise<ReaderResult>

/**
 * Read an image file format and convert it to the itk-wasm file format
 *
 * @param {webWorker} null | webWorker - Web worker to run the pipeline or null to run it in a new worker
 * @param {File | BinaryFile} serializedImage - Input image serialized in the file format
 * @param {ReadImageOptions} options - options to cast the resulting image type or to only read image metadata
 *
 * @returns {Promise<ReadImageResult>} - result object with the image and the web worker used
 */
async function readImage(
  webWorker: null | Worker,
  serializedImage: File | BinaryFile,
  options: ReadImageOptions = {}
) : Promise<ReadImageResult> {

  const mimeType = (serializedImage as File).type ?? ''
  const fileName = (serializedImage as File).name ?? (serializedImage as BinaryFile).path ?? 'fileName'
  const extension = getFileExtension(fileName).toLowerCase()
  let usedWebWorker = webWorker

  let serializedImageFile = serializedImage as BinaryFile
  if (serializedImage instanceof Blob) {
    const serializedImageBuffer = await serializedImage.arrayBuffer()
    serializedImageFile = { path: serializedImage.name, data: new Uint8Array(serializedImageBuffer) }
  }

  let io = null
  if (mimeType && mimeToImageIo.has(mimeType)) {
    io = mimeToImageIo.get(mimeType)
  } else if (extensionToImageIo.has(extension)) {
    io = extensionToImageIo.get(extension)
  } else {
    for (const readerWriter of imageIoIndex.values()) {
      if (readerWriter[0] !== null) {
        let { webWorker: testWebWorker, couldRead, image } = await (readerWriter[0] as unknown as Reader)(usedWebWorker, { path: serializedImageFile.path, data: serializedImageFile.data.slice() }, { informationOnly: options.informationOnly })
        usedWebWorker = testWebWorker
        if (couldRead) {
          if (typeof options !== 'undefined') {
            image = castImage(image, options)
          }
          return { webWorker: usedWebWorker, image }
        }
      }
    }
  }
  if (!io) {
    throw Error('Could not find IO for: ' + fileName)
  }
  const readerWriter = imageIoIndex.get(io as string)

  const reader = (readerWriter as Array<Reader>)[0]
  let { webWorker: testWebWorker, couldRead, image } = await reader(usedWebWorker, serializedImageFile, { informationOnly: options.informationOnly })
  usedWebWorker = testWebWorker
  if (!couldRead) {
    throw Error('Could not read: ' + fileName)
  }

  if (typeof options !== 'undefined') {
    image = castImage(image, options)
  }

  return { webWorker: usedWebWorker, image }
}

export default readImage
