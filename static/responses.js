function showResponses() {
    statusTitle.innerText = "Student Responses"
    switchSection(responsesSection)
    setState(8, {id: state.info.id/*, groupingId: grouping.id, currentGroup:grouping*/})
    somethingOrOther()
}

function somethingOrOther(){
    console.log("t0")
  //for(let student in group)
  // Find a way to loop through the students in a class individually and call .preferences on each and print it out.
  /*for(pref in classes[state.info.id].obj.preferences) {
    console.log("t1")
    console.log(pref)
    console.log("t2")
  }*/
  console.log(classes[state.info.id])
  console.log(classes[state.info.id].obj)
  console.log(classes[state.info.id].obj.students)
  console.log(classes[state.info.id].obj.student)
  console.log(classes[state.info.id].obj.preferences)
  console.log(classes[state.info.id].obj.preference)
  for(let i = 0; i < 19; i++/*let student in classes[state.info.id].obj.students*/) {
    
    console.log(classes[state.info.id].obj.students[i])
    console.log(classes[state.info.id].obj.students[i].preferences)
    console.log(classes[state.info.id].obj.students[i].preferences.studentLike[0])
    console.log(classes[state.info.id].obj.students[i].preferences.studentDislike[0])
  }
}