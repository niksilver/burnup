/**
 *
 * Run this script to run all the tests
 * then hti Ctrl + Enter to view the test results in the log
 *
 */
function gastTestRunner() {
  'use strict'
  
 /**
  *
  * GasT - Google Apps Script Testing-framework
  * 
  * Adapted from...
  *
  * Github - https://github.com/zixia/gast
  *
  */
    
  var test = new GasTap()

  testBasics(test)
  testTransformations(test)
  testBusinessLogic(test)

  test.finish()

}
