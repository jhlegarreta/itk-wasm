import path from 'path'

import Mesh from '../core/interface-types/mesh.js'
import PolyData from '../core/interface-types/poly-data.js'
import findLocalMeshIOPath from './internal/findLocalMeshIOPath.js'
import InterfaceTypes from '../core/InterfaceTypes.js'
import PipelineInput from '../pipeline/PipelineInput.js'
import loadEmscriptenModule from './../core/internal/loadEmscriptenModuleNode.js'
import runPipelineEmscripten from '../pipeline/internal/runPipelineEmscripten.js'
import PipelineEmscriptenModule from '../pipeline/PipelineEmscriptenModule.js'

async function meshToPolyDataNode (mesh: Mesh): Promise<PolyData> {
  const meshIOsPath = findLocalMeshIOPath()

  const args = ['0', '0', '--memory-io']
  const desiredOutputs = [
    { type: InterfaceTypes.PolyData }
  ]
  const inputs = [
    { type: InterfaceTypes.Mesh, data: mesh }
  ] as PipelineInput[]

  const modulePath = path.join(meshIOsPath, 'mesh-to-polydata.js')
  const emModule = await loadEmscriptenModule(modulePath) as PipelineEmscriptenModule
  const { outputs } = runPipelineEmscripten(emModule, args, desiredOutputs, inputs)
  return outputs[0].data as PolyData
}

export default meshToPolyDataNode
