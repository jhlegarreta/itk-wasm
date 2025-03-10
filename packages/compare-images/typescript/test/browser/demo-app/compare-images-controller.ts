import { readImage } from '@itk-wasm/image-io'
import { writeImage } from '@itk-wasm/image-io'
import * as compareImages from '../../../dist/index.js'
import compareImagesLoadSampleInputs from "./compare-images-load-sample-inputs.js"

class CompareImagesModel {

  inputs: Map<string, any>
  options: Map<string, any>
  outputs: Map<string, any>

  constructor() {
    this.inputs = new Map()
    this.options = new Map()
    this.outputs = new Map()
    }
  }


class CompareImagesController  {

  constructor(loadSampleInputs) {
    this.loadSampleInputs = loadSampleInputs

    this.model = new CompareImagesModel()
    const model = this.model

    this.webWorker = null

    if (loadSampleInputs) {
      const loadSampleInputsButton = document.querySelector("#compareImagesInputs [name=loadSampleInputs]")
      loadSampleInputsButton.setAttribute('style', 'display: block-inline;')
      loadSampleInputsButton.addEventListener('click', async (event) => {
        loadSampleInputsButton.loading = true
        await loadSampleInputs(model)
        loadSampleInputsButton.loading = false
      })
    }

    // ----------------------------------------------
    // Inputs
    const testImageElement = document.querySelector('#compareImagesInputs input[name=test-image-file]')
    testImageElement.addEventListener('change', async (event) => {
        const dataTransfer = event.dataTransfer
        const files = event.target.files || dataTransfer.files

        const { image, webWorker } = await readImage(null, files[0])
        webWorker.terminate()
        model.inputs.set("testImage", image)
        const details = document.getElementById("compareImages-test-image-details")
        details.innerHTML = `<pre>${globalThis.escapeHtml(JSON.stringify(image, globalThis.interfaceTypeJsonReplacer, 2))}</pre>`
        details.disabled = false
    })

    // ----------------------------------------------
    // Options
    const baselineImagesElement = document.querySelector('#compareImagesInputs input[name=baseline-images-file]')
    baselineImagesElement.addEventListener('change', async (event) => {
        const dataTransfer = event.dataTransfer
        const files = event.target.files || dataTransfer.files

        const readImages = await Promise.all(Array.from(files).map(async (file) => readImage(null, file)))
        readImages.forEach(img => img.webWorker.terminate())
        const inputImages = readImages.map(img => img.image)
        model.options.set("baselineImages", inputImages)
        const details = document.getElementById("compareImages-baseline-images-details")
        details.innerHTML = `<pre>${globalThis.escapeHtml(JSON.stringify(inputImages, globalThis.interfaceTypeJsonReplacer, 2))}</pre>`
        details.disabled = false
    })

    const differenceThresholdElement = document.querySelector('#compareImagesInputs sl-input[name=difference-threshold]')
    differenceThresholdElement.addEventListener('sl-change', (event) => {
        model.options.set("differenceThreshold", parseFloat(differenceThresholdElement.value))
    })

    const radiusToleranceElement = document.querySelector('#compareImagesInputs sl-input[name=radius-tolerance]')
    radiusToleranceElement.addEventListener('sl-change', (event) => {
        model.options.set("radiusTolerance", parseInt(radiusToleranceElement.value))
    })

    const numberOfPixelsToleranceElement = document.querySelector('#compareImagesInputs sl-input[name=number-of-pixels-tolerance]')
    numberOfPixelsToleranceElement.addEventListener('sl-change', (event) => {
        model.options.set("numberOfPixelsTolerance", parseInt(numberOfPixelsToleranceElement.value))
    })

    const ignoreBoundaryPixelsElement = document.querySelector('#compareImagesInputs sl-checkbox[name=ignore-boundary-pixels]')
    ignoreBoundaryPixelsElement.addEventListener('sl-change', (event) => {
        model.options.set("ignoreBoundaryPixels", ignoreBoundaryPixelsElement.checked)
    })

    // ----------------------------------------------
    // Outputs
    const metricsOutputDownload = document.querySelector('#compareImagesOutputs sl-button[name=metrics-download]')
    metricsOutputDownload.addEventListener('click', async (event) => {
        event.preventDefault()
        event.stopPropagation()
        if (model.outputs.has("metrics")) {
            const fileName = `metrics.json`
            globalThis.downloadFile(new TextEncoder().encode(JSON.stringify(model.outputs.get("metrics"))), fileName)
        }
    })

    const differenceImageOutputDownload = document.querySelector('#compareImagesOutputs sl-button[name=difference-image-download]')
    differenceImageOutputDownload.addEventListener('click', async (event) => {
        event.preventDefault()
        event.stopPropagation()
        if (model.outputs.has("differenceImage")) {
            const differenceImageDownloadFormat = document.getElementById('difference-image-output-format')
            const downloadFormat = differenceImageDownloadFormat.value || 'nrrd'
            const fileName = `differenceImage.${downloadFormat}`
            const { webWorker, serializedImage } = await writeImage(null, copyImage(model.outputs.get("differenceImage")), fileName)

            webWorker.terminate()
            globalThis.downloadFile(serializedImage, fileName)
        }
    })

    const differenceUchar2dImageOutputDownload = document.querySelector('#compareImagesOutputs sl-button[name=difference-uchar-2d-image-download]')
    differenceUchar2dImageOutputDownload.addEventListener('click', async (event) => {
        event.preventDefault()
        event.stopPropagation()
        if (model.outputs.has("differenceUchar2dImage")) {
            const differenceUchar2dImageDownloadFormat = document.getElementById('difference-uchar-2d-image-output-format')
            const downloadFormat = differenceUchar2dImageDownloadFormat.value || 'nrrd'
            const fileName = `differenceUchar2dImage.${downloadFormat}`
            const { webWorker, arrayBuffer } = await writeImageArrayBuffer(null, copyImage(model.outputs.get("differenceUchar2dImage")), fileName)

            webWorker.terminate()
            globalThis.downloadFile(arrayBuffer, fileName)
        }
    })

    const runButton = document.querySelector('#compareImagesInputs sl-button[name="run"]')
    runButton.addEventListener('click', async (event) => {
      event.preventDefault()

      if(!model.inputs.has('testImage')) {
        globalThis.notify("Required input not provided", "testImage", "danger", "exclamation-octagon")
        return
      }


      try {
        runButton.loading = true
        const t0 = performance.now()

        const { webWorker, metrics, differenceImage, differenceUchar2dImage, } = await compareImages.compareImages(this.webWorker,
          model.inputs.get('testImage'),
          Object.fromEntries(model.options.entries())
        )

        const t1 = performance.now()
        globalThis.notify("compareImages successfully completed", `in ${t1 - t0} milliseconds.`, "success", "rocket-fill")
        this.webWorker = webWorker

        model.outputs.set("metrics", metrics)
        metricsOutputDownload.variant = "success"
        metricsOutputDownload.disabled = false
        const metricsDetails = document.getElementById("compareImages-metrics-details")
        metricsDetails.innerHTML = `<pre>${globalThis.escapeHtml(JSON.stringify(metrics, globalThis.interfaceTypeJsonReplacer, 2))}</pre>`
        metricsDetails.disabled = false
        const metricsOutput = document.getElementById("compareImages-metrics-details")

        model.outputs.set("differenceImage", differenceImage)
        differenceImageOutputDownload.variant = "success"
        differenceImageOutputDownload.disabled = false
        const differenceImageDetails = document.getElementById("compareImages-difference-image-details")
        differenceImageDetails.innerHTML = `<pre>${globalThis.escapeHtml(JSON.stringify(differenceImage, globalThis.interfaceTypeJsonReplacer, 2))}</pre>`
        differenceImageDetails.disabled = false
        const differenceImageOutput = document.getElementById('compareImages-difference-image-details')

        model.outputs.set("differenceUchar2dImage", differenceUchar2dImage)
        differenceUchar2dImageOutputDownload.variant = "success"
        differenceUchar2dImageOutputDownload.disabled = false
        const differenceUchar2dImageDetails = document.getElementById("compareImages-difference-uchar-2d-image-details")
        differenceUchar2dImageDetails.innerHTML = `<pre>${globalThis.escapeHtml(JSON.stringify(differenceUchar2dImage, globalThis.interfaceTypeJsonReplacer, 2))}</pre>`
        differenceUchar2dImageDetails.disabled = false
        const differenceUchar2dImageOutput = document.getElementById('compareImages-difference-uchar-2d-image-details')
      } catch (error) {
        globalThis.notify("Error while running pipeline", error.toString(), "danger", "exclamation-octagon")
        throw error
      } finally {
        runButton.loading = false
      }
    })
  }
}

const compareImagesController = new CompareImagesController(compareImagesLoadSampleInputs)
