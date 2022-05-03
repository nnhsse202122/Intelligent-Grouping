/*
* Grouping class variables:
* id: md5(groupNameInput.value),
* name: groupNameInput.value,
* groups: Array.from(groupScatter.children).filter(e => e.id != "add-group").map(e => Array.from(e.children[2].children).map(s => s.id)),
* excluded: Array.from(excludedStudentsListDiv.children).map(e => e.id)
*/

function deleteGroupFromDB(id, groupingId) {
  return fetch("/deleteGroup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: auth2.currentUser.get().getAuthResponse().id_token
    },
    body: JSON.stringify({
      id,
      groupingId
    })
  }).then(res => res.json())
}

function saveNewGrouping(grouping, id) {
  return fetch("/addGrouping", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: auth2.currentUser.get().getAuthResponse().id_token
    },
    body: JSON.stringify({
      id,
      grouping
    })
  }).then(res => res.json())
}

async function completeGroupAdd() {
  startLoad()
  const validateResult = validateGroups()
  if (validateResult.valid) {
    const grouping = constructGroupingFromUI()
    const saveResult = await saveNewGrouping(grouping, state.info.id)
    if (saveResult.status) {
      classes[state.info.id].obj.groupings.push(grouping)
      showClass(state.info.id)
      setState(4, {id: state.info.id})
    }
  } else {
    createError(validateResult.error)
  }
  endLoad()
}

function getGroupingInfo(grouping) {
  try {
    value = 1
    newName = `[${value}]${grouping.name}`
    for(const group of classes[state.info.id].obj.groupings) {
      if(group.name === newName) {
        value++
        newName = `[${value}]${grouping.name}`
      }
    }
    
    return {
      id: md5(newName),
      name: newName,
      groups: Array.from(grouping.groups),
      excluded: Array.from(grouping.excluded)
    }
  } catch {
    Console.WriteLine("Failure")
  }
}



function saveEditedGrouping(grouping, oldId, id) {
  console.log("geg")
  console.log(grouping)
  console.log(oldId)
  console.log(id)
  return fetch("/editGrouping", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: auth2.currentUser.get().getAuthResponse().id_token
    },
    body: JSON.stringify({
      id,
      oldId,
      grouping
    })
  }).then(res => res.json())
}

async function completeGroupEdit() {
  startLoad()
  const validateResult = validateGroups()
  if (validateResult.valid || validateResult.error === "Duplicate Grouping Name" && groupNameInput.value === initialName) {
    groupNameInput.classList.remove("invalid")
    const grouping = constructGroupingFromUI()
    const saveResult = await saveEditedGrouping(grouping, state.info.groupingId, state.info.id)
    if (saveResult.status) {
      addGroupingToList(grouping)
      classes[state.info.id].obj.groupings = classes[state.info.id].obj.groupings.filter(grouping => grouping.id != state.info.groupingId)
      classes[state.info.id].obj.groupings.push(grouping)
      showClass(state.info.id)
      setState(4, {id: state.info.id})
    }
  } else {
    createError(validateResult.error)
  }
  endLoad()
}


