module.exports = function (access_key, fromDate,callback) {

  const tasksUtils = require('./tasksUtils')
  const task_model = require('./db_model/task_model')
  const asana = require('asana')
  const csvWriter = require('csv-write-stream')
  const fs = require('fs')

  // Using the API key for basic authentication. This is reasonable to get
  // started with, but Oauth is more secure and provides more features.
  let client = asana.Client.create()
    .useBasicAuth(access_key)


  // Get all users
  // Return promise to calling function, next step will be defined there
  return new Promise((resolve)=>{

    new Promise((res) => {

    // Get first batch of users
      client.users.me()
      .then(function (user) {
        let userId = user.id
        console.log(`\n--- Getting Asana info: User : ${user.name}.`)
          // The user's "default" workspace is the first one in the list, though
          // any user can have multiple workspaces so you can't always assume this
          // is the one you want to work with.
        let workspaceId = user.workspaces[0].id
        console.log(`Workspace: ${user.workspaces[0].name}.`)

        return client.tasks.findAll({
          assignee: userId,
          workspace: workspaceId,
          completed_since: fromDate, // specified in the menu, recieved as a parameter on module initialization
          opt_fields: 'id,name,assignee.name,completed_at',
          limit: 100
        })
      })
      .then(function (response) {

        // finish fetching data => get all remaining tasks
        response.fetch()

          // restPages Includes the initial 100 value we got originally
          .then(restPages => {
            console.log(`Fetching data for ${restPages[0].assignee.name}`)
            res(restPages) // once we have all data ready we resolve current promise
          })

      })

    }).then(function (rawtasks) {

      let formatedTasks = tasksUtils.formatTasks(rawtasks,fromDate)

    //Write entries to CSV File
    // TODO: Probably there is a much more elegant way of doing this
      let writer
      try {
        console.log(`Writing data to 'Monthly Report.csv' file.`)
        fs.accessSync('Monthly Report.csv', fs.constants.R_OK | fs.constants.W_OK) // if file doesn't exists then throw error
        writer = csvWriter({sendHeaders: false}) // file exists, don't write headers to file again

      } catch (err) {
        writer = csvWriter({sendHeaders: true}) // file doesn't exist, write header files
      }

      writer.pipe(fs.createWriteStream('Monthly Report.csv', {
      // Append to file if it exists or create new one in the opposite case (in case we are doing a report for various people)
        flags: 'a'
      }))
      let counter = 0
      for (let task of formatedTasks) {
        task_model.getTaskDuration(task.id,access_key).then(function(duration){
          task.duration = duration
          writer.write(task)
          if(++counter === formatedTasks.length){
            writer.end()
            console.log(`${formatedTasks.length} tasks written to "Monthly Report.csv" file.`)
            resolve(counter)
          }
        })
      }
    })
  })

}
