function testTransformations(test) {
  'use strict'
  
  test.log('Transformations')
  
  test('make2DArray', function(t) {
    twoDArray = [[3, 4], ["five",6]]
    horizontalArray = [[3,4,"five",6]]
    verticalArray = [[3],[4],["five"],[6]]
    oneByOneArray = [[99]]

    t.equal( 6, make2DArray(twoDArray)[1][1], "Works for 2D array")
    t.equal( 6, make2DArray(horizontalArray)[0][3], "Works for horizontal 1D array")
    t.equal( 6, make2DArray(verticalArray)[3][0], "Works for vertical 1D array")
    t.equal( 99, make2DArray(oneByOneArray)[0][0], "Works for 1x1 array")
    t.equal( 99, make2DArray(99)[0][0], "Works for single value")
  })

  test('indexBy0', function(t) {
    twoDArray = [[3, 4], ["five",6]]
    horizontalArray = [[3,4,"five",6]]
    verticalArray = [[3],[4],["five"],[6]]

    t.equal( 6, indexBy0(twoDArray, 1, 1), "Works for 2D array")
    t.equal( 6, indexBy0(horizontalArray, 0, 3), "Works for horizontal 1D array")
    t.equal( 6, indexBy0(verticalArray, 3, 0), "Works for vertical 1D array")
    t.equal( 7, indexBy0([[7]], 0, 0), "Works for 1x1 numeric array")
    t.equal( "yes", indexBy0([['yes']], 0, 0), "Works for 1x1 string array")
    t.equal( 8, indexBy0(8, 0, 0), "Works for single numeric value")
    t.equal( "yes", indexBy0('yes', 0, 0), "Works for single string value")
  })

  test('extractColumns', function(t) {
    range = [ ["ID", "Description", "Cost"]
            , [  34,     "Peanuts",   3.47]
            , [  45,    "Cucumber",   1.24]
            ]
    
    t.equal( [["Peanuts"], ["Cucumber"]]
            , extractColumns("Description", range)
            , 'Extracts one column')
    t.equal([  ["Peanuts",  34]
            ,  ["Cucumber", 45]
            ]
            , extractColumns(["Description", "ID"], range)
            , 'Extracts multiple columns')
    
    t.throws( function(){ extractColumns([["Description"], ["ID"]], range) },
            "Should error if list of columns is a 2D array (not a 1D array)")
  })


  test('extractColumnsAndTransform', function(t) {
    range = [ ["ID", "Description", "Cost"]
            , [  34,     "Peanuts",   3.47]
            , [  45,    "Cucumber",   1.24]
            ]
    
    t.equal( [["Peanuts", "Cucumber"]]
            , extractColumnsAndTransform("Description", range)
            , 'Extracts one row')
    t.equal( [["Peanuts", "Cucumber"]
             ,[       34,         45]
             ]
            , extractColumnsAndTransform(["Description", "ID"], range)
            , 'Extracts multiple rows')
    t.throws( function(){ extractColumnsAndTransform([["Description"], ["ID"]], range) },
              "Should error if list of columns is a 2D array (not a 1D array)")
  })
  
}
