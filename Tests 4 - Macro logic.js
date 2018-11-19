function testMacroLogic(test) {
  'use strict'
  
  test.log('Macro logic');
  
  test('copyWithoutDates', function(t) {
    arrayAWithDates = [ ['One', 'Two']
                      , [new Date('1 Jan 2018'), 44]
                      , [55, new Date('3 Jan 2018')]
                      , [new Date ('4 Jan 2018'), new Date('5 Jan 2018')]
                      ]
    arrayAWithNoDates = [ ['One', 'Two']
                      , ['', 44]
                      , [55, '']
                      , ['', '']
                      ]
    t.equal(arrayAWithNoDates, copyWithoutDates(arrayAWithDates), 'Should be able to copy a 2x2 array and drop dates');
  })

}
