//CONSTANTS
const QUARTER_SIZE = 25 //1/4th of the size of each generation
const FREE_ITERATIONS = 100 //free iterations of the genetic algorithm before starting checking for the escape condition
const ESCAPE_ITERATIONS = 100 //amount of iterations without improvement before the escape condition is met
const MUTATION_PROBABILITY = 0.1 //the probability of any given member of a generation getting mutated
const MUTATION_PROPORTION = 0.1 //the proportion of any given mutated member of a generation to be modified
const STUDENT_LIKE_BASE = 2 //exponential base for the increment when a student is paired with a preferred student
const STUDENT_DISLIKE_BASE = 3 //exponential base for the decrement when a student is paired with an unpreferred student
//data structure:
/*
generation = [member]
member = 
{
  g: [[student]]
  s: integer
}
student = 
{
  id: String
  preferences:
  {
    studentLike = [preference]
    studentDislike = [preference]
  }
}
preference = 
{
  id: String
  inputs: [String]
}
preferences = [preference]
*/
/*
groups a set of students based on preferences
param:
students: [] of student objects to be grouped
preferences: [] of preference objects to confirm what is stored within each student
groupSizer: Integer property that has two meanings depending on the boolean below
amountOrSize: boolean that determines whether groupSizer refers to the amount of desired groups or the desired size per group
return: [[]] of student ids
*/
function startGenetic(students, preferences, groupSizer, amountOrSize)
{
  //derive constants
  const HALF_SIZE = 2 * QUARTER_SIZE //half of a generation size
  const SIZE = 2 * HALF_SIZE  //a full generation size
  
  //declare important values
  let currentGeneration = [] //the current population of the current generation
  let bestGeneration = [] //the population back when the maximum score was highest
  let iteration = 0 //current iteration of the genetic algorithm
  let incomplete = true //whether the algorithm is done or not
  let failures = 0 //the current amount of failures since the last improvement

  //get random initial population
  for(i = 0; i < SIZE; i++) {currentGeneration[i] = {g: randomize(students, groupSizer, amountOrSize), s: 0}}

  //score and sort initial population in descending order by score
  currentGeneration = scoreAndSort(currentGeneration, preferences)
  
  //since this is the first generation, bestGeneration and bestScore are both initially the only data point given. grab values
  bestGeneration = [...currentGeneration]
  let bestScore = bestGeneration[0].s
  
  //set up the breeding function
  /*
  breeds a half-generation through random pairing, and appends the results to the end of the current generation
  param:
  currentGeneration: the current generation that is being computed in the algorithm
  parents: the half-population that is being used to generate this new half-population
  */
  const breed = function(currentGeneration, parents)
  {
    for(i = 0; i < QUARTER_SIZE; i++)
    {
      let p1 = parents.splice(Math.floor(Math.random() * parents.length), 1)[0]
      let p2 = parents.splice(Math.floor(Math.random() * parents.length), 1)[0]
      let cp1 = Math.floor(Math.random() * (students.length - 1) + 1)
      let cp2 = Math.floor(Math.random() * (students.length - 1) + 1)
      currentGeneration.push({g: splice(p1.g, p2.g, cp1), s: 0})
      currentGeneration.push({g: splice(p2.g, p1.g, cp2), s: 0})
    }
    return currentGeneration
  }

  //starts the true algorithm, loops until escape condition is met
  while(incomplete)
  {
    //iterate iteration number
    iteration++

    //kill lowest half
    currentGeneration.splice(HALF_SIZE, HALF_SIZE)

    //repopulate with children of the top half of the previous generation
    let parents = currentGeneration.splice(0, HALF_SIZE) //clear current generation
    currentGeneration = breed(currentGeneration, parents) //breed the top half of the previous generation
    parents = [...currentGeneration] //parents are now the current set of children
    currentGeneration = breed(currentGeneration, parents) //breed the top set of children to fully populate this generation

    //mutate if conditions are met
    for(let member of currentGeneration) if(Math.random() <= MUTATION_PROBABILITY) member = {g: mutate(member.g), s: 0}
    
    //score and sort generation
    currentGeneration = scoreAndSort(currentGeneration, preferences)

    //if improvmement is made, set failure index to 0 if past the amount of free iterations, and set bestGeneration and bestScore to a copy of the current generation and the score of the best member of the current generation, respectively
    if(currentGeneration[0].s > bestScore)
    {
      bestGeneration = [...currentGeneration]
      bestScore = currentGeneration[0].s
      failures = 0
    }

    //if improvement isn't made, increment failure counter
    else {if(iteration >= FREE_ITERATIONS) {failures++}}

    //check for escape condition, and if it is made, exit the loop
    if(failures >= ESCAPE_ITERATIONS) {incomplete = false}
  }

  //maps the 2d array within the best generation to be a 2d array of student ids and returns the result
  return bestGeneration[0].g.map(group => group.map(student => student.id)) 
}

