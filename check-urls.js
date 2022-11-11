const glob = require('glob');
const fs = require('fs');
let fetch = require('node-fetch');

let i = 0;
/**
 * Verify all url
 * @param {*} urls
 */
async function verifyUrls(urls) {
  try {
    const res = await fetch(urls[i]);
    if (res.status === 404) {
      throw new Error(`${res.status} ${res.statusText} : ${urls[i]}`);
    } else if (res.status === 200) {
      console.log('\x1b[32m', `${res.status} ${res.statusText} : ${urls[i]}`);
    } else {
      console.log('\x1b[35m', `${res.status} ${res.statusText} : ${urls[i]}`);
    }
  } catch (error) {
    console.log('\x1b[31m', error.message);
  }
  i++;
  if (i < urls.length) {
    verifyUrls(urls);
  }
}

/**
 * Return all urls in a string
 * @param {*} message
 * @returns
 */
function detectURLs(message) {
  var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
  return message.match(urlRegex);
}

const ignoreDomain = [
  'localhost',
  'twitter',
  'discord',
  'api.badger.com',
  'rpc.fantom.tools',
  'rpc.xdaichain.com',
  'bsc-dataseed.binance.org',
  'rpc-mainnet.matic.quiknode.pro',
  'arb1.arbitrum.io/rpc',
];
/**
 * Get path of all files under folder src
 * @param {*} src
 * @param {*} callback
 */
const getDirectories = function (src, callback) {
  glob(src + '/**/*', callback);
};
getDirectories('src', function (err, res) {
  if (err) {
    console.log('Error', err);
  } else {
    const allFiles = res.filter((r) => r.includes('.ts') || r.includes('.tsx'));
    let allUrls = [];
    allFiles.forEach((url) => {
      const text = fs.readFileSync(url, 'utf8');
      const urls = detectURLs(text);
      urls && allUrls.push(...urls);
    });

    allUrls = Array.from(new Set(allUrls)).map((url) => url.replace(/[,'"><(){};`]/gi, ''));
    allUrls = allUrls.filter((url) => !ignoreDomain.some((domain) => url.includes(domain)));
    console.log('\x1b[34m', `Total URLS: ${allUrls.length} `);
    verifyUrls(allUrls);
  }
});
