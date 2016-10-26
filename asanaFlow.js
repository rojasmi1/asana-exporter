module.exports = function (access_key, fromDate, callback) {

  const asana = require('asana')
  const csvWriter = require('csv-write-stream')
  const fs = require('fs')

  // Using the API key for basic authentication. This is reasonable to get
  // started with, but Oauth is more secure and provides more features.
  let client = asana.Client.create()
    .useBasicAuth(access_key)


  // Get all users
  let allDataProm = new Promise((res) => {

    // Get first batch of users
    client.users.me()
      .then(function (user) {
        let userId = user.id
        console.log(`\n--- Getting Asana info:\nUser ID: ${userId}`)
          // The user's "default" workspace is the first one in the list, though
          // any user can have multiple workspaces so you can't always assume this
          // is the one you want to work with.
        let workspaceId = user.workspaces[0].id
        console.log(`Workspace ID: ${workspaceId}`)

        return client.tasks.findAll({
          assignee: userId,
          workspace: workspaceId,
          completed_since: fromDate, // specified in the menu, recieved as a parameter on module initialization
          opt_fields: 'id,name,projects,completed,completed_at,due_at,due_on,notes',
          limit: 100
        })
      })
      .then(function (response) {

        // finish fetching data => get all remaining tasks
        response.fetch()

          // restPages Includes the initial 100 value we got originally
          .then(restPages => {
            res(restPages) // once we have all data ready we resolve current promise
          })

      })

  })

  allDataProm.then(function (rawtasks) {
    console.log('Data gotten, formatting..')

    let ftasks = rawtasks.map(el => { // map the project_id attribute of all tasks and save in 'formatted tasks'
      el.project_id = el.projects[0] ? el.projects[0].id.toString() : "" // As far as we know a task is only associated with one project
      delete el.projects
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
    let writer = csvWriter()
    writer.pipe(fs.createWriteStream('Monthly Report.csv'))
    for (let task of ftasks) {
      writer.write(task)
    }

    writer.end()
    console.log(`${ftasks.length} tasks written to "Monthly Report.csv" file in root of project :)\n`);
    callback() // return control to calling function ..

  })
}
