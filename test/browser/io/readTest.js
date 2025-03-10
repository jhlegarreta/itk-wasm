import test from 'tape'
import axios from 'axios'

import { IntTypes, FloatTypes, PixelTypes, getMatrixElement, readArrayBuffer, readBlob, readFile } from 'browser/index.js'

const cthead1SmallBase64DataURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAAAAABWESUoAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAHdElNRQfhBQYVKw8AZTNIAAADdklEQVQ4y2WTa2wUVRiGp6W7O3POnLmc2VrstokJlrBIUBJigjfSICVCCAo/QKM/FFNRIESJQKAws3M7M2f20t3GthRKQQq0kkoXMIq9oFwCXkg0UpMakGLgR9EmJF4TNOvZhRBb31+TvM955/vO+T6Ou69pAgSwKCCAEPc/lYUhFEUkMgH2ESmbYocEEUmKLIQqBKmEgUlERQhAPhyJiDMXPFZZDmRGoP8Q5TwC4ciMpatfXE9zmT2NVRVIQiLi76cDUVRDT/m72zLUc/Srv+gNCi8jhCrupvMAQIWf1zJx58pRj7g7h/sduunhiIIkUAJ4AUBZ0LZev3TondmeS42TuaYms6kOapJUalYQAAKxt+j4qD3yxvMZ0z47NLi/ydhWA7GMinWyAH6G1Wwe/OdUz6dz33T35dPdIxdIYrPGK0qxTnYrobVtjm+3pNvPxGu9/dTRgw8/e89et0AKF1uFItS2u7ZP7fr4K3H19VbP94me/T6fXRifM6+a/QKC6N5+PWGYZhVeNn9pzvUoTVnt3/QEz81dUTONgwjis4UzvS2Z5JbY9JlPdxmEuFZzX9va0yu5WlXmRAlWd3Tmjg980vXBprJZbYPtza0dXw40ZleeP1ZbrWKOXXpsu7Grb3gnsY/27B46+e3ElVuF3w+sm7Pki2VAUxkAo1t0a7TL8YnVPZxy6KG9fX/+2qu/+9DARoAVBiDYaHjnfc/3nHOdicA1Em6WpnOdG/I6zwCA5PCzrn6uw6VO99gBnRBKGUyIMfz3BgmrHHta8cEdu04dN6wjPwy6FinaTNT8emKNzGrgBEmJLLf7T6Tf/60wpFP2oKToB/bNr+pVTWHjghQxZuTzW51C4aIZENdj8gMv+1f3I7iYwPEqrFu+z1/zzI3vHN/ziEd9P0haV39aXxXFRaBMRrCu9Vjj5o/S5C4QBCnjws+pJ9SoqpZmRlqyeNWlPa922El22PMCl5if38q9FGV+CeAaFuK4OZY5nLRoksnsPX19nL5do2GsREoAlCtr68lo4VoXNROWdXD8j7GUNV96AMPye5MtYgU/ujF/887tHy+PXLt9o9/asUipvDfWpc1QNFWKPfla8PHI5Ysnsua2l2dH1Un7WS6rKlamxx9f/MKKhkX1syoxmLqcUMVRDTNMlZGkilPsUrOsJ6wxRSel/wuAkzbenLRf4gAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxNy0wNS0wNlQxNzoyNjozNC0wNDowMORO/MMAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTctMDUtMDZUMTc6MjY6MzQtMDQ6MDCVE0R/AAAAAElFTkSuQmCC'
const byteString = window.atob(cthead1SmallBase64DataURI.split(',')[1])
const mimeString = cthead1SmallBase64DataURI.split(',')[0].split(':')[1].split(';')[0]
const intArray = new Uint8Array(byteString.length)
for (let ii = 0; ii < byteString.length; ++ii) {
  intArray[ii] = byteString.charCodeAt(ii)
}
const cthead1SmallBlob = new window.Blob([intArray], { type: mimeString })
const cthead1SmallFile = new window.File([cthead1SmallBlob], 'cthead1Small.png')

const meshFileName = 'cow.vtk'
const meshTestFilePath = 'base/build-emscripten/ExternalData/test/Input/' + meshFileName

