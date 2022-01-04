const TEST_CLASS = 
{
  students:
  [
    {id: "1", preferences: {studentLike: [{id: "0", inputs: ["2"]}], studentDislike: []}}, 
    {id: "2", preferences: {studentLike: [{id: "0", inputs: ["1"]}], studentDislike: []}}, 
    {id: "3", preferences: {studentLike: [{id: "0", inputs: ["4"]}], studentDislike: []}}, 
    {id: "4", preferences: {studentLike: [{id: "0", inputs: ["3"]}], studentDislike: []}}, 
    {id: "5", preferences: {studentLike: [{id: "0", inputs: ["6"]}], studentDislike: []}}, 
    {id: "6", preferences: {studentLike: [{id: "0", inputs: ["5"]}], studentDislike: []}}, 
    {id: "7", preferences: {studentLike: [{id: "0", inputs: ["8"]}], studentDislike: []}}, 
    {id: "8", preferences: {studentLike: [{id: "0", inputs: ["7"]}], studentDislike: []}}
  ], 
  preferences: [{id: "0"}]
}
const SCORE_TEST_A = 
[
  [TEST_CLASS.students[0], TEST_CLASS.students[1]], 
  [TEST_CLASS.students[2], TEST_CLASS.students[3]], 
  [TEST_CLASS.students[4], TEST_CLASS.students[5]],
  [TEST_CLASS.students[6], TEST_CLASS.students[7]]
]
const EXPECTED_SCORE_A = 2*8
const SCORE_TEST_B = 
[
  [TEST_CLASS.students[0], TEST_CLASS.students[1]], 
  [TEST_CLASS.students[2], TEST_CLASS.students[3]], 
  [TEST_CLASS.students[4], TEST_CLASS.students[6]],
  [TEST_CLASS.students[5], TEST_CLASS.students[7]]
]
const CPOINT1 = 3
const EXPECTED_SPLICE_A_B1 = SCORE_TEST_B
const EXPECTED_SPLICE_B_A1 = SCORE_TEST_A
const CPOINT2 = 6
const EXPECTED_SPLICE_A_B2 = SCORE_TEST_A
const EXPECTED_SPLICE_B_A2 = SCORE_TEST_B
const EXPECTED_SCORE_B = 2*4
const LINEARIZE_TEST_A = 
[
  [17, 49, 31, 56, 54, 6, 53, 59],
  [46, 55, 39, 4, 40, 34, 5, 61],
  [2, 64, 33, 50, 1, 20, 10, 35],
  [18, 7, 58, 42, 22, 13, 27, 24],
  [51, 41, 21, 29, 8, 52, 19, 43],
  [15, 57, 36, 37, 62, 30, 8, 28],
  [63, 38, 45, 14, 25, 32, 44, 26],
  [12, 16, 60, 47, 23, 11, 48, 3]
]
const EXPECTED_LINEARIZE_A = 
{
  a: 
  [
    17, 49, 31, 56, 54, 6, 53, 59, 46, 55, 39, 4, 40, 34, 5, 61, 2, 64, 33, 50, 1, 20, 10, 35, 18, 7, 58, 42, 22, 13, 27, 24, 51, 41, 21, 29, 8, 52, 19, 43, 15, 57, 36, 37, 62, 30, 8, 28, 63, 38, 45, 14, 25, 32, 44, 26, 12, 16, 60, 47, 23, 11, 48, 3
  ],
  d:
  [
    {startingIndex: 0, endingIndex: 7},
    {startingIndex: 8, endingIndex: 15},
    {startingIndex: 16, endingIndex: 23},
    {startingIndex: 24, endingIndex: 31},
    {startingIndex: 32, endingIndex: 39},
    {startingIndex: 40, endingIndex: 47},
    {startingIndex: 48, endingIndex: 55},
    {startingIndex: 56, endingIndex: 63}
  ]
}

function linearizeTest()
{

  //Test for Linearize
  linearizeResult = linearize(LINEARIZE_TEST_A)

  for(let i = 0; i < linearizeResult.a.length; i++ )
  {
    if(linearizeResult.a[i] != EXPECTED_LINEARIZE_A.a[i])
    {
      console.log("Failed Method: linearize()\n Details: Method failed when comparing values of a from the result with the expected ,at index: " + i)
      return;
    }
  }

  for(let j = 0; j < linearizeResult.d.length; j++)
  {
    if((linearizeResult.d[j].startingIndex != EXPECTED_LINEARIZE_A.d[j].startingIndex) || (linearizeResult.d[j].endingIndex != EXPECTED_LINEARIZE_A.d[j].endingIndex))
    {
      console.log("Failed Method: linearize()\n Details: Method failed when comparing values of g from the result with the expected ,at index: " + j)
      return;
    }
  }

  console.log("Linearize Method Sucessful, hopefully.")
}

