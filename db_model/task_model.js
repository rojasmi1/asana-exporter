const MongoClient = require('mongodb')

const url = 'mongodb://asana-tracking:AsanaTracker.2017@ds119608.mlab.com:19608/asana-time-tracker'

module.exports.getTaskDuration = function(taskId){

  return new Promise(function(resolve,reject){
    MongoClient.connect(url, function(err,db){
      let taskEntryCol = db.collection('task-entry')
      taskEntryCol.findOne({task_id:taskId.toString()},function(err,item){
        if(err){
          reject(err)
        }else{
          resolve(item?item.duration:"0")
        }
      })
    })
  })

}
