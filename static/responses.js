function showResponses() {
    statusTitle.innerText = "Student Responses"
    switchSection(responsesSection)
    setState(8, {id: state.info.id/*, groupingId: grouping.id, currentGroup:grouping*/})
    appendClassStudents();
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
function appendClassStudents(){
  for(let i = 0; i < classes[state.info.id].obj.students.length; i++) {
    classes[state.info.id].obj.students[i]
    let newOption = document.createElement('option');
    newOption.setAttribute('id', classes[state.info.id].obj.students[i].id)
    newOption.addEventListener('click', function(){
      updateStudentInformation(i);
    });
    newOption.innerText = classes[state.info.id].obj.students[i].first + " " + classes[state.info.id].obj.students[i].last

    document.getElementById("student-selector").appendChild(newOption)
  }
}

function updateStudentInformation(index) {
  //classes[state.info.id].obj.students[index]
  // Check if student prefs
}