/*
generates a randomized grouping based on inputs
param: 
students: same as students for startGenetic()
groupSizer: same as groupSizer for startGenetic()
amountOrSize: same as amountOrSize for startGenetic()
returns: a randomized [[]] of student objects
*/
function randomize(students, groupSizer, amountOrSize)
{
  //define output
  let output = []
  
  //define parameters for each subarray of the resultant 2d array
  let groupCount = (amountOrSize) ? groupSizer : Math.floor(students.length / groupSizer) //the amount of groups in this grouping. If the flexible parameter is the size of each group, simply take the integer quotient of the amount of students and the parameter
  let amountPerGroup = (amountOrSize) ? Math.floor(students.length / groupSizer) : groupSizer //the minimum size of each group in this grouping. If the flexible parameter is the amount of groups, simply take the integer quotient of the amount of students and the parameter
  let amountExtra = students.length - (amountPerGroup * groupCount) //the amount of groups to have a size of 1+amountPerGroup, in order to take into account for potentially non-divisible student counts and group parameters. This is equal to the remainder when the amount of students is divided by the amount per group
  
  //set up random selection
  let indices = []
  for(let i = 0; i < students.length; i++) indices[i] = i

  //loop through the amount of groups to construct the 2d array
  for(let i = 0; i < groupCount; i++)
  {
    //declare the subarray
    output[i] = []
    //select a random student for each slot within the subarray
    if(i < groupCount - amountExtra) {for(let j = 0; j < amountPerGroup; j++) {output[i][j] = students[indices.splice(Math.floor(Math.random() * indices.length), 1)[0]]}}
    else {for(let j = 0; j < amountPerGroup + 1; j++) {output[i][j] = students[indices.splice(Math.floor(Math.random() * indices.length), 1)[0]]}}
  }

  //return the new 2d array
  return output
}
/*
scores a member of a genetic generation
param:
grouping: [[{id: String, preferences: {studentLike: [{id: String, inputs: [String]}], studentDislike: [{id: String, inputs: [String]}]}}]], 2d array of students with their preferences
preferences: [{id: String}] list of preference objects to confirm that they are being used for this scoring algorithm
returns, Integer score gained by this group
*/
function score(grouping, preferences)
{
  //declare output
  let score = 0

  /*
  calculates a new score by searching a list for a match and then adding or subtracting expBase^(searchList.length - position in searchList), adds 0 if not found
  param:
  current: Integer current score
  searchList: [String] to search for in order to find whether this is a preferred or unpreferred value
  searchValue: String to search for within the list above to determine whether this is a preferred or unpreferred value
  expBase: Integer base for the exponent for the incrementation to the score
  isAdditive: Boolean true for increment to current, false for decrement to current
  returns: Integer new score
  */
  const adjustScore = function(current, searchList, searchValue, expBase, isAdditive)
  {
    for(i = 0; i < searchList.length; i++) {if(searchList[i] == searchValue) {current += ((isAdditive) ? 1 : -1) * Math.pow(expBase, searchList.length - i)}}
    return current
  }
  
  //loop through all students in array
  for(let group of grouping) {for(let student of group) 
  {
    //check whether a given preference is going to be checked or not for this student
    let checkLike = [] //array of length student.preferences.studentLike.length that tells the program whether to check a given studentLike preference or not based on value and position
    let checkDislike = [] //array of length student.preferences.studentDislike.length that tells the program whether to check a given studentDislike preference or not based on value and position
    
    //populate arrays
    for(let sl of student.preferences.studentLike) checkLike.push((preferences.map(pref => pref.id)).includes(sl.id))
    for(let sd of student.preferences.studentDislike) checkDislike.push((preferences.map(pref => pref.id)).includes(sd.id))

    //loop through all other students within the group other than the student currently being analyzed
    for(let studentCheck of group) { if(studentCheck.id != student.id) 
    {
      //because if it isn't in the like list it is either not in either or just in the dislike list, if it is found in the like list the dislike list will not be checked.
      let found = false
      //loop through studentLike objects and run the code within if it is confirmed that it will be checked for this genetic algorithm
      for(let i = 0; i < student.preferences.studentLike.length; i++) {if(checkLike[i])
      {
        let newScore = score
        newScore = adjustScore(score, student.preferences.studentLike[i].inputs, studentCheck.id, STUDENT_LIKE_BASE, true)
        if(newScore > score) 
        {
          score = newScore
          found = true
        }
      }}
      //loop through all studentDislike objects and run the code within if it is confirmed that it will be checked for this genetic algorithm
      if(!found) {for(let i = 0; i < student.preferences.studentDislike.length; i++) {if(checkDislike[i])
        {score = adjustScore(score, student.preferences.studentDislike[i].inputs, studentCheck.id, STUDENT_DISLIKE_BASE, false)}}}
    }}
  }}

  //returns output
  return score
}
/*
calls score() for all members of a generation and sorts them in descsending order
param:
generation: [{g: [[Student]], s: Integer}], array containing all generation member objects
preferences: [preference] passed to score()
returns: same format as generation, but with generation[i].s set as each member's score, and all members sorted by score in descending order, i.e. best is at generation[0]
*/
function scoreAndSort(generation, preferences)
{
  for(let i = 0; i < generation.length; i++) {generation[i] = {g: generation[i].g, s: score(generation[i].g, preferences)}}
  if(generation.includes(undefined)) {console.log("issues found")}
  return generation.sort((a, b) => (a.s == b.s) ? 0 : ((a.s < b.s) ? 1 : -1))
}
/*
accepts a 2d array and returns a 1 dimensional array along with another array containing the necessary data to reconstruct the original 2d array
param:
array: the 2d array to flatten
returns: an object containing the linearized array and the grouping data in the following format:
{a: [], g: [{startingIndex: Integer, endingIndex: Integer}]}, where a is the linearized array, and g is the array of groupingData objects
*/
function linearize(array)
{
  //declare outputs
  let linearized = [] //linearized array
  let gData = [] //grouping data

  //set up loop
  let index = 0 //linearized index
  //loop through all values
  for(let i = 0; i < array.length; i++) {for(let j = 0; j < array[i].length; j++)
  {
    //get beginning and end data
    if(j == 0) {gData[i] = {startingIndex: index, endingIndex: index + array[i].length - 1}}
    //append the current value within the input to the linearized array
    linearized.push(array[i][j])
    //increment linearized index
    index++
  }}
  
  //return the two outputs in a single object
  return {a: linearized, d: gData}
}