function getSegmentTest()
{
  sampleArray = []
  for(let i = 0; i < getRandomInt(100) + 20; i++)
  {
    sampleArray.push(getRandomInt(1000))
  }

  startIndex = getRandomInt(sampleArray.length-2)
  endIndex = getRandomInt(sampleArray.length-1 - startIndex) + startIndex

  resultArray = getSegment(sampleArray, startIndex, endIndex)

  for(let i = 0; i < resultArray.length; i++)
  {
    if(!resultArray[i] == sampleArray[i+startIndex])
    {
      console.log("Failed Method: getSegment() \n Details: Method failed when comparing values of the original array and the segmented array, at index: "+ i)

      return;
    }
  }

  console.log("getSegment Method successful")
}

function reinflateTest()
{
  result = reInflate(EXPECTED_LINEARIZE_A.a, EXPECTED_LINEARIZE_A.g)

  for(let i = 0; i < result.length; i++)
  {
    for(let j = 0; j < result[i].length; j++)
    {
      if(result[i][j] != LINEARIZE_TEST_A[i][j])
      {
        console.log("Failed Method: reInflate() \n Details: Method failed when comparing values of the original array and the resultant array, at Row: " + i +" Col: " +  j)
        return;
      }
    }
  }
  console.log("reInflate Method successful")
}

function testScore()
{
  scoreA = score(SCORE_TEST_A, TEST_CLASS.preferences)
  scoreB = score(SCORE_TEST_B, TEST_CLASS.preferences)

  if(scoreA != EXPECTED_SCORE_A)
  {
    console.log("Failed Method: reInflate() \n Details: Method failed when comparing the resulted score vs. the expected score, test case A.")
    return;
  }
  if(scoreB != EXPECTED_SCORE_B)
  {
    console.log("Failed Method: reInflate() \n Details: Method failed when comparing the resulted score vs. the expected score, test case B.")
    return;
  }

  console.log("score method sucessful")

}

function mutateTest()
{
  mutated = mutate(SCORE_TEST_A)

  if(mutated.length != SCORE_TEST_A.length)
  {
    console.log("Arrays are different Lengths")
    return;
  }
  for(let i = 0; i < SCORE_TEST_A.length; i++ )
  {
    if(mutated[i].length != SCORE_TEST_A[i].length)
    {
      console.log("Groupings are different legnths at index" + i)
      return;
    }

    for(let j = 0; j < SCORE_TEST_A[i].length; j++)
    {
      student = mutated[i][j]
      if(!(student.id && student.preferences))
      {
        console.log("Student Does not posess id or preference. Row" + i + " Col: " + j)
        return;
      }
    }
  }

  console.log("Mutate Sucessful")
}

function spliceTest()
{
  splice1 = splice(SCORE_TEST_A, SCORE_TEST_B, CPOINT1)
  splice2 = splice(SCORE_TEST_B, SCORE_TEST_A, CPOINT1)
  splice3 = splice(SCORE_TEST_A, SCORE_TEST_B, CPOINT2)
  splice4 = splice(SCORE_TEST_B, SCORE_TEST_A, CPOINT2)

  for(let i = 0; i < EXPECTED_SPLICE_A_B1.length; i++)
  {
    for(let j = 0; j < EXPECTED_SPLICE_A_B1[i]; j++)
    {
      if(EXPECTED_SPLICE_A_B1[i][j].id != splice1[i][j].id)
      {
        console.log("Splice 1 Failed at index: " + i + " , " + j)
        return;
      }
    }
  }

  for(let i = 0; i < EXPECTED_SPLICE_B_A1.length; i++)
  {
    for(let j = 0; j < EXPECTED_SPLICE_B_A1[i]; j++)
    {
      if(EXPECTED_SPLICE_B_A1[i][j].id != splice2[i][j].id)
      {
        console.log("Splice 2 Failed at index: " + i + " , " + j)
        return;
      }
    }
  }
  
  for(let i = 0; i < EXPECTED_SPLICE_A_B2.length; i++)
  {
    for(let j = 0; j < EXPECTED_SPLICE_A_B2[i]; j++)
    {
      if(EXPECTED_SPLICE_A_B2[i][j].id != splice3[i][j].id)
      {
        console.log("Splice 3 Failed at index: " + i + " , " + j)
        return;
      }
    }
  }

    
  for(let i = 0; i < EXPECTED_SPLICE_B_A2.length; i++)
  {
    for(let j = 0; j < EXPECTED_SPLICE_B_A2[i]; j++)
    {
      if(EXPECTED_SPLICE_B_A2[i][j].id != splice4[i][j].id)
      {
        console.log("Splice 4 Failed at index: " + i + " , " + j)
        return;
      }
    }
  }

  console.log("Splice Sucessful")


}


function getRandomInt(max) {
  return Math.round(Math.random() * max);
}

