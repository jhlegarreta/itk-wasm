// Emscripten-generated asm.js code ends.

/** \brief Utilites for exposing the local filesystem when running in Node.js. */

/** Given an absolute path to a file, mount its containing directory in the
 * Emscripten virtual filesystem. Only relevant when within the Node.js
 * environment. If the containing directory already exists with the
 * Emscripten filesystem, it will not be mounted. */
Module['mountContainingDirectory'] = function (filePath) {
  if (! ENVIRONMENT_IS_NODE) {
    return
  }
  var path = require('path')
  var containingDir = path.dirname(filePath)
  // If the directory already exists, abort
  if (FS.isDir(containingDir) || containingDir === '/') {
    return
  }

  var currentDir = path.sep
  var splitContainingDir = containingDir.split(path.sep)
  for (var ii = 1; ii < splitContainingDir.length; ++ii) {
    currentDir += splitContainingDir[ii]
    if (!FS.analyzePath(currentDir).exists) {
      FS.mkdir(currentDir)
    }
    currentDir += path.sep
  }
  FS.mount(NODEFS, { root: currentDir }, containingDir)
}

/** Given an absolute path to a file, unmount its containing directory in the
 * Emscripten virtual filesystem. */
Module['unmountContainingDirectory'] = function (filePath) {
  if (! ENVIRONMENT_IS_NODE) {
    return
  }
  var path = require('path')
  var containingDir = path.dirname(filePath)
  FS.unmount(containingDir)
}

/** Mount file blobs into the Emscripten filesystem. The blobs argument should be an
 * array of { name: 'filename', data: blob } objects. */
Module['mountBlobs'] = function (mountpoint, blobs) {
  if (! ENVIRONMENT_IS_WORKER) {
    return
  }

  var currentDir = '/'
  var splitMountpoint = mountpoint.split('/')

  for (var ii = 1; ii < splitMountpoint.length; ++ii) {
    currentDir += splitMountpoint[ii]
    if (!FS.analyzePath(currentDir).exists) {
      FS.mkdir(currentDir)
    }
    currentDir += '/'
  }

  FS.mount(WORKERFS, {blobs: blobs}, mountpoint)
}

Module['unmountBlobs'] = function (mountpoint) {
  if (! ENVIRONMENT_IS_WORKER) {
    return
  }

  FS.unmount(mountpoint)
}
