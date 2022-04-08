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
    newOption.setAttribute('index', i)
    newOption.addEventListener('click', function(){
      updateStudentInformation(newOption.getAttribute('index'));
    });
    newOption.innerText = classes[state.info.id].obj.students[i].first + " " + classes[state.info.id].obj.students[i].last

    document.getElementById("student-selector").appendChild(newOption)
  }
}

function updateStudentInformation(index) {
  let thisStudent = classes[state.info.id].obj.students[index]
 
  console.log(thisStudent);
  let list = document.getElementById("given-responses")
  while(list.firstChild) {
    list.removeChild(list.firstChild);
  }

  if(thisStudent.preferences.studentLike.length > 0) {
    let head = document.createElement('h1');
    head.innerHTML = "Preferred Classmates"

    let studentOne = findStudentById(thisStudent.preferences.studentLike[0].inputs[0])
    let studentTwo = findStudentById(thisStudent.preferences.studentLike[0].inputs[1])
    let liOne = document.createElement('li');
    let liTwo = document.createElement('li');

    list.appendChild(head);

    liOne.innerHTML = `${studentOne.first} ${studentOne.last}`
    liTwo.innerHTML = `${studentTwo.first} ${studentTwo.last}`
    list.appendChild(liOne);
    list.appendChild(liTwo);
  }

  if(thisStudent.preferences.studentDislike.length > 0) {
    let head = document.createElement('h1');
    head.innerHTML = "Unpreferred Classmates"

    let studentOne = findStudentById(thisStudent.preferences.studentDislike[0].inputs[0])
    let studentTwo = findStudentById(thisStudent.preferences.studentDislike[0].inputs[1])
    let liOne = document.createElement('li');
    let liTwo = document.createElement('li');

    list.appendChild(head);

    liOne.innerHTML = `${studentOne.first} ${studentOne.last}`
    liTwo.innerHTML = `${studentTwo.first} ${studentTwo.last}`
    list.appendChild(liOne);
    list.appendChild(liTwo);
  }

  if(!list.firstChild) {
    list.append(document.createElement('h2').innerHTML = "This student has not responded")
  }
}

function findStudentById(id){
  for(let i = 0; i < classes[state.info.id].obj.students.length; i++) {
    if(classes[state.info.id].obj.students[i].id == id) {
      return classes[state.info.id].obj.students[i]
    }
  }
}