var initialName = "" // Initial Value of the group name when edited.
function editGrouping(grouping) {
  if (grouping) {
    statusTitle.innerText = "Edit Group"
    groupNameInput.value = ""
    clearDiv(ungroupedStudentsListDiv)
    clearDiv(excludedStudentsListDiv)
    clearDiv(groupScatter)
    for (const student of classes[state.info.id].obj.students) {
      const studentContainer = document.createElement("div")
      studentContainer.classList = "student-name-container"
      studentContainer.innerText = `${student.first} ${student.middle ? `${student.middle}. ` : ""}${student.last}`
      studentContainer.id = student.id
      studentContainer.addEventListener("click", () => {
        if (!state.info.student) {
          openAcceptStudent(studentContainer)
        }
      })
      ungroupedStudentsListDiv.appendChild(studentContainer)
    }
    for (const student of grouping.excluded) {
      for (const addedStudent of Array.from(ungroupedStudentsListDiv.children)) {
        if (addedStudent.id == student) {
          excludedStudentsListDiv.appendChild(addedStudent)
        }
      }
    }
    setGroups(grouping.groups)
    groupNameInput.value = grouping.name
    initialName = grouping.name
    switchSection(editGroupSection)
    setState(6, {id: state.info.id, groupingId: grouping.id})
  } else {
    statusTitle.innerText = "Create Grouping"
    groupNameInput.value = ""
    clearDiv(ungroupedStudentsListDiv)
    clearDiv(excludedStudentsListDiv)
    clearDiv(groupScatter)
    for (const student of classes[state.info.id].obj.students) {
      const studentContainer = document.createElement("div")
      studentContainer.classList = "student-name-container"
      studentContainer.innerText = `${student.first} ${student.middle ? `${student.middle}. ` : ""}${student.last}`
      studentContainer.id = student.id
      studentContainer.addEventListener("click", () => {
        if (!state.info.student) {
          openAcceptStudent(studentContainer)
        }
      })
      ungroupedStudentsListDiv.appendChild(studentContainer)
    }
    groupNameInput.classList.remove("invalid")
    switchSection(editGroupSection)
    setState(5, {id: state.info.id, currentGroup:null})
  }
}

function getRandomGroups(type, num, id, excluded) {
  return fetch("/randomGroups", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: auth2.currentUser.get().getAuthResponse().id_token
    },
    body: JSON.stringify({
      id,
      type,
      num,
      excluded
    })
  }).then(res => res.json())
}

