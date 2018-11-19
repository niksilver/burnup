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

    arrayBWithDates = [ 'One', new Date('3 Apr 2018'), 33 ]
    arrayBWithNoDates = [[ 'One', '', 33 ]]
    t.equal(arrayBWithNoDates, copyWithoutDates(arrayBWithDates), 'Should be able to copy a 1D array dropping dates, and making it 2x2')

    basicValueC = 42;
    t.equal([[basicValueC]], copyWithoutDates(basicValueC), 'A non-date value should become the same in a 2D array')

    basicValueD = new Date('5 Nov 2018');
    t.equal([['']], copyWithoutDates(basicValueD), 'A date value should become a 2D array with just an empty string in it')


  })

}
