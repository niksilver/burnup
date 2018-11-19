function testBasics(test) {
  'use strict'
  
  test.log('Basics');
  
  test('isArray', function(t) {
    t.notTrue(isArray(1), "1 is not a spreadsheet array")
    t.isTrue(isArray( [["one", "two"],["three","four"]] ), "A 2x2 is an array" )
    t.notTrue(isArray("Hello"), "False for a string")
  })
  
  test('isString', function(t) {
    t.isTrue( isString("Hello"), "A string is a string")
    t.notTrue( isString(33), "A number isn't a string")
    t.notTrue( isString(new Date(2014, 1, 28)), "A date isn't a string")
    t.notTrue( isString(true), "Boolean true isn't a string")
    t.notTrue( isString(false), "Boolean false isn't a string")
    t.notTrue( isString( [["one", "two"],["three","four"]] ), "A 2x2 is isn't a string" )
  })
  
  test('isBoolean', function(t) {
    t.isTrue( isBoolean(true), "true is a Boolean")
    t.isTrue( isBoolean(false), "false is a Boolean")
    t.notTrue( isBoolean("Hello"), "A string isn't a Boolean")
    t.notTrue( isBoolean(33), "A number isn't a Boolean")
    t.notTrue( isBoolean(new Date(2014, 1, 28)), "A date isn't a Boolean")
    t.notTrue( isBoolean( [["one", "two"],["three","four"]] ), "A 2x2 is isn't a Boolean" )
  })
  
  test('isDate', function(t) {
    t.isTrue( isDate(new Date(2014, 1, 28)), "A date is a date")
    t.notTrue( isDate("Hello"), "A string isn't a date")
    t.notTrue( isDate(33), "A number isn't a date")
    t.notTrue( isDate(true), "Boolean true isn't a date")
    t.notTrue( isDate(false), "Boolean false isn't a date")
    t.notTrue( isDate( [["one", "two"],["three","four"]] ), "A 2x2 is isn't a date" )
  })
  
  test('indexOfColumn', function(t) {
    range = [ ["ID", "Description", "Cost"]
            , [34, "Peanuts", 3.47]
            , [45, "Cucumber", 1.24]
            ]
    t.equal(0, indexOfColumn("ID", range), "Column index of ID is 0")
    t.equal(1, indexOfColumn("Description", range), "Column index of Description is 1")
    t.throws( function(){ indexOfColumn(666, range) }, "Should error if 1st arg is a number")
    t.throws( function(){ indexOfColumn("ID", "Not an array") }, "Should error if 2nd arg not an array")
  })
  
  test('isBasicType', function(t) {
    t.isTrue( isBasicType("Hello"), "A string is a basic type")
    t.isTrue( isBasicType(33), "A number is a basic type")
    t.isTrue( isBasicType(true), "A Boolean is a basic type")
    t.isTrue( isBasicType(new Date(2014, 1, 28)), "A date is a basic type")
    t.notTrue( isBasicType( [["one", "two"],["three","four"]] ), "A 2x2 is isn't a basic type" )
  })
  
  test('isColumn', function(t) {
    horizontalArray = [[3,4,"five",6]]
    verticalArray = [[3],[4],["five"],[6]]
    twoByTwoArray = [[3, 4], ["five",6]]
    
    t.notTrue(isColumn("hello"), "A string is not a column")
    t.notTrue(isColumn(34), "A number is not a column")
    t.notTrue(isColumn(horizontalArray), "A horizontal array is not a column")
    t.isTrue(isColumn(verticalArray), "A vertical array is a column")
    t.notTrue(isColumn(twoByTwoArray), "A 2x2 array is not a column")
  })
  
  test('isBetween', function(t) {
    var _1_Jan_2014 = new Date(2014, 0, 1)
    var _10_Jan_2014 = new Date(2014, 0, 10)
    var _16_Jan_2014 = new Date(2014, 0, 16)
    var _24_Jan_2014 = new Date(2014, 0, 24)
    
    t.isTrue( isBetween(_10_Jan_2014, _1_Jan_2014, _16_Jan_2014), 'Should be true if date between limits')
    t.notTrue( isBetween(_1_Jan_2014, _10_Jan_2014, _16_Jan_2014), 'Should be false if date below limits')
    t.isTrue( isBetween(_1_Jan_2014, _1_Jan_2014, _16_Jan_2014), 'Should be true if date equals lower limit')
    t.notTrue( isBetween(_16_Jan_2014, _1_Jan_2014, _10_Jan_2014), 'Should be false if date above limits')
    t.isTrue( isBetween(_10_Jan_2014, _1_Jan_2014, _10_Jan_2014), 'Should be true if date equals upper limit')
    t.throws(function(){ isBetween('hello', _1_Jan_2014, _10_Jan_2014) }, 'Should error if date is not a date')
  })
  
  test('assertAllDates', function(t) {
    t.isTrue( assertAllDates(new Date('4 Jul 2018')), 'Should be true for a single date')
    t.throws( function(){ assertAllDates('Hello!') }, 'Should error for a single non-date')
    t.throws( function(){ assertAllDates('') }, 'Should error for a single blank')
    
    rangeA = [ [new Date('1 Jan 2016'), new Date('2 Jan 2016')]
             , [new Date('1 Feb 2016'), new Date('2 Feb 2016')]
             , [new Date('1 Mar 2016'), new Date('2 Mar 2016')]
             ]
    
    t.isTrue(assertAllDates(rangeA), 'Should be true for range of all dates')
    
    rangeB = [ [new Date('1 Jan 2016'), new Date('2 Jan 2016')]
             , [new Date('1 Feb 2016'), new Date('2 Feb 2016')]
             , [new Date('1 Mar 2016'), 'Not a date!']
             ]
    
    t.throws( function(){ assertAllDates(rangeB) }, 'Should error for a range with one non-date')
  })

}
