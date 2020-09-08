var user = module.parent.require('./user')
var Plugin = (module.exports = {})
const axios = require('axios')
const { v4: uuidv4 } = require('uuid')

function getEData (
  eid,
  pageid,
  type,
  uri,
  eName,
  eType,
  eSubtype,
  epageid,
  euri,
  evisits
) {
  return {
    eid: eid,
    pageid: pageid,
    type: type,
    uri: uri,
    eName: eName,
    edata: {
      type: eType,
      subtype: eSubtype,
      pageid: epageid,
      uri: euri,
      visits: evisits
    }
  }
}

function callTelemetryAPI (uid, sessionID, body, callFrom, res) {
  let payload = {
    id: 'api.sunbird.telemetry',
    ver: '3.0',
    params: {
      msgid: uuidv4()
    },
    ets: Date.now(),
    events: [
      {
        eid: body.eid,
        ets: Date.now(),
        ver: '3.0',
        mid: `IMPRESSION:${uuidv4()}`,
        actor: {
          id: uid,
          type: 'User'
        },
        context: {
          channel: 'b00bc992ef25f1a9a8d63291e20efc8d',
          pdata: {
            id: 'dev.sunbird.portal',
            ver: '3.2.11',
            pid: 'sunbird-portal'
          },
          env: 'discussions',
          sid: sessionID,
          did: '4eb8ae6a06dbbad37fba723a7019aa7b',
          cdata: [
            {
              id: 'Desktop',
              type: 'Device'
            },
            {
              id: 'default',
              type: 'Theme'
            }
          ],
          rollup: {
            l1: 'b00bc992ef25f1a9a8d63291e20efc8d'
          }
        },
        object: {},
        tags: ['b00bc992ef25f1a9a8d63291e20efc8d'],
        edata: body.edata
      }
    ]
  }

  console.log('--------------------payload---------------------------')
  console.log(payload)

  // https://dev.sunbirded.org/content/data/v1/telemetry

  axios
    .post('https://dev.sunbirded.org/content/data/v1/telemetry', payload)
    .then(async function (response) {
      console.log('>>>>>> res=ponse <<<<<<<<<', response.data)
      if (callFrom === 'EXTERNAL' && typeof res === 'object') {
        res.send({
          status: true,
          message: 'Its passed',
          data: { reqBody: body, payloadData: payload }
        })
      }
    })
    .catch(function (error) {
      // handle error
      console.log(error)
      if (callFrom === 'EXTERNAL' && typeof res === 'object') {
        res.send({ status: false, message: 'Its not passed', data: null })
      }
    })
}

function renderSend (req, res, next) {
  // console.log('>>>>>>>>>>>>>>>>>>>>', req)
  console.log('>>>>>>>>>>>>>>>>>>>>', req.body)
  console.log('>>>>>>>>>>>>>>>>>>>>', `IMPRESSION:${uuidv4()}`)
  console.log(
    '>>>>>>>>>>>>>>>>>>>>',
    req.session.Session,
    req.sessionID,
    req.uid,
    req.server
  )
  const body = JSON.parse(Object.keys(req.body)[0])

  callTelemetryAPI(req.uid, req.sessionID, body, 'EXTERNAL', res)
}

Plugin.load = function (params, callback) {
  console.log(
    '-----------------********************************************************-------------------------'
  )
  console.log(
    '-----------------********************************************************-------------------------'
  )
  console.log(
    '-----------------********************************************************-------------------------'
  )
  console.log(
    '-----------------********************************************************-------------------------'
  )
  console.log(
    '-----------------********************************************************-------------------------'
  )
  console.log('-----------------', params, '-------------------------')
  var router = params.router

  // Define the function that renders the custom route.
  router.post('/api/telemerty', renderSend)
  callback()
}

Plugin.userFollow = function (params, callback) {
  console.log('-----------------', params, '-------------------------')
  var body = getEData(
    'INTERACT',
    'profile-other',
    'User action',
    '',
    'User taps on follow',
    'User action',
    '',
    'params',
    '',
    ''
  )
  console.log(body)
  callTelemetryAPI(params.fromUid, '', body, 'EXTERNAL', '')
  //callback()
}

Plugin.userUnFollow = function (params, callback) {
  console.log('-----------------', params, '-------------------------')
  console.log(
    '-----------------**************************-------------------------'
  )
  //getEData(eid,pageid,type,uri,eName,eType,eSubtype,epageid,euri,evisits)
  var body = getEData(
    'INTERACT',
    'profile-other',
    'User action',
    '',
    'User taps on follow',
    'User action',
    '',
    'params',
    '',
    ''
  )
  console.log(body)
  callTelemetryAPI(params.fromUid, '', body, 'EXTERNAL', '')
  //callback()
}
