function showResponses() {
    statusTitle.innerText = "Student Responses"
    switchSection(responsesSection)
    setState(8, {id: state.info.id/*, groupingId: grouping.id, currentGroup:grouping*/})
    somethingOrOther()
}

function somethingOrOther(){
  for(let i = 0; i < classes[state.info.id].obj.students.length; i++) {
    
    console.log(classes[state.info.id].obj.students[i])
    console.log(classes[state.info.id].obj.students[i].preferences)
  }
}

/***
 * Adds student names to dropdown menu
 */
function adjustDropdown(){

  for(let i = 0; i < classes[state.info.id].obj.students.length; i++) {
    classes[state.info.id].obj.students[i]

    let student = document.createElement('a');
    student.setAttribute('href', '#' + classes[state.info.id].obj.students[i].id);
    student.innerText = classes[state.info.id].obj.students[i].first + " " + classes[state.info.id].obj.students[i].last

    document.getElementById("studentDropdown").appendChild(student)
  }

  document.getElementById("studentDropdown").classList.toggle("show");
}