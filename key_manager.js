
'use strict'

var fs = require('fs')

/**
* Offers functions to access encrypted keys. Keys are represented in the following way
*        [ { name, api_key } ]
*          where name is the user's name and api_key is it's API key.
* Supposes that keyFile is encrypted with 'key'
*/
module.exports = function (key, keysFile = 'keys.bfs') {
  if (!key) throw new Error("A key must be provided to construct the key manager!")

  var bf = new (require('xs-blowfish'))(key)

  let fncs; // name binding for self referencing

  return (fncs = {
    /**
     * gets the array that is in 'keysFile'
     */
    getKeys() {
      try {
        return eval(bf.decrypt(fs.readFileSync(keysFile, 'utf-8')))
      } catch (err) {
        throw new Error('Decrypted data is not valid JavaScript, possibly you are using the incorrect key!')
      }
    },
    /**
     * Parses, ecrypts and writes the provided object to 'keysFile'
     */
    writeKeysObject(obj) { //NOTE: Letting users delete everything might not be the best thing to do
      fs.writeFileSync(keysFile, bf.encrypt(JSON.stringify(obj)))
    },
    /**
     *  adds a key object to the array in 'keysFile'
     */
    addKeys(name, key){
      let ks = fncs.getKeys()
      ks.push({name: name, api_key: key})

      fncs.writeKeysObject(ks)
    }
  })
}
