'use strict';

const Canonicalizer = require('./canonicalizer');
const utils = require('./utils');

const Signer = function(config, currentDate) {

  function getStringToSign(requestOptions, body, headersToSign) {
    return [
      config.algoPrefix + '-HMAC-' + config.hashAlgo,
      utils.toLongDate(currentDate),
      utils.toShortDate(currentDate) + '/' + config.credentialScope,
      utils.hash(config.hashAlgo, new Canonicalizer(config.hashAlgo).canonicalizeRequest(
        requestOptions, body, headersToSign))
    ].join('\n');
  }

  function calculateSigningKey() {

    if (typeof config.apiSecret !== 'string') {
      throw new Error('Invalid Escher key');
    }

    let signingKey = config.algoPrefix + config.apiSecret;
    const authKeyParts = [utils.toShortDate(currentDate)].concat(config.credentialScope.split(/\//g));
    authKeyParts.forEach(function(data) {
      signingKey = utils.hmac(config.hashAlgo, signingKey, data, false);
    });

    return signingKey;
  }

  function calculateSignature(stringToSign, signingKey) {
    return utils.hmac(config.hashAlgo, signingKey, stringToSign, true);
  }

  return {
    getStringToSign: getStringToSign,
    calculateSigningKey: calculateSigningKey,
    calculateSignature: calculateSignature
  };

};

module.exports = Signer;
