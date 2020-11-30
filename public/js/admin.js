'use strict'
/* globals define, $, socket, app */

define('admin/plugins/telemetry-url', ['settings'], function (Settings) {
  var Admin = {}
 

  Admin.init = function () {
    Admin.initSettings()
  }

  Admin.initSettings = function () {
    Settings.load('telemetry-url', $('.telemetry-url-settings'))

    $('.save').on('click', function () {
      Settings.save('telemetry-url', $('.telemetry-url-settings'), function () {
        app.alert({
          type: 'success',
          alert_id: 'telemetry-url-saved',
          title: 'Settings Saved',
          message: 'Click here to reload NodeBB',
          timeout: 2500,
          clickfn: function () {
            socket.emit('admin.reload')
          }
        })
      })
    })
  }

  return Admin
})
