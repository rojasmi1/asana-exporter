const {TASKS_TYPES} = require('./conf/consts')


const getTaskType = (taskName) =>{
  for (let task_type of TASKS_TYPES) {
    for (let keyword of task_type.keywords) {
      if(taskName.includes(keyword))
        return task_type.name
    }
  }
}

module.exports.formatTasks = (rawtasks,fromDate) => {
  console.log('Formatting raw data.')

  let ftasks = rawtasks.map(el => { // map the project_id attribute of all tasks and save in 'formatted tasks'
    el.project = el.projects[0] ? el.projects[0].name.toString() : "" // As far as we know a task is only associated with one project
    delete el.projects

    //Set task task type
    el.task_type = getTaskType(el.name)

    el.assignee = el.assignee.name // we are only interested in the Assignee's name. We don't check if this exists since one of our filters for getting the task is the assignee
    return el
  })

  // Filter only tasks that have a "completed at" value and that the "completed_at" month is the same
  // as the month we are requesting (There seems to be no way to filter these out directly in the
  // request to the server)
  let completedTasks = []

  ftasks.forEach(function(task){
    if(task.completed_at !== '' && task.completed_at !== null && (new Date(task.completed_at)).getUTCMonth() === (new Date(fromDate)).getUTCMonth()){
      completedTasks.push(task)
    }
  })

  return completedTasks
}
