
'use strict'

var fs = require('fs')
var Blowfish = require('xs-blowfish')
/**
* Offers functions to access encrypted keys. Keys are represented in the following way
*        [ { name, api_key } ]
*          where name is the user's name and api_key is it's API key.
* Supposes that keyFile is encrypted with 'key'
*/
module.exports = function (key, keysFile = 'key_manager/keys.bfs') {
  if (!key) throw new Error("A key must be provided to construct the key manager!")

  var bf = new Blowfish(key)

  let fncs; // name binding for self referencing

  return (fncs = {
    /**
     * gets the array that is in 'keysFile'
     */
    getKeys() { //NOTE: To get newest version, file is read every time, but this might not be needed if an observer is implemented
      try {
        let ks = JSON.parse(bf.decrypt(fs.readFileSync(keysFile, 'utf-8')))
        return ks
      } catch (err) { // file not
        if (err instanceof TypeError) throw err
        else return [] //we will simply create a new one!
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
    },
    /**
     * Changes the password used for encryption with the provided one
     */
    changePassowrd(newPass) {
      let dt = fncs.getKeys() //get before changing
      key = newPass
      bf = new Blowfish(key) // reset bf instance
      fncs.writeKeysObject(dt) //write with new key
    },
    /**
     * removes the persone with the provided name from keyFile
     */
    removeSomeone(name) {
      fncs.writeKeysObject(
        fncs.getKeys().filter(el => el.name !== name)
      )
    }
  })
}
