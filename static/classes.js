function constructClassFromManual() {
  const classObj = {groupings: []}

  classObj.name = classNameInput.value;
  
  classObj.id = md5(classNameInput.value + +periodInput.value)
  classObj.period = periodInput.value
  classObj.students = []
  classObj.preferences = []
  
  for (const inputGroup of Array.from(studentInfoInputs.children)) {
    if (!inputGroup.classList.contains("sizeholder")) {
      const student = {}
      for (let input of Array.from(inputGroup.children).slice(0,-1)) {
        input = input.children[0]
        if (input.classList.contains("first-name-input")) {
          student.first = input.value
        } else if (input.classList.contains("last-name-input")) {
          student.last = input.value
        } else if (input.classList.contains("middle-initial-input")) {
          student.middle = input.value
        } else if (input.classList.contains("student-id-input")) {
          student.id = input.value
        } else if (input.classList.contains("email-input")) {
          student.email = input.value
        }
      }
      classObj.students.push(student)
    }
  }
  return classObj
}

async function constructClassesFromFile(file) {
  let data = await file.text()
  const classObjs = {}
  data = data.split("\n").map(r => r.split(/(?!\B"[^"]*),(?![^"]*"\B)/g))
  const required = ["Term", "Period","Course Name","Student ID","Last Name","First Name","Middle Name"]

  for(const element of required) {
    if (!data[0].includes(element)) {
      return {valid: false}
    }
  }

  data = data.slice(1, data.length - 1)

  for (const row of data) {
    if (!classObjs[row[0]]) {
      classObjs[row[0]] = []
    }
  }

  for (const row of data) {
    let existing
    const hashedId = md5(row[3] + row[1])
    for(const classObj of classObjs[row[0]]) {
      if (classObj.id == hashedId) {
        existing = classObj
      }      
    }

    if (existing) {
      existing.students.push({
        id: row[5],
        first: row[7],
        last: row[6],
        middle: row[8][0] ? row[8][0] : "",
        email: row[10],
        preferences: {
          studentLike: [],
          studentDislike: [],
          topicLike: [],
          topicDislike: [],
        }
      })
    } else {
      classObjs[row[0]].push({
        id: hashedId,
        name: row[3],
        period: +row[1],
        preferences: [],
        students: [
          {
            id: row[5],
            first: row[7],
            last: row[6],
            middle: row[8] ? row[8][0] : "",
            email: row[10],
            preferences: {
              studentLike: [],
              studentDislike: [],
              topicLike: [],
              topicDislike: [],
            }
          }
        ],
        groupings: []
      })
    }   
  }
  console.log(classObjs)
  return {valid: true, classObjs: classObjs}
}

function saveNewClasses(classObjs) {
  return fetch("/addClasses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: auth2.currentUser.get().getAuthResponse().id_token
    },
    body: JSON.stringify({
      classObjs: classObjs
    })
  }).then(res => res.json())
}

function saveEditedClass(classObj) {
  return fetch("/editClass", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: auth2.currentUser.get().getAuthResponse().id_token
    },
    body: JSON.stringify({
      classObj: classObj,
      oldId: state.info.id
    })
  }).then(res => res.json())
}

function addClassToUI(classObj) {
  const classElement = document.createElement("div")
  classElement.classList = "class"
  const classArrow = document.createElement("button")
  classArrow.classList = "class-arrow"
  const className = document.createElement("p")
  className.classList = "class-name"
  classElement.setAttribute("id", classObj.id)
  className.innerText = `${classObj.name} ${+classObj.period == classObj.period ? "P" + +classObj.period : classObj.period}`
  classElement.appendChild(classArrow)
  classElement.appendChild(className)
  setUpClassEvents(classElement)
  classListDiv.appendChild(classElement)
  return classElement
}

function setUpClassEvents(classElement) {
  classElement.addEventListener("click", () => {
    for (const element of Array.from(classListDiv.children)) {
      if (element != classElement) {
        element.classList.remove("selected")
      } else {
        element.classList.add("selected")
      }
      showClass(classElement.id)
    }
  })
}