/*
gets a segment of values from an array. 
param:
array: the array to copy values from
startingIndex: where to start copying from
endingIndex: where to end copying from
returns: an array containing all the values within array between startingIndex and endingIndex
*/
function getSegment(array, startingIndex, endingIndex)
{
  //define output
  let output = []
  //loop through all values in the array from startingIndex to endingIndex
  for(let i = startingIndex; i <= endingIndex; i++) {output.push(array[i])}
  //return output
  return output
}
/*
takes in a 1-dimensional array and the groupingdata array from linearize() and returns it as a 2d array in the formate dictated by the grouping data.
param:
linearized: a 1-dimensional array to reinflate
groupingData: [{startingindex: Integer, endingIndex: Integer}], dictates subarray boundaries for reinflation
returns: a 2 dimensional array containing all values from linearized, with subarray dimensions determined by groupingData
*/
function reInflate(linearized, groupingData)
{
  //declare output
  let output = []

  //loop through each group
  let index = 0 //the current group number
  for(let gd of groupingData)
  {
    //get the subarray from the linearized array by grabbing all values between the starting and ending index given by the current groupingData object
    let seg = getSegment(linearized, gd.startingIndex, gd.endingIndex)
    //declares subarray
    output[index] = []
    //inserts all value from the computed subarray segment into the current subarray
    for(let stu of seg) {output[index].push(stu)}
    //increments current group number
    index++
  }

  //returns the new 2d array
  return output
}
/*
splices two parent generations together
param:
parent1: [[student]] parent array 1
parent2: [[student]] parent array 2
cpoint: crossover point for splicing, 1<=cpoint<=parent1.length - 1, assuming parent1.length == parent2.length (requirement)
returns: [[student]] a mix of the two input arrays
*/
function splice(parent1, parent2, cpoint)
{
  //define output
  let child = []

  //linearize parents
  let lp1 = linearize(parent1)
  let gd = lp1.d
  lp1 = lp1.a
  let lp2 = linearize(parent2).a
  
  //get segment from parent 1
  let seg1 = getSegment(lp1, 0, cpoint - 1)
  for(let stu of seg1) child.push(stu)

  //get segment from parent 2
  let seg2 = getSegment(lp2, cpoint, lp2.length - 1)
  for(let stu of seg2) child.push(stu)

  //clean up child
  let repeats = [] //indices of all repeated values
  let uniqueInitial = [] //list of all unique students encountered
  let missing = [] //list of all students not found in the child array

  //find all unique students in the child and find location of repeats
  for(let i = 0; i < child.length; i++) 
  {
    if(!uniqueInitial.map(student => student.id).includes(child[i].id)) {uniqueInitial.push(child[i])}
    else {repeats.push(i)}
  }

  //determine who is missing from the child array
  for(let stu of lp1) {if(!uniqueInitial.map(student => student.id).includes(stu.id)) {missing.push(stu)}}

  //replace repeats with missing students
  for(let i of repeats) child[i] = missing.splice(0, 1)[0]
  
  //inflate the child array back to 2d and return
  return reInflate(child, gd)
}

/*
modifies an inputted grouping based on the given tuning variables
param:
grouping: [[student]] the initial grouping setup
returns: a [[student]] based on grouping with some pairs swapped based on MUTATION_PROPORTION
*/
function mutate(grouping)
{
  //linearize input
  let lg = linearize(grouping)
  let gd = lg.d
  lg = lg.a

  //get amount of pairs based on tuning constant proportion of mutation change
  let pairCt = Math.ceil(Math.ceil(lg.length * MUTATION_PROPORTION) / 2) 

  //prepare to loop through and select random unique pairs
  let indices = []
  for(let i = 0; i < lg.length; i++) {indices[i] = i}
  for(let i = 0; i < pairCt; i++)
  {
    //select two random unique students
    let i1 = indices.splice(Math.floor(Math.random() * indices.length), 1)[0]
    let i2 = indices.splice(Math.floor(Math.random() * indices.length), 1)[0]
    let s1 = lg[i1]
    let s2 = lg[i2]

    //swap their positions
    lg[i1] = s2
    lg[i2] = s1
  }

  //return the reinflated version of this linearized array
  return reInflate(lg, gd)
}