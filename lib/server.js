'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _optimalRoutesCollection = require('public-transport-find-optimal-ways/lib/optimalRoutesCollection');

var _optimalRoutesCollection2 = _interopRequireDefault(_optimalRoutesCollection);

var _dataProvider = require('./dataProvider');

var _dataProvider2 = _interopRequireDefault(_dataProvider);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AppServer = function () {
    function AppServer() {
        _classCallCheck(this, AppServer);
    }

    _createClass(AppServer, null, [{
        key: 'findWays',

        // Find optimal ways between two points. The start time, reserved time, going speed and transport types are known.
        value: async function findWays(fromPositionStr, toPositionStr, myStartTimeStr, my_dopTimeMinutes, my_speed, typesStr) {
            var findedOptimalWays = null;
            var minimalTimeSeconds = 0;
            var minimalGoingTimeSeconds = 0;
            var minimalTransportChangingCount = 0;
            try {
                findedOptimalWays = await getCountedWays(fromPositionStr, toPositionStr, myStartTimeStr, my_dopTimeMinutes, my_speed, typesStr);
            } finally {
                if (findedOptimalWays != null && findedOptimalWays.length !== 0) {

                    minimalTimeSeconds = parseFloat(findedOptimalWays[0].totalTimeSeconds);
                    minimalGoingTimeSeconds = parseFloat(findedOptimalWays[0].totalGoingTimeSeconds);
                    minimalTransportChangingCount = parseFloat(findedOptimalWays[0].totalTransportChangingCount);
                    for (var i = 1; i < findedOptimalWays.length; i++) {
                        if (parseFloat(findedOptimalWays[i].totalTimeSeconds) < minimalTimeSeconds) minimalTimeSeconds = parseFloat(findedOptimalWays[i].totalTimeSeconds);
                        if (parseFloat(findedOptimalWays[i].totalGoingTimeSeconds) < minimalGoingTimeSeconds) minimalGoingTimeSeconds = parseFloat(findedOptimalWays[i].totalGoingTimeSeconds);
                        if (parseFloat(findedOptimalWays[i].totalTransportChangingCount) < minimalTransportChangingCount) minimalTransportChangingCount = parseFloat(findedOptimalWays[i].totalTransportChangingCount);
                    }
                    if (minimalTransportChangingCount < 1) minimalTransportChangingCount = 1;
                }
                return findedOptimalWays;
            }
        }
    }]);

    return AppServer;
}();

function strToCoords(str) {
    if (str === undefined || str == null) return undefined;
    var tmp = str.split(',');
    var myLat = parseFloat(tmp[0]);
    var myLng = parseFloat(tmp[1]);
    if (myLat >= -90 && myLat <= 90 && myLng >= -180 && myLng <= 180) return { lat: myLat, lng: myLng };else return undefined;
}
function strToSeconds(str) {
    if (str === undefined || str == null) return undefined;
    var tmp = str.split(':');
    var hours = parseInt(tmp[0], 10);
    var minutes = parseInt(tmp[1], 10);
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) return 3600 * hours + 60 * minutes;else return undefined;
}

async function getCountedWays(fromPositionStr, toPositionStr, myStartTimeStr, my_dopTimeMinutes, my_speed, typesStr) {
    console.log("Start counting...");

    var startOptimalRoutePoint = strToCoords(fromPositionStr);
    var finalOptimalRoutePoint = strToCoords(toPositionStr);
    var myStartTime = strToSeconds(myStartTimeStr);

    if (startOptimalRoutePoint === undefined || finalOptimalRoutePoint === undefined || myStartTime === undefined) return null;

    var types = null;
    if (typesStr !== undefined) types = typesStr.split(',');
    if (types === undefined || types == null) types = ["bus", "trolleybus"];

    var startInitializingMoment = Date.now();

    var params = {
        startOptimalRoutePoint: startOptimalRoutePoint,
        finalOptimalRoutePoint: finalOptimalRoutePoint,
        startTime: myStartTime,
        transportTypes: types,
        goingSpeed: parseFloat(my_speed),
        dopTimeMinutes: parseFloat(my_dopTimeMinutes)
    };

    await _dataProvider2.default.loadDataAndInitialize();
    var res = new _optimalRoutesCollection2.default(_dataProvider2.default.getAllStations(), params.startOptimalRoutePoint, params.finalOptimalRoutePoint, params.startTime, params.transportTypes, params.goingSpeed, params.dopTimeMinutes);
    console.log(res);
    var findedOptimalWays = res.getOptimalWays();
    console.log(findedOptimalWays);

    console.log("Finded " + findedOptimalWays.length + " optimal routes. Time = " + (Date.now() - startInitializingMoment) + " ms.");

    return findedOptimalWays;
}

exports.default = AppServer;