const verifyImage = (t, image) => {
  t.is(image.imageType.dimension, 2, 'dimension')
  t.is(image.imageType.componentType, IntTypes.UInt8, 'componentType')
  t.is(image.imageType.pixelType, PixelTypes.Scalar, 'pixelType')
  t.is(image.imageType.components, 1, 'components')
  t.is(image.origin[0], 0.0, 'origin[0]')
  t.is(image.origin[1], 0.0, 'origin[1]')
  t.is(image.spacing[0], 1.0, 'spacing[0]')
  t.is(image.spacing[1], 1.0, 'spacing[1]')
  t.is(getMatrixElement(image.direction, 2, 0, 0), 1.0, 'direction (0, 0)')
  t.is(getMatrixElement(image.direction, 2, 0, 1), 0.0, 'direction (0, 1)')
  t.is(getMatrixElement(image.direction, 2, 1, 0), 0.0, 'direction (1, 0)')
  t.is(getMatrixElement(image.direction, 2, 1, 1), 1.0, 'direction (1, 1)')
  t.is(image.size[0], 32, 'size[0]')
  t.is(image.size[1], 32, 'size[1]')
  t.is(image.data.length, 1024, 'data.length')
  t.is(image.data[512], 12, 'data[512]')
  t.end()
}

const verifyMesh = (t, mesh) => {
  t.is(mesh.meshType.dimension, 3)
  t.is(mesh.meshType.pointComponentType, FloatTypes.Float32)
  t.is(mesh.meshType.cellComponentType, IntTypes.UInt32)
  t.is(mesh.meshType.pointPixelType, PixelTypes.Scalar)
  t.is(mesh.meshType.cellPixelType, PixelTypes.Scalar)
  t.is(mesh.numberOfPoints, 2903)
  t.is(mesh.numberOfCells, 3263)
  t.end()
}

export default function () {
  test('readArrayBuffer reads an image ArrayBuffer', (t) => {
    return cthead1SmallFile.arrayBuffer()
      .then(arrayBuffer => {
        return readArrayBuffer(null, arrayBuffer, 'cthead1Small.png')
          .then(function ({ image, webWorker }) {
            webWorker.terminate()
            verifyImage(t, image)
          })
      })
  })

  test('readBlob reads a Blob', (t) => {
    return readBlob(null, cthead1SmallBlob, 'cthead1Small.png')
      .then(function ({ image, webWorker }) {
        webWorker.terminate()
        verifyImage(t, image)
      })
  })

  test('readFile reads a File', (t) => {
    return readFile(null, cthead1SmallFile)
      .then(function ({ image, webWorker }) {
        webWorker.terminate()
        verifyImage(t, image)
      })
  })

  test('readFile re-uses a WebWorker', (t) => {
    return readFile(null, cthead1SmallFile)
      .then(function ({ image, webWorker }) {
        return readFile(webWorker, cthead1SmallFile)
          .then(function ({ image, webWorker }) {
            webWorker.terminate()
            verifyImage(t, image)
          })
      })
  })

  test('readFile throws a catchable error for an invalid file', (t) => {
    const invalidArray = new Uint8Array([21, 4, 4, 4, 4, 9, 5, 0, 82, 42])
    const invalidBlob = new window.Blob([invalidArray])
    const invalidFile = new window.File([invalidBlob], 'invalid.png')
    return readFile(null, invalidFile).then(function ({ image, webWorker }) {
      webWorker.terminate()
      t.fail('should not have successfully read the image')
      t.end()
    }).catch(function (error) {
      t.pass(String(error))
      t.pass('thrown an error that was caught')
      t.end()
    })
  })

  test('readBlob reads a mesh Blob', (t) => {
    return axios.get(meshTestFilePath, { responseType: 'blob' })
      .then(function (response) {
        return readBlob(null, response.data, 'cow.vtk')
      })
      .then(function ({ mesh, webWorker }) {
        webWorker.terminate()
        verifyMesh(t, mesh)
      })
  })

  test('readFile reads a mesh File', (t) => {
    return axios.get(meshTestFilePath, { responseType: 'blob' }).then(function (response) {
      const jsFile = new window.File([response.data], meshFileName)
      return jsFile
    })
      .then(function (jsFile) {
        return readFile(null, jsFile)
      })
      .then(function ({ mesh, webWorker }) {
        webWorker.terminate()
        verifyMesh(t, mesh)
      })
  })

  test('readArrayBuffer reads a mesh ArrayBuffer', (t) => {
    return axios.get(meshTestFilePath, { responseType: 'arraybuffer' })
      .then(function (response) {
        return readArrayBuffer(null, response.data, 'cow.vtk')
      })
      .then(function ({ mesh, webWorker }) {
        webWorker.terminate()
        verifyMesh(t, mesh)
      })
  })
}
