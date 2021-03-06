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
    //check that pass makes sense
    try {
      if (answers.password === '') throw new SyntaxError("Password cannot be an empty string!")

      keyManager = keyManager(answers.password)  //it would be nice if we could cache password for future runs

      keyManager.getKeys() // will throw error is password is incorrect
      mainLoop()
    } catch(err) {
      console.log(err + "\n")
      init()
    }

  })
}())

function mainLoop() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'what',
      message: 'What would you like to do? (ctrl+c to exit)',
      choices: [
        {name: '1. See info stored in keyFile', value: 1},
        {name: '2. Add person to keyFile', value: 2},
        {name: '3. Remove someone from keyFile', value: 3},
        {name: '4. Change password of keyFile', value: 4},
        {name: '5. Make report of someone', value: 5},
      ]
    }
  ]).then(function (answers) {
    switch(answers.what){
    case 1:
      console.log('\nKeys File Info:\n-------------------------------------------')
      for (let prsn of keyManager.getKeys()){
        console.log(`${prsn.name}\t${prsn.api_key}`)
        console.log('-------------------------------------------')
      }
      console.log('\n')
      mainLoop()
      break

    case 2:
      addPersonWrapper()
      break

    case 3:
      removeSomeoneWrapper()
      break

    case 4:
      changePassWrapper()
      break

    case 5:
      makeReport()
      break

    //default option is not needed since user cannot give us invalid input
    }

  })
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
  })
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
  })
}

function makeReport() {
  let dt = new Date()
  inquirer.prompt([
    {
      type: 'checkbox',
      name: 'who',
      message: 'For who do you want to get the reports?',
      choices: keyManager.getKeys().map(el => {return {name: el.name, value: el.api_key, checked: true}})
    },
    {
      type: 'input',
      name: 'year',
      message: 'For what year would you like to generate the report?',
      default: (new Date()).getUTCFullYear()  // By Default is this year
    },
    {
      type: 'input',
      name: 'month',
      message: 'For what month would you like to generate the report?',
      default: dt.getUTCMonth() === 0 ? 12 : dt.getUTCMonth()  // By default is last month
    }
  ]).then(function (answers) {

    answers.month = answers.month < 10 ? "0" + answers.month : answers.month  //add padding if needed

    let asanaFlow = require('./asanaFlow')

    try {
      (require("fs")).unlinkSync("Monthly Report.csv")
    } catch(err){
      console.log(err)
    }

    let promises = []

    for (let us of answers.who) {
      promises.push(asanaFlow(
        us,  // Access key
        `${answers.year}-${answers.month}-01T01:01:01.001Z`,mainLoop) // Date from which to get tasks
      )
    }

    Promise.all(promises).then(()=>{
      console.log(`Please find the report file in the root folder of the Asana Exporter project.`)
      mainLoop()
    })

  })
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
  })
}