function showArrangeStudentsModal() {
  createModal("tall", (modal, exit) => {
    modal.classList.add("arrange-options-modal")
    const title = document.createElement("h1")
    title.classList = "medium"
    title.innerText = "Choose an Arrangement"
    const optionsDiv = document.createElement("div")
    const random = document.createElement("button")
    random.classList = "button"
    random.innerText = "Random"
    random.addEventListener("click", () => {
      exit()
      createModal("tall", (m, e) => {
        m.classList.add("random-options-modal")
        const groupNumForm = document.createElement("form")
        groupNumForm.innerHTML += "<p>Create</p>"
        const groupNum = document.createElement("input")
        groupNum.required = true
        groupNum.id = "group-num-input"
        groupNumForm.appendChild(groupNum)
        groupNumForm.innerHTML += "<p>groups</p>"

        const or = document.createElement("h1")
        or.classList = "medium"
        or.innerText = "OR"

        const studentNumForm = document.createElement("form")
        studentNumForm.innerHTML += "<p>Create groups of</p>"
        const studentNum = document.createElement("input")
        studentNum.required = true
        studentNum.id = "student-num-input"
        studentNumForm.appendChild(studentNum)
        studentNumForm.innerHTML += "<p>students</p>"

        const submit = document.createElement("button")
        submit.classList = "button"
        submit.innerText = "Submit"
        const singleInput = (e) => {
          let gNum = document.getElementById("group-num-input")
          let sNum = document.getElementById("student-num-input")
          if ((e.target == gNum && gNum.value) || sNum.value != +sNum.value || sNum.value < 1) {
            sNum.value = ""
          }
          if ((e.target == sNum && sNum.value) || gNum.value != +gNum.value || gNum.value < 1) {
            gNum.value = ""
          }
        }
        submit.addEventListener("click", async () => {
          startLoad()
          let gNum = document.getElementById("group-num-input")
          let sNum = document.getElementById("student-num-input")
          const groupsResult = await getRandomGroups(gNum.value ? 0 : 1, gNum.value ? +gNum.value : +sNum.value, state.info.id, Array.from(excludedStudentsListDiv.children).map(e => e.id))
          setGroups(groupsResult.groups)
          document.removeEventListener("input", singleInput)
          e()
          endLoad()
        })

        m.appendChild(groupNumForm)
        m.appendChild(or)
        m.appendChild(studentNumForm)
        m.appendChild(submit)
        
        document.addEventListener("input", singleInput)
      })
    })
    const genetic = document.createElement("button")
    genetic.classList = "button"
    genetic.innerText = "Preferences"
    genetic.addEventListener("click", () => {
      exit()
      createModal("tall", (m, e) => {
        m.classList.add("random-options-modal")
        const groupNumForm = document.createElement("form")
        groupNumForm.innerHTML += "<p>Create</p>"
        const groupNum = document.createElement("input")
        groupNum.required = true
        groupNum.id = "group-num-input"
        groupNumForm.appendChild(groupNum)
        groupNumForm.innerHTML += "<p>groups</p>"

        const or = document.createElement("h1")
        or.classList = "medium"
        or.innerText = "OR"

        const studentNumForm = document.createElement("form")
        studentNumForm.innerHTML += "<p>Create groups of</p>"
        const studentNum = document.createElement("input")
        studentNum.required = true
        studentNum.id = "student-num-input"
        studentNumForm.appendChild(studentNum)
        studentNumForm.innerHTML += "<p>students</p>"

        const submit = document.createElement("button")
        submit.classList = "button"
        submit.innerText = "Submit"
        const singleInput = (e) => {
          let gNum = document.getElementById("group-num-input")
          let sNum = document.getElementById("student-num-input")
          if ((e.target == gNum && gNum.value) || sNum.value != +sNum.value || sNum.value < 1) {
            sNum.value = ""
          }
          if ((e.target == sNum && sNum.value) || gNum.value != +gNum.value || gNum.value < 1) {
            gNum.value = ""
          }
        }
        submit.addEventListener("click", async () => {
          startLoad()
          let gNum = document.getElementById("group-num-input")
          let sNum = document.getElementById("student-num-input")
          const includedStudents = classes[state.info.id].obj.students.filter(student => !Array.from(excludedStudentsListDiv.children).map(e => e.id).includes(student.id))

          const groupsResult = startGenetic(includedStudents, classes[state.info.id].obj.preferences, gNum.value ? +gNum.value : +sNum.value, gNum.value ? true : false)
          setGroups(groupsResult)
          document.removeEventListener("input", singleInput)
          e()
          endLoad()
        })

        m.appendChild(groupNumForm)
        m.appendChild(or)
        m.appendChild(studentNumForm)
        m.appendChild(submit)
        
        document.addEventListener("input", singleInput)
      })
    })

    modal.appendChild(title)
    optionsDiv.appendChild(random)
    optionsDiv.appendChild(genetic)
    modal.appendChild(optionsDiv)
  })
}

function addGroup() {
  const groupContainer = document.createElement("div")
  groupContainer.classList.add("group-container")
  const groupName = document.createElement("h1")
  groupName.classList = "medium"
  groupName.innerText = `Group ${Array.from(groupScatter.children).length}`
  const closeGroup = document.createElement("i")
  closeGroup.classList = "fa fa-times close-group"
  const studentList = document.createElement("div")
  studentList.classList = "group-student-list"
  closeGroup.addEventListener("click", () => {
    for (const student of Array.from(studentList.children)) {
      addList(student, ungroupedStudentsListDiv)
    }
    groupScatter.removeChild(groupContainer)
    normalizeGroupTitles()
  })
  groupContainer.appendChild(groupName)
  groupContainer.appendChild(closeGroup)
  groupContainer.appendChild(studentList)
  groupScatter.insertBefore(groupContainer, addGroupBtn)
  return groupContainer
}

function setGroups(groups) {
  for (const group of Array.from(groupScatter.children)) {
    if (group.id != "add-group") {
      for (const student of Array.from(group.children[2].children)) {
        ungroupedStudentsListDiv.appendChild(student)
      }
    }
  }
  clearDiv(groupScatter)
  for (let i = 0; i < groups.length; i++) {
    const groupContainer = addGroup()
    for (const student of groups[i].ids) {
      groupContainer.children[2].appendChild(Array.from(ungroupedStudentsListDiv.children).find(e => e.id == student))
    }
  }
}

