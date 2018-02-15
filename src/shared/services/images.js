import { identity, is } from 'ramda'
import { resolveSnapshot } from 'shared/util/firebase'

const firebase = window.firebase
const storageRef = firebase.storage().ref()
const DB = firebase.database()
const Storage = DB.ref('storage')

const isFunction = is(Function)
const STATE_CHANGED = firebase.storage.TaskEvent.STATE_CHANGED

export function imageUpload(path, file, progressCb) {
  const _key = Storage.push().key
  const fileName = file.name
  const uploadTask = storageRef.child(`storage/${path}/${_key}`).put(file, {})

  return new Promise((resolve, reject) =>
    uploadTask.on(
      STATE_CHANGED, // or 'state_changed'
      isFunction(progressCb) ? progressCb : identity,
      reject,
      () => resolve(uploadTask.snapshot)
    )
  )
    .then(file => getFileUrl(file.metadata.fullPath).then(url => ({ file, url })))
    .then(({ file, url }) => ({
      _key,
      name: fileName,
      fullPath: file.metadata.fullPath,
      url
    }))
}

export function getFiles(folder) {
  return (folder ? Storage.child(folder) : Storage).once('value').then(resolveSnapshot)
}

export function getFileUrl(filePath) {
  return storageRef.child(filePath).getDownloadURL()
}
