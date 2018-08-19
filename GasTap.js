// Original at https://raw.githubusercontent.com/zixia/gast/master/src/gas-tap-lib.js
// from https://github.com/zixia/gast

var GasTap = (function () {
  'use strict'

  var VERSION = '0.2.1'
  /**
  *
  * GasT - Google Apps Script Testing-framework
  *
  * GasT is (almost) a TAP-compliant testing framework for Google Apps Script. 
  * It provides a simple way to verify that the GAS programs you write 
  * behave as expected.
  *
  * Github - https://github.com/zixia/gast
  * Test Anything Protocol - http://testanything.org/
  *
  * Issues: https://github.com/zixia/gast/issues
  * Author: Zhuohuan LI <zixia@zixia.net>
  * Date: 2015-11-05
  *
  */

  var EXCEPTION_SKIP = 'GasTapSkip'
  var EXCEPTION_PASS = 'GasTapPass'
  var EXCEPTION_FAIL = 'GasTapFail'
  
  var GasTap = function (options) {
    
    var totalSucc = 0
    var totalFail = 0
    var totalSkip = 0
    
    var t = {    
      counter: 0
      , succCounter: 0
      , failCounter: 0
      , skipCounter: 0
      , description: 'unknown description'
      
      , isTrue: isTrue
      , notTrue: notTrue
      
      , equal: deepEqual
      , notEqual: notDeepEqual
      
//      , deepEqual: deepEqual
//      , notDeepEqual: notDeepEqual
      
      , throws: throws
      , notThrow: notThrow

      , nan: nan
      , notNan: notNan
      
      , skip: skip
      , pass: pass
      , fail: fail
      
      , log: log
      
      , unflushedLog: ''
      
      , reset: function () { 
        this.succCounter = this.failCounter = this.skipCounter = 0
        this.description = 'unknown'
      }

    }
    
    // default output to gas logger.log
    var loggerFunc = function (msg) { Logger.log(msg) }
    
    if (options && options.logger) {
      loggerFunc = options.logger;
    }
    
    if (typeof loggerFunc != 'function') throw Error('options.logger must be a function to accept output parameter');
    
    println('TAP version GasTap v' + VERSION + '(adapted by Nik)')
  
    /***************************************************************
    *
    * Instance methods export 
    *
    ****************************************************************/
    test.end = finish
    test.log = log
    
    // The alias to test.end
    test.finish = test.end
    
    test.totalFailed= function() {return totalFail}
    test.totalSucceed= function() {return totalSucc}
    test.totalSkipped= function() {return totalSkip}
    
    return test
  

    /***************************************************************
    *
    * Instance methods implementions
    *
    ****************************************************************/
    function test(description, run) {  
    
      t.reset()

      t.description = description
      
      try {
      
        run(t)
      
      } catch ( e /* if e instanceof String */) {
        //      Logger.log('caught exception: ' + e)
        
        SKIP_RE = new RegExp(EXCEPTION_SKIP)
        PASS_RE = new RegExp(EXCEPTION_PASS)
        FAIL_RE = new RegExp(EXCEPTION_FAIL)
        
        switch (true) {
          case SKIP_RE.test(e):
          case PASS_RE.test(e):
          case FAIL_RE.test(e):
            break;
          default:
            if (e instanceof Error) Logger.log('Stack:\n' + e.stack)
            throw e
        }      
      } finally { 
        totalSucc += t.succCounter
        totalFail += t.failCounter
        totalSkip += t.skipCounter
        //      println('succCounter: %s, failCounter: %s, skipCounter: %s', t.succCounter, t.failCounter, t.skipCounter)
      }
    }
    
    // Log a message (using a format string and values) with a newline.
    
    function println() {
      var args = Array.prototype.slice.call(arguments)
      
      var message = Utilities.formatString.apply(null, args)
      flushln()
      loggerFunc(message)
    }

    // Log a message (using a format string and values) without a newline.
    // It will only appear in the log file when we do a flushln()
    
    function print() {
      var args = Array.prototype.slice.call(arguments)
      
      var message = Utilities.formatString.apply(null, args)
      t.unflushedLog += message
    }

    // Output unflushed log content followed by a newline
    
    function flushln() {
      if (t.unflushedLog) {
        loggerFunc(t.unflushedLog)
        t.unflushedLog = ''
      }
    }
    
    // Log a message
    
    function log(msg) {
      println(msg)
    }
    
    // Outputs a test result with some message
    
    function tapOutput(ok, msg) {
      ++t.counter
      if (ok) {
        print('.')
      } else {
        println('Fail'
              + ' ' + t.counter
              + ' - ' + msg
              + ' - ' + t.description
             )
      }
    }
    
    
    /**
     * Prints a total line to log output. For an example "3 tests, 0 failures"
     * 
     * @returns void
     */
    function finish () { 
      var totalNum = totalSucc + totalFail + totalSkip
      
      //    println("%s, %s, %s, %s", totalSucc, totalFail, totalSkip, t.counter)
      
      if (totalNum != (t.counter)) {
        throw Error('test counting error!')
      }
      
      var msg = Utilities.formatString('%s..%s'
                                       , Math.floor(totalNum)>0 ? 1 : 0
                                       , Math.floor(totalNum))
      println(msg)
      
      msg = Utilities.formatString('%s tests, %s failures', Math.floor(totalNum), Math.floor(totalFail))
      
      if (totalSkip>0) {
        msg += ', ' + Math.floor(totalSkip) + ' skipped'
      }
      
      println(msg) 
    }

    /***************************************************************
    *
    * T 's functions
    *
    ****************************************************************/
    
    function isTrue(value, msg) {
      if (value) {
        this.succCounter++;
        tapOutput(true, msg)
      } else {
        this.failCounter++;
        tapOutput(false, msg)
      }
    }
    
    function notTrue(value, msg) {
      if (!value) {
        this.succCounter++;
        tapOutput(true, msg)
      } else {
        this.failCounter++;
        tapOutput(false, msg)
      }
    }
    
//    function equal(v1, v2, msg) {
//      if (v1 == v2) {
//        this.succCounter++;
//        tapOutput(true, msg)
//      } else {
//        this.failCounter++;
//        var v1Pretty = JSON.stringify(v1)
//        var v2Pretty = JSON.stringify(v2)
//        var error = Utilities.formatString('%s not equal %s', v1Pretty, v2Pretty)
//        tapOutput(false, error + ' - ' + msg)
//      }
//    }
//    
//    function notEqual(v1, v2, msg) {
//      if (v1 != v2) {
//        this.succCounter++;
//        tapOutput(true, msg)
//      } else {
//        this.failCounter++;
//        var v1Pretty = JSON.stringify(v1)
//        var v2Pretty = JSON.stringify(v2)
//        var error = Utilities.formatString('%s equal %s', v1Pretty, v2Pretty)
//        tapOutput(false, error + ' - ' + msg)
//      }
//    }

    function deepEqual(v1, v2, msg) {
      
      var isDeepEqual = recursionDeepEqual(v1, v2)
      
      function recursionDeepEqual(rv1, rv2) {
        if (!(rv1 instanceof Object) || !(rv2 instanceof Object)) return rv1 == rv2
        
        if (Object.keys(rv1).length != Object.keys(rv2).length) return false
      
        for (var k in rv1) {
          if (!(k in rv2)
              || ((typeof rv1[k]) != (typeof rv2[k]))
          ) return false
        
          if (!recursionDeepEqual(rv1[k], rv2[k])) return false
        }
        
        return true
      }        
        
      if (isDeepEqual) {
        this.succCounter++;
        tapOutput(true, msg)
      } else {
        this.failCounter++;
        var v1Pretty = '' + JSON.stringify(v1)
        var v2Pretty = '' + JSON.stringify(v2)
        var error = Utilities.formatString('%s does not deepEqual %s', v1Pretty, v2Pretty)
        tapOutput(false, error + ' - ' + msg)
      }
    }
    
    function notDeepEqual(v1, v2, msg) {
      
      var isNotDeepEqual = recursionNotDeepEqual(v1, v2)
      
      function recursionNotDeepEqual(rv1, rv2) {
        if (!(rv1 instanceof Object) || !(rv2 instanceof Object)) return rv1 != rv2
        
        if (Object.keys(rv1).length != Object.keys(rv2).length) return true
      
        for (var k in rv1) {
          if (!(k in rv2)
              || ((typeof rv1[k]) != (typeof rv2[k]))
          ) return true
        
          if (recursionNotDeepEqual(rv1[k], rv2[k])) return true
        }
        
        return false
      }
      
      if (isNotDeepEqual) {
        this.succCounter++;
        tapOutput(true, msg)
      } else {
        this.failCounter++;
        var v1Pretty = '' + JSON.stringify(v1)
        var v2Pretty = '' + JSON.stringify(v2)
        var error = Utilities.formatString('%s does deepEqual %s', v1Pretty, v2Pretty)
        tapOutput(false, error + ' - ' + msg)
      }
    }

    function nan(v1, msg) {
      if (v1 !== v1) {
        this.succCounter++;
        tapOutput(true, msg)
      } else {
        this.failCounter++;
        var error = Utilities.formatString('%s not is NaN', v1);
        tapOutput(false, error + ' - ' + msg);
      }
    }

    function notNan(v1, msg) {
      if (!(v1 !== v1)) {
        this.succCounter++;
        tapOutput(true, msg)
      } else {
        this.failCounter++;
        var error = Utilities.formatString('%s is NaN', v1);
        tapOutput(false, error + ' - ' + msg);
      }
    }
    
    function throws(fn, msg) {
      try {
        fn()
        
        this.failCounter++;
        tapOutput(false, 'exception wanted - ' + msg)
      } catch (e) {
        this.succCounter++;
        tapOutput(true, msg)
      }
    }
    
    function notThrow(fn, msg) {
      try {
        fn()
        
        this.succCounter++;
        tapOutput(true, msg)
      } catch (e) {
        this.failCounter++;
        tapOutput(false, 'unexpected exception:' + e.message + ' - ' + msg)
      }
    }
    
    function skip(msg) {
      this.skipCounter++;
      tapOutput(true, msg + ' # SKIP')
      throw EXCEPTION_SKIP
    }
    
    function pass(msg) {
      this.succCounter++;
      tapOutput(true, msg + ' # PASS')
      throw EXCEPTION_PASS
    }
    
    function fail(msg) {
      this.failCounter++;
      tapOutput(false, msg + ' # FAIL')
      throw EXCEPTION_FAIL
    }
    
  }

  
  return GasTap
  
  
}())
