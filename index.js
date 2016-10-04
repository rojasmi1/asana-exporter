'use strict'
const asana = require('asana')
const util = require('util')
const csvWriter = require('csv-write-stream')
const fs = require('fs')

// Using the API key for basic authentication. This is reasonable to get
// started with, but Oauth is more secure and provides more features.
let client = asana.Client.create().useBasicAuth("0/5e103cf78174ce38352e87a2b1c01c7e")


client.users.me()
  .then(function(user) {
    let userId = user.id
    console.log(`User ID: ${userId}`)
    // The user's "default" workspace is the first one in the list, though
    // any user can have multiple workspaces so you can't always assume this
    // is the one you want to work with.
    let workspaceId = user.workspaces[0].id
    console.log(`Workspace ID: ${workspaceId}`)
    return client.tasks.findAll({
      assignee: userId,
      workspace: workspaceId,
      completed_since: '2016-09-01T01:01:01.001Z',
      opt_fields: 'id,name,completed,completed_at,due_at,due_on,notes'
    })
  })
  .then(function(response) {
    return response.data;
  })
  .filter(function(task) {
    return task.completed_at !== '' && task.completed_at !== null
  })
  .then(function(list) {
    //Write entries to CSV File
    let writer = csvWriter()
    writer.pipe(fs.createWriteStream('Monthly Report.csv'))
    for (let task of list) {
      writer.write(task)
    }
    writer.end()
  })
