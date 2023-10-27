"use strict";

var fernet = require("fernet");

var tweetnacl = require("tweetnacl");

var pbkdf2 = require("pbkdf2");

var getRandomValues = require("get-random-values");

var multihash = require("multihashes");

var sha256_cid = require("ipfs-only-hash");

var ethers = require("ethers");

var MAX_UINT32 = Math.pow(2, 32) - 1;
var MAX_UINT8 = Math.pow(2, 8) - 1;
var FERNET_SECRET_LENGTH = 32;
var NONCE_LENGTH = 24;

var randomNumber = function randomNumber() {
  if (typeof window === "undefined") {
    return getRandomValues(new Uint8Array(1))[0] / MAX_UINT8;
  }

  return getRandomValues(new Uint32Array(1))[0] / MAX_UINT32;
};

var randomString = function randomString() {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;

  for (var i = 0; i < FERNET_SECRET_LENGTH; i++) {
    result += characters.charAt(Math.floor(randomNumber() * charactersLength));
  }

  return result;
}; /// Convert multihash from input of specified type to multihash buffer object
/// Valid input types:
/// - 'raw': raw data of any form - will caculate chunked ipld content id using sha2-256
/// - 'sha2-256': hex encoded sha2-256 hash - will append multihash prefix
/// - 'hex': hex encoded multihash
/// - 'b58': base58 encoded multihash


function multihashFrom(input, inputType) {
  var inputTypes, contentid;
  return regeneratorRuntime.async(function multihashFrom$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          inputTypes = ["raw", "sha2-256", "hex", "b58"];

          if (!(inputType === "raw")) {
            _context.next = 9;
            break;
          }

          _context.t0 = multihash;
          _context.next = 5;
          return regeneratorRuntime.awrap(sha256_cid.of(Buffer.from(input)));

        case 5:
          _context.t1 = _context.sent;
          contentid = _context.t0.fromB58String.call(_context.t0, _context.t1);
          _context.next = 24;
          break;

        case 9:
          if (!(inputType === "sha2-256")) {
            _context.next = 14;
            break;
          }

          input = input.slice(0, 2) === "0x" ? input.slice(2) : input;
          contentid = multihash.fromHexString("1220" + input);
          _context.next = 24;
          break;

        case 14:
          if (!(inputType === "hex")) {
            _context.next = 19;
            break;
          }

          input = input.slice(0, 2) === "0x" ? input.slice(2) : input;
          contentid = multihash.fromHexString(input);
          _context.next = 24;
          break;

        case 19:
          if (!(inputType === "b58")) {
            _context.next = 23;
            break;
          }

          contentid = multihash.fromB58String(input);
          _context.next = 24;
          break;

        case 23:
          throw new Error("Invalid inputType: ".concat(inputType, " should be one of [").concat(inputTypes, "]"));

        case 24:
          multihash.validate(contentid);
          return _context.abrupt("return", contentid);

        case 26:
        case "end":
          return _context.stop();
      }
    }
  });
} /// Convert multihash from buffer object to output of specified type
/// Valid output types:
/// - 'prefix': hex encoded multihash prefix
/// - 'digest': hex encoded hash
/// - 'hex': hex encoded multihash
/// - 'b58': base58 encoded multihash


function multihashTo(contentid, outputType) {
  var outputTypes;
  return regeneratorRuntime.async(function multihashTo$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          outputTypes = ["prefix", "digest", "hex", "b58"];

          if (!(outputType === "prefix")) {
            _context2.next = 5;
            break;
          }

          return _context2.abrupt("return", "0x" + multihash.prefix(contentid).toString("hex"));

        case 5:
          if (!(outputType === "digest")) {
            _context2.next = 9;
            break;
          }

          return _context2.abrupt("return", "0x" + multihash.toHexString(multihash.decode(contentid).digest));

        case 9:
          if (!(outputType === "hex")) {
            _context2.next = 13;
            break;
          }

          return _context2.abrupt("return", "0x" + multihash.toHexString(contentid));

        case 13:
          if (!(outputType === "b58")) {
            _context2.next = 17;
            break;
          }

          return _context2.abrupt("return", multihash.toB58String(contentid));

        case 17:
          throw new Error("Invalid outputType: ".concat(outputType, " should be one of [").concat(outputTypes, "]"));

        case 18:
        case "end":
          return _context2.stop();
      }
    }
  });
}

