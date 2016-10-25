module.exports = function (api_key, callback) {

  const asana = require('asana')
  const csvWriter = require('csv-write-stream')
  const fs = require('fs')

  // Using the API key for basic authentication. This is reasonable to get
  // started with, but Oauth is more secure and provides more features.
  let client = asana.Client.create()
    .useBasicAuth(api_key)


  client.users.me()
    .then(function (user) {
      let userId = user.id
      console.log(`\n--- Getting Asana info:\nUser ID: ${userId}`)
        // The user's "default" workspace is the first one in the list, though
        // any user can have multiple workspaces so you can't always assume this
        // is the one you want to work with.
      let workspaceId = user.workspaces[0].id
      console.log(`Workspace ID: ${workspaceId}`)

      let dt = new Date()
      return client.tasks.findAll({
        assignee: userId,
        workspace: workspaceId,
        completed_since: `${dt.getUTCFullYear()}-${dt.getUTCMonth()+1}-01T01:01:01.001Z`, // always get from begging of this month
        opt_fields: 'id,name,projects,completed,completed_at,due_at,due_on,notes'
      })
    })
    .then(function (response) {
      console.log('Data gotten, formatting..');
      return response.data.map( el => {  // Extract only response's data and correctly format 'project' property
        el.project = JSON.stringify(el.projects[0].id) // As far as we know a task is only associated with one project
        delete el.projects
        return el
      });
    })
    .filter(function (task) {
      return task.completed_at !== '' && task.completed_at !== null
    })
    .then(function (list) {
      //Write entries to CSV File
      let writer = csvWriter()
      writer.pipe(fs.createWriteStream('Monthly Report.csv'))
      for (let task of list) {
        writer.write(task)
      }
      writer.end()
      console.log('Data written to "Monthly Report.csv" file in root of project :)\n');
      callback()
    })
}
