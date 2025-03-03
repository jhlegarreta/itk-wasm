  import PipelineOutput from '../../pipeline/PipelineOutput.js'
  interface RunPipelineWorkerResult {
    returnValue: number
    stdout: string
    stderr: string
    outputs: PipelineOutput[]
  }

  export default RunPipelineWorkerResult