function showClass(id) {
  switchSection(viewClassSection)
  let selectedClass = classes[id].obj
  statusTitle.innerText = "View Class"
  setState(4, {id: id})
  infoPanelClassName.innerText = `${selectedClass.name} ${+selectedClass.period == selectedClass.period ? "P" + +selectedClass.period : selectedClass.period}`
  infoPanelNumStudents.innerText = `${selectedClass.students.length} Students`
  infoPanelNumGroups.innerText = `${selectedClass.groupings.length} Groupings`
  clearDiv(groupingsList)
  for (const grouping of selectedClass.groupings) {
    addGroupingToList(grouping)
  }
  clearDiv(preferencesList)
  for (const preference of selectedClass.preferences) {
    addPreferenceToList(preference)
  }
}



async function addClass(classObj) {
  classes[classObj.id] = {obj: classObj}
  classes[classObj.id].element = addClassToUI(classObj)
}

async function uploadClass() {
  startLoad()
  if (uploadClassInput.files[0]) {
    const classesResult = await constructClassesFromFile(uploadClassInput.files[0])
    uploadClassInput.value = null
    if (classesResult.valid) {
      modalExit()
      createModal("small", m => {
        m.classList.add("select-term-modal")
        for (const term in classesResult.classObjs) {
          const button = document.createElement("button")
          button.innerText = `Term\n${term.match(/\d+/)[0]}`
          button.classList = "button"
          m.appendChild(button)
          button.addEventListener("click", async () => {
            startLoad()
            const saveResult = await saveNewClasses(classesResult.classObjs[term])
            if (saveResult.status) {
              for (const classObj of saveResult.newClasses) {
                addClass(classObj)
              }
              modalExit()
            } else {
              createError(saveResult.error)
              modalExit()
            }
            endLoad()
          })
        }
      })
    } else {
      createError("Invalid File")
    }
  }
  endLoad()
}

function showAddClassModal() {
  createModal("small", (modal, exit) => {
    modal.classList.add("add-class-modal")
    const upload = document.createElement("button")
    upload.classList = "button"
    upload.innerText = "Upload Class"
    const uploadIcon = document.createElement("i")
    uploadIcon.classList = "fa fa-file-upload fa-3x"
    upload.appendChild(uploadIcon)
    upload.addEventListener("click", () => {uploadClassInput.click()})
    const manual = document.createElement("button")
    manual.classList = "button"
    manual.innerText = "Manually Add Class"
    const manualIcon = document.createElement("i")
    manualIcon.classList = "fa fa-pen-square fa-3x"
    manual.addEventListener("click", () => {
      exit()
      editClass()
    })
    manual.appendChild(manualIcon)
    modal.appendChild(upload)
    modal.appendChild(manual)
  })
}



function editClass(classObj) {
  if (classObj) {
    statusTitle.innerText = "Edit Class"
    classNameInput.value = classObj.obj.name
    periodInput.value = classObj.obj.period
    classNameInput.classList.remove("invalid")
    periodInput.classList.remove("invalid")
    clearDiv(studentInfoInputs)
    for (const student of classObj.obj.students) {
      addStudentInputs(student)
    }
    setState(3, {id: classObj.obj.id})
  } else {
    statusTitle.innerText = "Create Class"
    classNameInput.value = ""
    periodInput.value = ""
    classNameInput.classList.remove("invalid")
    periodInput.classList.remove("invalid")
    deselectAllClasses()
    clearDiv(studentInfoInputs)
    setState(2)
  }
  switchSection(editClassSection)
}



function addStudentInputs(student) {
  const studentInfoContainer = document.createElement("div")
  studentInfoContainer.classList = "student-info-container"
  studentInfoContainer.appendChild(createPlaceholderInput("First Name *", "first-name-input", student ? student.first : ""))
  studentInfoContainer.appendChild(createPlaceholderInput("Last Name *", "last-name-input", student ? student.last : ""))
  studentInfoContainer.appendChild(createPlaceholderInput("Middle Initial", "middle-initial-input", student ? student.middle : ""))
  studentInfoContainer.appendChild(createPlaceholderInput("ID *", "student-id-input", student ? student.id : ""))
  studentInfoContainer.appendChild(createPlaceholderInput("Email", "email-input", student ? student.email : ""))
  const removeStudent = document.createElement("i")
  removeStudent.classList = "fas fa-times-circle fa-2x remove-student"
  removeStudent.addEventListener("click", () => {
    removeList(studentInfoContainer)
  })
  studentInfoContainer.appendChild(removeStudent)
  addList(studentInfoContainer, studentInfoInputs)
}

