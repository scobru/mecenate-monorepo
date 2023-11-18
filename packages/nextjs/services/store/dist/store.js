'use strict';
exports.__esModule = true;
exports.useAppStore = void 0;
var zustand_1 = require('zustand');
exports.useAppStore = zustand_1['default'](function (set) {
  return {
    ethPrice: 0,
    setEthPrice: function (newValue) {
      return set(function () {
        return { ethPrice: newValue };
      });
    },
    sismoResponse: [],
    setSismoResponse: function (newValue) {
      return set(function () {
        return { sismoResponse: newValue };
      });
    },
    sismoData: [],
    setSismoData: function (newValue) {
      return set(function () {
        return { sismoData: newValue };
      });
    },
  };
});
