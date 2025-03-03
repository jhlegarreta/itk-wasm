import path from 'path'
import mime from 'mime-types'

import mimeToIO from './internal/MimeToImageIO.js'
import getFileExtension from './getFileExtension.js'
import extensionToIO from './extensionToImageIO.js'
import ImageIOIndex from './internal/ImageIOIndex.js'

import Image from '../core/interface-types/image.js'

import loadEmscriptenModule from '../core/internal/loadEmscriptenModuleNode.js'
import runPipelineEmscripten from '../pipeline/internal/runPipelineEmscripten.js'
import PipelineEmscriptenModule from '../pipeline/PipelineEmscriptenModule.js'
import findLocalImageIOPath from './internal/findLocalImageIOPath.js'
import runPipelineNode from '../pipeline/runPipelineNode.js'
import InterfaceTypes from '../core/InterfaceTypes.js'
import PipelineInput from '../pipeline/PipelineInput.js'
import CastImageOptions from '../core/CastImageOptions.js'
import castImage from '../core/castImage.js'

/**
 * Read an image from a file on the local filesystem in Node.js.
 *
 * @param: filePath path to the file on the local filesystem.
 * @param {CastImageOptions} options - specify the componentType and/or pixelType of the output
 */
async function readImageLocalFile (filePath: string, options?: CastImageOptions): Promise<Image> {
  const imageIOsPath = findLocalImageIOPath()
  const absoluteFilePath = path.resolve(filePath)
  const mimeType = mime.lookup(absoluteFilePath)
  const extension = getFileExtension(absoluteFilePath)

  const args = [absoluteFilePath, '0', '--memory-io', '--quiet']
  const desiredOutputs = [
    { type: InterfaceTypes.Image }
  ]
  const inputs = [] as PipelineInput[]

  let io = null
  if (mimeType !== false && mimeToIO.has(mimeType)) {
    io = mimeToIO.get(mimeType)
  } else if (extensionToIO.has(extension)) {
    io = extensionToIO.get(extension)
  } else {
    for (let idx = 0; idx < ImageIOIndex.length; ++idx) {
      const modulePath = path.join(imageIOsPath, ImageIOIndex[idx] + '-read-image.js')
      const readImageModule = await loadEmscriptenModule(modulePath) as PipelineEmscriptenModule
      const mountedFilePath = readImageModule.mountContainingDir(absoluteFilePath)
      const { returnValue, outputs } = runPipelineEmscripten(readImageModule, args, desiredOutputs, inputs)
      readImageModule.unmountContainingDir(mountedFilePath)
      if (returnValue === 0) {
        return outputs[0].data as Image
      }
    }
  }
  if (io === null) {
    throw Error('Could not find IO for: ' + absoluteFilePath)
  }

  const modulePath = path.join(imageIOsPath, io as string + '-read-image.js')
  const mountDirs = new Set([path.dirname(absoluteFilePath)])
  const { outputs } = await runPipelineNode(modulePath, args, desiredOutputs, inputs, mountDirs)

  let result = outputs[0].data as Image

  if (typeof options !== 'undefined') {
    result = castImage(result, options)
  }

  return result
}

export default readImageLocalFile