function validateClassInputs() {
  let status = {valid: true}
  for (const input of Array.from(classInfoInputs.children)) {
    if (input.children[0].value == "") {
      input.children[0].classList.add("invalid")
      status = {valid: false, error: "Please fill out all fields"}
    } else {
      input.children[0].classList.remove("invalid")
    }
  }

  if (!status.valid) return status

  if (Array.from(studentInfoInputs.children).length == 1) {
    return {valid: false, error: "Please add at least one student"}
  }

  for (const inputGroup of Array.from(studentInfoInputs.children)) {
    if (!inputGroup.classList.contains("sizeholder")) {
      for (let input of Array.from(inputGroup.children).slice(0,-1)) {
        input = input.children[0]
        if (!input.classList.contains("middle-initial-input") && !input.classList.contains("email-input") && input.value == "") {
          input.classList.add("invalid")
          status = {valid: false, error: "Please fill out all fields"}
        } else {
          input.classList.remove("invalid")
        }
      }
    }
  }

  if (!status.valid) return status

  if (state.mode == 2 && Object.keys(classes).includes(md5(classNameInput.value + periodInput.value))) {
    classNameInput.classList.add("invalid")
    periodInput.classList.add("invalid")
    return {valid: false, error: "Duplicate Class"}
  } else {
    classNameInput.classList.remove("invalid")
    periodInput.classList.remove("invalid")
  }

  const studentIds = []
  for (const inputGroup of Array.from(studentInfoInputs.children)) {
    for (let input of Array.from(inputGroup.children).slice(0,-1)) {
      input = input.children[0]
      if (input.classList.contains("student-id-input")) {
        if (studentIds.includes(input.value)) {
          input.classList.add("invalid")
          status = {valid: false, error: "Duplicate Student IDs"}
        } else {
          studentIds.push(input.value)
          input.classList.remove("invalid")
        }
      }
    }
  }
  
  return status
}

function deleteClassFromDB(id) {
  return fetch("/deleteClass", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: auth2.currentUser.get().getAuthResponse().id_token
    },
    body: JSON.stringify({
      id: id
    })
  }).then(res => res.json())
}

async function deleteClass(id) {
  startLoad()
  const deleteResult = await deleteClassFromDB(id)
  if (deleteResult.status) {
    classListDiv.removeChild(classes[id].element)
    delete classes[id]
    statusTitle.innerText = "Dashboard"
    switchSection(welcomeSection)
  } else {
    createError(deleteResult.error)
  }
  endLoad()
}

function exitEditClass() {
  if (state.mode == 3) {
    showClass(state.info.id)
  } else {
    switchSection(welcomeSection)
    statusTitle.innerText = "Dashboard"
    setState(1)
  }
}

async function completeClassAdd() {
  startLoad()
  const status = validateClassInputs()
  if (status.valid) {
    const classObj = constructClassFromManual()
    const saveResult = await saveNewClasses([classObj])
    if (saveResult.status) {
      for (const classObj of saveResult.newClasses) {
        addClass(classObj)
        exitEditClass()
      }
    } else {
      createError(saveResult.error)
    }
  } else {
    createError(status.error)
  }
  endLoad()
}

async function completeClassEdit() {
  startLoad()
  const status = validateClassInputs()
  if (status.valid) {
    const classObj = constructClassFromManual()
    const saveResult = await saveEditedClass(classObj)
    if (saveResult.status) {
      const oldClassElement = classes[state.info.id].element
      oldClassElement.children[1].innerText = `${saveResult.updatedClass.name} P${saveResult.updatedClass.period}`
      oldClassElement.id = saveResult.updatedClass.id
      delete classes[state.info.id]
      classes[saveResult.updatedClass.id] = {element: oldClassElement, obj: saveResult.updatedClass}
      exitEditClass()
    } else {
      createError(saveResult.error)
    }
  } else {
    createError(status.error)
  }
  endLoad()
}

addClassBtn.addEventListener("click", showAddClassModal)
uploadClassInput.addEventListener("change", uploadClass)
addStudentBtn.addEventListener("click", addStudentInputs)
saveClassBtn.addEventListener("click", async () => {
  if (state.mode == 2) {
    await completeClassAdd()
  } else if (state.mode == 3) {
    await completeClassEdit()
  }
})

editClassBtn.addEventListener("click", () => {
  editClass(classes[state.info.id])
})

deleteClassBtn.addEventListener("click", () => {
  deleteClass(state.info.id)
})

cancelClassBtn.addEventListener("click", exitEditClass)