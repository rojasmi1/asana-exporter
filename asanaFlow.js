module.exports = function (access_key, fromDate) {

  const asana = require('asana')
  const csvWriter = require('csv-write-stream')
  const fs = require('fs')

  // Using the API key for basic authentication. This is reasonable to get
  // started with, but Oauth is more secure and provides more features.
  let client = asana.Client.create()
    .useBasicAuth(access_key)


  // Get all users
  // Return promise to calling function, next step will be defined there
  return new Promise((res) => {

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
          opt_fields: 'id,name,assignee.name,projects.name,completed_at,notes',
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
    console.log('Formatting raw data.')

    let ftasks = rawtasks.map(el => { // map the project_id attribute of all tasks and save in 'formatted tasks'
      el.project = el.projects[0] ? el.projects[0].name.toString() : "" // As far as we know a task is only associated with one project
      delete el.projects

      el.assignee = el.assignee.name // we are only interested in the Assignee's name. We don't check if this exists since one of our filters for getting the task is the assignee
      return el
    })

    // Filter only tasks that have a "completed at" value and that the "completed_at" month is the same
    // as the month we are requesting (There seems to be no way to filter these out directly in the
    // request to the server)
    ftasks = ftasks.filter(function (task) {
      return task.completed_at !== '' &&
        task.completed_at !== null && (new Date(task.completed_at)).getUTCMonth() === (new Date(fromDate)).getUTCMonth()
    })

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

    for (let task of ftasks) {
      writer.write(task)
    }

    writer.end()
    console.log(`${ftasks.length} tasks written to "Monthly Report.csv" file.`)

  })

}