function normalizeGroupTitles() {
  const groups = Array.from(groupScatter.children)
  for (let i = 0; i < groups.length-1; i++) {
    if (groups[i].id != "add-group") {
      groups[i].children[0].innerText = `Group ${i+1}`
    }
  }
}

function constructGroupingFromUI() {
  const groupObjs = []
  const excludedObjs = []
  for(const idList of Array.from(groupScatter.children).filter(e => e.id != "add-group").map(e => Array.from(e.children[2].children).map(s => s.id))){
    groupObjs.push({ids:idList, row:-1, col:-1})
  }
  for(const idList of Array.from(excludedStudentsListDiv.children).map(e => e.id)){
    excludedObjs.push({ids:idList, row:-1, col:-1})
  }

  return {
    id: md5(groupNameInput.value),
    name: groupNameInput.value,
    groups: groupObjs,
    excluded: excludedObjs
  }
}

function validateGroups() {
  if (groupNameInput.value) {
    groupNameInput.classList.remove("invalid")
  } else {
    groupNameInput.classList.add("invalid")
    return {valid: false, error: "Please fill out all fields"}
  }

  if (Object.values(classes).map(c => c.obj.groupings).flat().map(grouping => grouping.name).includes(groupNameInput.value)) {
    groupNameInput.classList.add("invalid")
    return {valid: false, error: "Duplicate Grouping Name"}
  }

  if (Array.from(groupScatter.children).length == 1) {
    return {valid: false, error: "Please add at least one group"}
  }

  return {valid: true}
}


function showActionsModal(grouping,groupingContainer){
  //shows a modal that has the actions that can be done on a grouping
  createModal("tall", (modal, exit) => {
    modal.classList.add("show-actions-modal")
    const title = document.createElement('h1')
    title.id = "show-actions-modal-title"
    title.innerText = grouping.name

    const btnDiv = document.createElement("div")
    //All option buttons
    const exportBtn = document.createElement('button')
    exportBtn.innerText = "Export for Zoom"

    const duplicateBtn = document.createElement('button')
    duplicateBtn.innerText = "Duplicate Grouping"

    const viewGroupsBtn = document.createElement('button')
    viewGroupsBtn.innerText = "Seating Chart"

    const archiveGroupBtn = document.createElement('button')
    archiveGroupBtn.innerText = "Archive Grouping"

    const deleteBtn = document.createElement('button')
    deleteBtn.innerText = "Delete Grouping"
    deleteBtn.id = "delete-group-button"

    //button event listeners
    viewGroupsBtn.addEventListener("click", async (e) =>{
      e.stopPropagation()
      exit()
      seatingChart(grouping)
    })

    deleteBtn.addEventListener("click", async (e) => {
      e.stopPropagation()
      exit()
      startLoad()
      const deleteResult = await deleteGroupFromDB(state.info.id, grouping.id)
      console.log(deleteResult)
      if (deleteResult.status) {
        groupingsList.removeChild(groupingContainer)
        const deleteIndex = classes[state.info.id].obj.groupings.find(g => g.id == grouping.id)
        classes[state.info.id].obj.groupings.splice(deleteIndex, 1)
      } else {
        createError(deleteResult.error)
      }
      endLoad()
    })
    let csvText = "Pre-assign Room Name,Email Address\n"
    for (let i = 0; i < grouping.groups.length; i++) {
      console.log(grouping.groups)
      for (const stu of grouping.groups[i].ids) {
        csvText += `group${i+1},${classes[state.info.id].obj.students.find(s => s.id == stu).email}\n`
      }
    }

    exportBtn.addEventListener("click", async (e) => {
      e.stopPropagation()
      downloadCSV(`${grouping.name}.csv`, csvText)
    })
    duplicateBtn.addEventListener("click", async (e) => {
      e.stopPropagation()
      exit()
      const copyGrouping = getGroupingInfo(grouping)
      const saveResult = await saveNewGrouping(copyGrouping, state.info.id)
      if(saveResult.status) {
        classes[state.info.id].obj.groupings.push(copyGrouping)
        showClass(state.info.id)
        setState(4, {id: state.info.id})
      }
    

    })
    //adding all buttons to modal
    modal.appendChild(title)
    modal.appendChild(btnDiv)
    btnDiv.appendChild(exportBtn)
    btnDiv.appendChild(duplicateBtn)
    btnDiv.appendChild(viewGroupsBtn)
    btnDiv.appendChild(archiveGroupBtn)
    btnDiv.appendChild(deleteBtn)
    
  })
}

