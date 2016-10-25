'use strict'

var inquirer
var keyManager

(function init() {  // ask for password until user gets is right or terminates
  inquirer = require('inquirer')
  keyManager = require('./key_manager')
  inquirer.prompt([
    {
      type: 'password',
      message: 'Enter key file password',
      name: 'password'
    }
  ]).then(function (answers) {
    keyManager = keyManager(answers.password)  //it would be nice if we could cache password for future runs

    //check that pass makes sense
    try {
      keyManager.getKeys() // will throw error if password is incorrect
      mainLoop()
    } catch(err) {
      console.log(err + "\n");
      init()
    }

  });
}());

function mainLoop() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'what',
      message: 'What would you like to do? (ctrl+c to exit)',
      choices: [
        {name: '1. See info stored in keyFIle', value: 1},
        {name: '2. Add person to key file', value: 2},
        {name: '3. Remove someone from key file', value: 3},
        {name: '4. Change password of keyFile', value: 4},
        {name: '5. Make report of someone', value: 5},
      ]
    }
  ]).then(function (answers) {
    switch(answers.what){
    case 1:
      console.log('\nKeys File Info:\n-------------------------------------------');
      for (let prsn of keyManager.getKeys()){
        console.log(`${prsn.name}\t${prsn.api_key}`)
        console.log('-------------------------------------------');
      }
      console.log('\n');
      mainLoop()
      break;

    case 2:
      addPersonWrapper()
      break;

    case 3:
      removeSomeoneWrapper()
      break;

    case 4:
      changePassWrapper()
      break;

    case 5:
      makeReport()
      break;

    //default option is not needed since user cannot give us invalid input
    }

  });
}

function addPersonWrapper() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Name of the person you want to add:',
    },
    {
      type: 'input',
      name: 'api_key',
      message: 'Api key of this person:',
    }

  ]).then(function (answers) {
    keyManager.addKeys(answers.name, answers.api_key)
    mainLoop()
  });
}

function changePassWrapper() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'newPass',
      message: 'What is the new password you would like to use?',
    }
  ]).then(function (answers) {
    keyManager.changePassowrd(answers.newPass)
    mainLoop()
  });
}

function makeReport() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'whoReport',
      message: 'For who do you want to get the reports?',
      choices: keyManager.getKeys().map(el => {return {name: el.name, value: el.api_key}})
    }
  ]).then(function (answers) {
    //here run asanaFlow for 'whoReport' and make something with user's attention after that
    mainLoop()
  });
}

function removeSomeoneWrapper(){
  inquirer.prompt([
    {
      type: 'list',
      name: 'name',
      message: 'For who do you want to get the reports?',
      choices: keyManager.getKeys().map(el => {return {name: el.name, value: el.name}})
    }
  ]).then(function (answers) {
    keyManager.removeSomeone(answers.name)
    mainLoop()
  });
}
