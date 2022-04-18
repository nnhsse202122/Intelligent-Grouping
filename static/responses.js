function showResponses() {
    statusTitle.innerText = "Student Responses"
    switchSection(responsesSection)
    setState(8, {id: state.info.id/*, groupingId: grouping.id, currentGroup:grouping*/})

    clearSideText(document.getElementById("given-responses"))
    let info = document.createElement('h2')
    info.innerHTML = "Click on a Student"
    document.getElementById("given-responses").append(info)
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
  while(document.getElementById("student-selector").firstChild) {
    document.getElementById("student-selector").removeChild(document.getElementById("student-selector").firstChild)
  }

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

function clearSideText(list) {
  while(list.firstChild) {
    list.removeChild(list.firstChild);
  }
}

function updateStudentInformation(index) {
  let thisStudent = classes[state.info.id].obj.students[index]

  let list = document.getElementById("given-responses")
  clearSideText(list);

  // Preferred Students
  if(thisStudent.preferences.studentLike.length > 0) {
    let head = document.createElement('h2')
    head.innerHTML = "Preferred Classmate(s)"
    list.appendChild(head)
    for(let i = 0; i < thisStudent.preferences.studentLike[0].inputs.length; i++)
    {
      let student = findStudentById(thisStudent.preferences.studentLike[0].inputs[i])
      let info = document.createElement('li')
      info.innerHTML = `${student.first} ${student.last}`
      list.appendChild(info) 
    }
  }
  
  // Unpreferred Students
  if(thisStudent.preferences.studentDislike.length > 0) {
    let head = document.createElement('h2')
    head.innerHTML = "Unpreferred Classmate(s)"
    list.appendChild(head)
    for(let i = 0; i < thisStudent.preferences.studentDislike[0].inputs.length; i++)
    {
      let student = findStudentById(thisStudent.preferences.studentDislike[0].inputs[i])
      let info = document.createElement('li')
      info.innerHTML = `${student.first} ${student.last}`
      list.appendChild(info)
    }
  }

  // Preferred Topics
  if(thisStudent.preferences.topicLike.length > 0) {
    let head = document.createElement('h2')
    head.innerHTML = "Preferred Topic(s)"
    list.appendChild(head)
    for(let i = 0; i < thisStudent.preferences.topicLike[0].inputs.length; i++)
    {
      let topic = thisStudent.preferences.topicLike[0].inputs[i]
      let info = document.createElement('li')
      info.innerHTML = topic
      list.appendChild(info)
    }
  }

  // Unpreferred Topics
  if(thisStudent.preferences.topicDislike.length > 0) {
    let head = document.createElement('h2')
    head.innerHTML = "Unpreferred Topic(s)"
    list.appendChild(head)
    for(let i = 0; i < thisStudent.preferences.topicDislike[0].inputs.length; i++)
    {
      let topic = thisStudent.preferences.topicDislike[0].inputs[i]
      let info = document.createElement('li')
      info.innerHTML = topic
      list.appendChild(info)
    }
  }

  if(!list.firstChild) {
    let info = document.createElement('h2')
    info.innerHTML = "This student has not responded"
    list.append(info)
  }
}

function findStudentById(id){
  for(let i = 0; i < classes[state.info.id].obj.students.length; i++) {
    if(classes[state.info.id].obj.students[i].id == id) {
      return classes[state.info.id].obj.students[i]
    }
  }
}