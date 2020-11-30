var user = module.parent.require('./user')
var Plugin = (module.exports = {})
const axios = require('axios')
const { v4: uuidv4 } = require('uuid')
const Settings = require.main.require('./src/settings')

const constants = {
  pluginSettings: new Settings(
    'telemetry-url',
    '1.0.0',
    {
      // Default settings
      telemetryURL: null
    },
    false,
    false
  )
}


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
  const settings = constants.pluginSettings.getWrapper()
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


  // https://dev.sunbirded.org/content/data/v1/telemetry

  axios
    .post(settings.telemetryURL, payload)
    .then(async function (response) {
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
      if (callFrom === 'EXTERNAL' && typeof res === 'object') {
        res.send({ status: false, message: 'Its not passed', data: null })
      }
    })
}

function renderSend (req, res, next) {
 
  const body = JSON.parse(Object.keys(req.body)[0])
  callTelemetryAPI(req.uid, req.sessionID, body, 'EXTERNAL', res)
}

function render (req, res, next) {
  res.render('admin/plugins/telemetry-url', {})
}

Plugin.load = function (params, callback) {
  var router = params.router

  // Define the function that renders the custom route.
  router.get(
    '/admin/plugins/telemetry-url',
    params.middleware.admin.buildHeader,
    render
  )
  router.post('/api/telemerty', renderSend)
  callback()
}

Plugin.userFollow = function (params, callback) {
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
  callTelemetryAPI(params.fromUid, '', body, 'EXTERNAL', '')
  //callback()
}

Plugin.userUnFollow = function (params, callback) {

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
  callTelemetryAPI(params.fromUid, '', body, 'EXTERNAL', '')
  //callback()
}

Plugin.updatePostVoteCount = function (params, callback) {

  var body = getEData(
    'INTERACT',
    'topics-page',
    'resume',
    '',
    'User taps on vote',
    'User action',
    '',
    'params',
    '',
    ''
  )
  callTelemetryAPI(params.post.uid, '', body, 'EXTERNAL', callback)
}

Plugin.topicReply = function (params, callback) {

  var body = getEData(
    'INTERACT',
    'topics-page',
    'resume',
    '',
    'User reply on topic',
    'User action',
    '',
    'params',
    '',
    ''
  )
  callTelemetryAPI(params.post.uid, '', body, 'EXTERNAL', callback)
}

Plugin.admin = {
  menu: function (custom_header, callback) {
    custom_header.plugins.push({
      route: '/plugins/telemetry-url',
      icon: 'fa-check',
      name: 'Add telemetry URL'
    })

    callback(null, custom_header)
  }
}
