function testBusinessLogic(test) {
  'use strict'
  
  test.log('Business logic')
  
  test('isValid', function(t) {
    rangeA = [ ['Story ID', 'Valid from']
             , ['US-1234',  new Date('17 Mar 2013')]
             , ['US-1234',  new Date('9 Dec 2013')]
             , ['US-9999',  new Date('5 Oct 2014')]
             , ['US-1234',  new Date('1 Jun 2013')]
             ]
    result = validTo("Story ID", "Valid from", rangeA)
    
    t.equal(new Date('31 May 2013'), result[0], 'First line should be valid to the day before the last entry')
    t.equal(new Date('31 Dec 2099'), result[1], 'Second line should be valid into the far future')
    t.equal(new Date('31 Dec 2099'), result[2], 'Third line should be value into the far future')
    t.equal(new Date( '8 Dec 2013'), result[3], 'Fourth line should be valid to the day before the second entry')

    // Now test it if there's a blank line in the range...
    
    rangeB = [ ['Story ID', 'Valid from']
             , ['US-1234',  new Date('17 Mar 2013')]
             , ['',         '']
             , ['US-9999',  new Date('5 Oct 2014')]
             , ['US-1234',  new Date('1 Jun 2013')]
             ]
    result = validTo("Story ID", "Valid from", rangeB)

    t.equal(new Date('31 May 2013'), result[0], 'First line (with a blank) should be valid to the day before the last entry')
    t.equal('',                      result[1], 'Second line (with a blank) should be a blank')
    t.equal(new Date('31 Dec 2099'), result[2], 'Third line (with a blank) should be value into the far future')
    t.equal(new Date( '8 Dec 2013'), result[3], 'Fourth line (with a blank) should be valid to the day before the second entry')
    
    rangeC = [ ['Story ID', 'Valid from']
             , ['US-1234',  new Date('17 Mar 2013')]
             , ['US-1234',  'Hello!']
             , ['US-9999',  new Date('5 Oct 2014')]
             , ['US-1234',  new Date('1 Jun 2013')]
             ]
    
    t.throws(function(){ validTo("Story ID", "Valid from", rangeC) }
             , 'Should error on valid ID but non-date "Valid from" date')

    rangeD = [ ['Story ID', 'Valid from']
             , ['US-1234',  new Date('17 Mar 2013')]
             , ['',         new Date('3 Dec 2013')]
             , ['US-9999',  new Date('5 Oct 2014')]
             , ['US-1234',  new Date('1 Jun 2013')]
             ]
    
    t.throws(function(){ validTo("Story ID", "Valid from", rangeD) }
             , 'Should error on missing ID but valid date')
    
    rangeE = [ ['Story ID', 'Valid from']
             , ['US-1234',  new Date('17 Mar 2013')]
             , ['US-1234',  '']
             , ['US-9999',  new Date('5 Oct 2014')]
             , ['US-1234',  new Date('1 Jun 2013')]
             ]
    
    t.throws(function(){ validTo("Story ID", "Valid from", rangeE) }
             , 'Should errors on valid ID but no date')

    rangeF = [ ['Story ID', 'Valid from']
             , ['US-1234',  new Date('17 Mar 2013')]
             , ['US-1234',  new Date('3 Dec 2013')]
             , ['US-9999',  new Date('5 Oct 2014')]
             , ['US-1234',  new Date('3 Dec 2013')]
             ]
    
    t.throws(function(){ validTo("Story ID", "Valid from", rangeF) }
             , 'Should error when an ID has the same date twice')

  })
  
  test('sumValid (happy path)', function(t){
    range = [ ['Item',             'Valid from', 'Var A']
            , ['Alice',  new Date('1 Jan 2014'),  3]
            , ['Alice',  new Date('1 Feb 2014'),  5]
            , ['Alice',  new Date('15 Feb 2014'), 7]
            , ['David',  new Date('1 Jan 2014'),  2]
            , ['Emily',  new Date('1 Jan 2014'),  3]
            , ['Frank',  new Date('1 Jan 2014'),  4]
            , ['Gertie', new Date('1 Jan 2014'),  5]
            ]
    idates = [ [new Date('1 Jan 2014')]
             , [new Date('1 Feb 2014')]
             , [new Date('15 Feb 2014')]
             ]
    
    result = sumValid(idates, range, "Item", "Valid from", "Var A")
    t.equal(17, result[0], "Should work for early date")
    t.equal(19, result[1], "Should work for middle date")
    t.equal(21, result[2], "Should work for high end date")
  })
  
  test('sumValid (interpret text and blanks as zero)', function(t){
    range = [ ['Item',              'Valid from', 'Var A']
            , ['Alice',    new Date('1 Jan 2014'),  3]
            , ['Alice',    new Date('1 Feb 2014'),  'Text here!']
            , ['Bertie',   new Date('1 Jan 2014'),  '']
            , ['Clarence', new Date('1 Jan 2014'),  2]
            ]
    idates = [ [new Date('1 Jan 2014')]
             , [new Date('1 Feb 2014')]
             , [new Date('15 Feb 2014')]
             ]
    
    result = sumValid(idates, range, "Item", "Valid from", "Var A")
    t.equal(5, result[0], "Should work for early date, including blank")
    t.equal(2, result[1], "Should interpret text as zero in middle date")
    t.equal(2, result[2], "Should work for high end date")
  })

  test('sumValid (single date)', function(t){
    range = [ ['Item',             'Valid from', 'Var A']
            , ['Alice',  new Date('1 Jan 2014'),  3]
            , ['Alice',  new Date('1 Feb 2014'),  5]
            , ['Alice',  new Date('15 Feb 2014'), 7]
            , ['David',  new Date('1 Jan 2014'),  2]
            , ['Emily',  new Date('1 Jan 2014'),  3]
            , ['Frank',  new Date('1 Jan 2014'),  4]
            , ['Gertie', new Date('1 Jan 2014'),  5]
            ]
    
    result = sumValid(new Date('1 Jan 2014'), range, "Item", "Valid from", "Var A")
    t.equal(17, result[0], "Should work with single date")
  })

  test('sumValid (more than one data col)', function(t){
    range = [ ['Item',             'Valid from', 'Var A', 'Var B']
            , ['Alice',  new Date('1 Jan 2014'),  3,       99]
            , ['Alice',  new Date('1 Feb 2014'),  5,       99]
            , ['Alice',  new Date('15 Feb 2014'), 7,       99]
            , ['David',  new Date('1 Jan 2014'),  2]
            , ['Emily',  new Date('1 Jan 2014'),  3]
            , ['Frank',  new Date('1 Jan 2014'),  4]
            , ['Gertie', new Date('1 Jan 2014'),  5]
            ]
    
    resultFn = function(){ sumValid(new Date('1 Jan 2014'), range, "Item", "Valid from", [["Var A", "Var B"]]) }
    t.throws(resultFn, "Should error with more than one data column")
  })
  
  test('sumValid (blanks)', function(t){
    range = [ ['Item',             'Valid from', 'Var A']
            , ['Alice', new Date('1 Jan 2014'),   3]
            , ['Alice', new Date('15 Feb 2014'),  7]
            , ['',      '',                       2]
            , ['Emily', new Date('1 Jan 2014'),   3]
            , ['Frank', new Date('1 Jan 2014'),   4]
            ]
    
    result = sumValid(new Date('1 Jan 2014'), range, "Item", "Valid from", "Var A")
    t.equal(10, result[0], "Should ignore line with missing ID and no 'Valid from' date")
  })
  
  test('sumValid (varying date col name)', function(t){
    range = [ ['Item',            'Changed', 'Var A']
            , ['Alice', new Date('1 Jan 2014'),  3]
            , ['Alice', new Date('15 Feb 2014'), 7]
            , ['David', new Date('1 Jan 2014'),  2]
            , ['Emily', new Date('1 Jan 2014'),  3]
            , ['Frank', new Date('1 Jan 2014'),  4]
            ]
    
    result = sumValid(new Date('1 Jan 2014'), range, "Item", "Changed", "Var A")
    t.equal(12, result[0], "Should work if we vary the 'Valid from' column name")
  })

  test('sumValid (bad idates data)', function(t){
    range = [ ['Item',            'Changed', 'Var A']
            , ['Alice', new Date('1 Jan 2014'),  3]
            , ['Alice', new Date('15 Feb 2014'), 7]
            , ['David', new Date('1 Jan 2014'),  2]
            , ['Emily', new Date('1 Jan 2014'),  3]
            , ['Frank', new Date('1 Jan 2014'),  4]
            ]
    
    resultFn = function(){ sumValid('Not a date!', range, "Item", "Valid from", 'Var A') }
    t.throws(resultFn, "Should error when date range is a basic value that's not a date")
    
    idates = [ [new Date('1 Jan 2014')]
             , ['Not a date!']
             ]
    
    resultFn = function(){ sumValid(idates, range, "Item", "Valid from", 'Var A') }
    t.throws(resultFn, "Should error when date range contains a non-date")    
  })
  
  test('getValid (happy path)', function(t){
    range = [ ['Item',            'Valid from',  'ShowMe']
            , ['Alice', new Date('1 Jan 2014'),  'AA']
            , ['Alice', new Date('1 Feb 2014'),  'BB']
            , ['Alice', new Date('15 Feb 2014'), 'CC']
            , ['David', new Date('1 Jan 2014'),  'DD']
            , ['Emily', new Date('1 Jan 2014'),  'EE']
            ]
    
    result = getValid(new Date('2 Jan 2014'), range, "Item", "Valid from", "ShowMe")
    t.equal('AA', result[0], "Should work for 1st row")
    t.equal('DD', result[1], "Should work for 2nd row")
    t.equal('EE', result[2], "Should work for 3rd row")
  })
  
  test('getValid (should ignore linkes with missing ID and no Valid From)', function(t){
    range = [ ['Item',            'Valid from',  'ShowMe']
            , ['Alice', new Date('1 Jan 2014'),  'AA']
            , ['',                          '',  '']
            , ['Alice', new Date('15 Feb 2014'), 'CC']
            , ['David', new Date('1 Jan 2014'),  'DD']
            , ['Emily', new Date('1 Jan 2014'),  'EE']
            ]
    
    result = getValid(new Date('2 Jan 2014'), range, "Item", "Valid from", "ShowMe")
    t.equal('AA', result[0], "Should work for 1st row")
    t.equal('DD', result[1], "Should work for 2nd row")
    t.equal('EE', result[2], "Should work for 3rd row")
  })
  
  test('getValid (errors)', function(t){
    range = [ ['Item',            'Valid from',  'ShowMe']
            , ['Alice', new Date('1 Jan 2014'),  'AA']
            , ['Alice', new Date('1 Feb 2014'),  'BB']
            , ['Alice', new Date('15 Feb 2014'), 'CC']
            , ['David', new Date('1 Jan 2014'),  'DD']
            , ['Emily', new Date('1 Jan 2014'),  'EE']
            ]
    
    resultFn = function(){ getValid(new Date('2 Jan 2014'), range, "Item", "Valid from", "ShowMx") }
    t.throws(resultFn, "Should error if named column does not exist")
    
    resultFn = function(){ getValid('Not a date!', range, "Item", "Valid from", "ShowMe") }
    t.throws(resultFn, "Should error if given date is not a date")
    
    resultFn = function(){ getValid(new Date('2 Jan 2014'), range, "Item", "Valid from") }
    t.throws(resultFn, "Should error if too few parameters")
    
    resultFn = function(){ getValid(new Date('2 Jan 2014'), 'Not an array!', "Item", "Valid from", "ShowMe") }
    t.throws(resultFn, "Should error if second argument is not an array")
  })
  
  test('filterValid (happy path)', function(t){
    range = [ ['Item',               'Valid from', 'Token', 'ShowMe']
            , ['Alice',    new Date('1 Jan 2014'), 'X',     'AA']
            , ['Alice',    new Date('1 Feb 2014'), 'Y',     'BB']
            , ['Alice',   new Date('15 Feb 2014'), 'X',     'CC']
            , ['David',    new Date('1 Jan 2014'), 'Y',     'DD']
            , ['Emily',    new Date('1 Jan 2014'), 'X',     'EE']
            , ['Freddie', new Date('10 Feb 2014'), 'X',     'FF']
            ]

    result = filterValid(new Date('2 Jan 2014'), range, "Item", "Valid from", "ShowMe", "Token", "X")
    
    t.equal('AA', result[0], "Should work for date in range (first element)")
    t.equal('EE', result[1], "Should work for date in range (second element)")
    t.equal(2, result.length, "Should only return two results")

    result = filterValid(new Date('10 Feb 2014'), range, "Item", "Valid from", "ShowMe", "Token", "X")
    
    t.equal('EE', result[0], "Should work for date in range (first element) if matched value has changed")
    t.equal('FF', result[1], "Should work for date in range (second element) if matched value has changed")
    t.equal(2, result.length, "Should only return two results if matched value has changed")
  })
  
  test('filterValid (errors)', function(t){
    range = [ ['Item',               'Valid from', 'Token', 'ShowMe']
            , ['Alice',    new Date('1 Jan 2014'), 'X',     'AA']
            , ['Alice',    new Date('1 Feb 2014'), 'Y',     'BB']
            , ['Alice',   new Date('15 Feb 2014'), 'X',     'CC']
            , ['David',    new Date('1 Jan 2014'), 'Y',     'DD']
            , ['Emily',    new Date('1 Jan 2014'), 'X',     'EE']
            , ['Freddie', new Date('10 Feb 2014'), 'X',     'FF']
            ]

    resultFn = function(){ filterValid(new Date('2 Jan 2014'), range, "Item", "Valid from", "ShowMe", "Token") }
    t.throws(resultFn, "Should error if too few parameters")

    resultFn = function(){ filterValid(new Date('2 Jan 2014'), 'Not an array!', "Item", "Valid from", "ShowMe", "Token") }
    t.throws(resultFn, "Should error if story arg is not an array")

    resultFn = function(){ filterValid(new Date('2 Jan 2014'), range, "xxx", "Valid from", "ShowMe", "Token", "X") }
    t.throws(resultFn, "Should error if colId not found")

    resultFn = function(){ filterValid(new Date('2 Jan 2014'), range, "Item", "Valid from", "ShowMe", "Token", [99, 98]) }
    t.throws(resultFn, "Should error if conditional value is not a basic value")
  })

}
