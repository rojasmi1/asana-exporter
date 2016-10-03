'use strict'
var Asana = require('asana')
var util = require('util')

// Using the API key for basic authentication. This is reasonable to get
// started with, but Oauth is more secure and provides more features.
var client = Asana.Client.create().useBasicAuth("0/5e103cf78174ce38352e87a2b1c01c7e");

//TODO: Add logic to query the tasks completed during the current month 