var MecenateHelper = {
  multihash: function multihash(_ref) {
    var input, inputType, outputType;
    return regeneratorRuntime.async(function multihash$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            input = _ref.input, inputType = _ref.inputType, outputType = _ref.outputType;
            _context3.t0 = multihashTo;
            _context3.next = 4;
            return regeneratorRuntime.awrap(multihashFrom(input, inputType));

          case 4:
            _context3.t1 = _context3.sent;
            _context3.t2 = outputType;
            return _context3.abrupt("return", (0, _context3.t0)(_context3.t1, _context3.t2));

          case 7:
          case "end":
            return _context3.stop();
        }
      }
    });
  },
  constants: {
    RATIO_TYPES: {
      NaN: 0,
      Inf: 1,
      Dec: 2
    },
    TOKEN_TYPES: {
      NaN: 0,
      NMR: 1,
      DAI: 2
    }
  },
  encodeCreateCall: function encodeCreateCall(templateABI, abiValues) {
    var abi = new ethers.utils.Interface(templateABI);
    var calldata = abi.functions.initialize.encode(abiValues);
    return calldata;
  },
  crypto: {
    symmetric: {
      generateKey: function generateKey() {
        var key = Buffer.from(randomString()).toString("base64");
        var secret = fernet.decode64toHex(key);

        while (secret.length !== fernet.hexBits(256)) {
          key = Buffer.from(randomString()).toString("base64");
          secret = fernet.decode64toHex(key);
        }

        return key;
      },
      encryptMessage: function encryptMessage(secretKey, msg) {
        var secret = new fernet.Secret(secretKey);
        var token = new fernet.Token({
          secret: secret,
          ttl: 0
        });
        return token.encode(msg);
      },
      decryptMessage: function decryptMessage(secretKey, encryptedMessage) {
        var secret = new fernet.Secret(secretKey);
        var token = new fernet.Token({
          secret: secret,
          ttl: 0,
          token: encryptedMessage
        });
        return token.decode();
      }
    },
    asymmetric: {
      generateKeyPair: function generateKeyPair(sig, salt) {
        return tweetnacl.box.keyPair.fromSecretKey(pbkdf2.pbkdf2Sync(sig, salt, 1000, 32));
      },
      generateNonce: function generateNonce() {
        return tweetnacl.randomBytes(NONCE_LENGTH);
      },
      encryptMessage: function encryptMessage(msg, nonce, publicKey, secretKey) {
        var encoder = new TextEncoder();
        var encodedMessage = encoder.encode(msg);
        return tweetnacl.box(encodedMessage, nonce, publicKey, secretKey);
      },
      decryptMessage: function decryptMessage(box, nonce, publicKey, secretKey) {
        var decoder = new TextDecoder();
        var encodedMessage = tweetnacl.box.open(box, nonce, publicKey, secretKey);

        if (!encodedMessage) {
          throw new Error("Asymmetric decryption failed. Make sure the public key belongs to the sender and the private key belongs to the receiver");
        }

        return decoder.decode(encodedMessage);
      },
      secretBox: {
        encryptMessage: function encryptMessage(msg, nonce, secretKey) {
          var encoder = new TextEncoder();
          var encodedMessage = encoder.encode(msg);
          return tweetnacl.secretbox(encodedMessage, nonce, secretKey);
        },
        decryptMessage: function decryptMessage(box, nonce, secretKey) {
          var decoder = new TextDecoder();
          var encodedMessage = tweetnacl.secretbox.open(box, nonce, secretKey);
          return decoder.decode(encodedMessage);
        }
      }
    }
  }
};
module.exports = MecenateHelper;