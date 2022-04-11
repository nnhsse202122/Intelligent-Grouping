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

  console.log(thisStudent.preferences)
 
  console.log(thisStudent);
  let list = document.getElementById("given-responses")
  while(list.firstChild) {
    list.removeChild(list.firstChild);
  }

  // Preferred Students
  for(let i = 0; i < thisStudent.preferences.studentLike[0].inputs.length; i++)
  {
    if(i == 0) {
      let head = document.createElement('h1')
      head.innerHTML = "Preferred Classmate(s)"
      list.appendChild(head)
    }

    let student = findStudentById(thisStudent.preferences.studentLike[0].inputs[i])
    let info = document.createElement('li')
    info.innerHTML = `${student.first} ${student.last}`
    list.appendChild(info) 
  }

  // Unpreferred Students
  for(let i = 0; i < thisStudent.preferences.studentDislike.inputs.length; i++)
  {
    if(i == 0) {
      let head = document.createElement('h1')
      head.innerHTML = "Unpreferred Classmate(s)"
      list.appendChild(head)
    }

    let student = findStudentById(thisStudent.preferences.studentDislike[0].inputs[i])
    let info = document.createElement('li')
    info.innerHTML = `${student.first} ${student.last}`
    list.appendChild(info)
  }

  // Preferred Topics
  for(let i = 0; i < thisStudent.preferences.topicLike.inputs.length; i++)
  {
    if(i == 0) {
      let head = document.createElement('h1')
      head.innerHTML = "Preferred Topic(s)"
      list.appendChild(head)
    }

    let topic = thisStudent.preferences.topicLike[0].inputs[i]
    let info = document.createElement('li')
    info.innerHTML = topic
    list.appendChild(info)
  }

  // Unpreferred Topics
  for(let i = 0; i < thisStudent.preferences.topicDislike.inputs.length; i++)
  {
    if(i == 0) {
      let head = document.createElement('h1')
      head.innerHTML = "Unpreferred Topic(s)"
      list.appendChild(head)
    }

    let topic = thisStudent.preferences.topicDislike[0].inputs[i]
    let info = document.createElement('li')
    info.innerHTML = topic
    list.appendChild(info)
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