const validators = require('./userControls')
const {propEq, findIndex, pipe, toPairs, pathOr} = require('ramda')
const functions = require('firebase-functions')
const admin = require('firebase-admin')

const {pairsInOrder} = require('./fn')

admin.initializeApp(functions.config().firebase)

const cors = require('cors')({origin: true})

exports.checkExercise = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const exerciseId = req.body.key
    const userSolutions = req.body.solutions

    const validate = (exercise) => {
      return toPairs(exercise.solutions).map(([key, solution]) => {
        const control = exercise.controls[key]
        const userSolution = userSolutions[key]

        switch (control.controlType) {
          case 'simple-text':
            return validators.simpleText(control, solution, userSolution)
          case 'single-number':
            return validators.singleNumber(control, solution, userSolution)
          case 'single-choice':
            return validators.singleChoice(control, solution, userSolution)
          default:
            return false
        }
      })
    }

    admin.database()
      .ref(`/exercise/${exerciseId}/private`)
      .on('value', snapshot => {
        try {
          res
            .status(200)
            .send({valid: validate(snapshot.val())})
        } catch (e) {
          res.status(500).send(e.message)
        }
      })
  })
})

exports.getNextHint = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const exerciseId = req.query.key
    const lastHint = req.query.hint

    admin.database()
      .ref(`/exercise/${exerciseId}/private`)
      .on('value', snapshot => {
        try {
          const ex = snapshot.val()
          const hints = pipe(pathOr({}, ['hints']), pairsInOrder)(ex)
          const lastHintIdx = lastHint === exerciseId
            ? -1
            : findIndex(propEq(0, lastHint), hints)

          if (hints.length > (lastHintIdx + 1)) {
            const [key, hint] = hints[lastHintIdx + 1]
            res.status(200).send({key, hint})
          } else {
            res.status(200).send({hint: false})
          }
        } catch (e) {
          res.status(500).send(e.message)
        }
      })
  })
})

const PUBLIC_PROPS = ['_key', '_created', '_updated', 'classification', 'description', 'controls']
const mapPublicData = obj => (acc, key) => {
  if (obj[key]) acc[key] = obj[key]
  return acc
}

exports.finalizeExercise = functions.database.ref('/exercise/{exerciseId}/private')
  .onWrite(event => {
    // Exit when the data is deleted.
    if (!event.data.exists()) return

    const original = event.data.val()

    // Exit when the exercise in draft
    if (original.draft) return

    // copy public properties
    const publicData = PUBLIC_PROPS.reduce(mapPublicData(original), {})

    publicData.hintCount = Object.keys(pathOr({}, ['hints'], original)).length || 0

    return event.data.ref.parent.child('public').set(publicData)
  })