function openAcceptStudent(student) {
  student.classList.add("selected")
  state.info.student = student
  for (const group of Array.from(groupScatter.children)) {
    if (group.id != "add-group" && student.parentNode != group.children[2]) {
      group.children[2].classList.add("accepting")
      group.children[2].addEventListener("click", acceptStudent)
    }
  }
  if (student.parentNode != ungroupedStudentsListDiv) {
    ungroupedStudentsListDiv.classList.add("accepting")
    ungroupedStudentsListDiv.addEventListener("click", acceptStudent)
  }
  if (student.parentNode != excludedStudentsListDiv) {
    excludedStudentsListDiv.classList.add("accepting")
    excludedStudentsListDiv.addEventListener("click", acceptStudent)
  }
  document.addEventListener("click", closeOutsideClick)
} 

function closeOutsideClick(e) {
  let close = true
  for (const group of Array.from(groupScatter.children)) {
    if (group.id != "add-group" && group.children[2].contains(e.target)) {
      close = false
    }
  }
  if (ungroupedStudentsListDiv.contains(e.target)) {
    close = false
  } else if (excludedStudentsListDiv.contains(e.target)) {
    close = false
  }

  if (close) {
    closeAcceptStudent()
  }
}

function closeAcceptStudent(e) {
  for (const group of Array.from(groupScatter.children)) {
    if (group.id != "add-group") {
      group.children[2].classList.remove("accepting")
      group.children[2].removeEventListener("click", acceptStudent)
    }
  }
  ungroupedStudentsListDiv.classList.remove("accepting")
  ungroupedStudentsListDiv.removeEventListener("click", acceptStudent)
  excludedStudentsListDiv.classList.remove("accepting")
  excludedStudentsListDiv.removeEventListener("click", acceptStudent)
  setTimeout(() => {
    state.info.student.classList.remove("selected")
    state.info.student = null
  }, 500)
  document.removeEventListener("click", closeOutsideClick)
}

function acceptStudent(e) {
  addList(state.info.student, e.currentTarget)
  closeAcceptStudent()
}

function addGroupingToList(grouping) {
  const groupingContainer = document.createElement("div")
  groupingContainer.classList.add("grouping-container")
  groupingContainer.id = grouping.id

  const groupingName = document.createElement("p")
  groupingName.innerText = `${grouping.name} (${grouping.groups.length})`

  const menuIcon = document.createElement("i")
  menuIcon.id = "menu-icon"
  menuIcon.classList = "fas fa-sliders-h"
  //"fas fa-ellipsis-v" //vertical ellipse
  //"fas fa-sliders-h" //sliders (current)
  

  //method to open dropdown
  menuIcon.addEventListener("click", async (e) => {
    e.stopPropagation()
    showActionsModal(grouping, groupingContainer)
  })
  groupingContainer.addEventListener("click", () => {
    editGrouping(grouping)
  })

  

  groupingContainer.appendChild(groupingName)
  groupingContainer.appendChild(menuIcon)
  groupingsList.appendChild(groupingContainer)
} 


createGroupBtn.addEventListener("click", () => {editGrouping()})

saveGroupBtn.addEventListener("click", async () => {
  if (state.mode == 5) {
    await completeGroupAdd()
  } else if (state.mode == 6) {
    await completeGroupEdit()
  }
})

arrangeStudentsBtn.addEventListener("click", showArrangeStudentsModal)


addGroupBtn.addEventListener("click", addGroup)

function downloadCSV(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}