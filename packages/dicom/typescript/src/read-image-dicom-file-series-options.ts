// Generated file. To retain edits, remove this comment.

import { BinaryFile } from 'itk-wasm'

interface ReadImageDicomFileSeriesOptions {
  /** File names in the series */
  inputImages: string[] | File[] | BinaryFile[]

  /** The input files are a single sorted series */
  singleSortedSeries?: boolean

}

export default ReadImageDicomFileSeriesOptions
