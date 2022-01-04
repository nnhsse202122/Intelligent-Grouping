const loadingBar = document.getElementById("loading-bar")
const formSection = document.getElementById("form-sec")
const formContainer = document.getElementById("form-container")
const classTitle = document.getElementById("class-title")
const periodTitle = document.getElementById("period-title")
const submit = document.getElementById("submit")
const studentIdInput = document.getElementById("student-id-input")
const completeSection = document.getElementById("complete-sec")

startLoad()

const form = window.location.pathname.split("/").slice(2, 4)
fetch(`/formData?user=${form[0]}&class=${form[1]}`).then(res => res.json()).then(async (data) => {
  console.log(data)
  if (data.status) {
    document.title = data.className
    classTitle.innerText = `${data.className}`
    periodTitle.innerText = `Period ${data.period}`
    for (const preference of data.preferences) {
      const preferenceContainer = document.createElement("div")
      const preferenceTitle = document.createElement("h1")
      preferenceContainer.appendChild(preferenceTitle)
      if (preference.type == "studentLike") {
        preferenceTitle.innerText = `Preferred Students for ${preference.category}`
        preference.inputs = []
        for (let i = 0; i < preference.numChoices; i++) {
          const select = createDynamicSelect(`Pick Student #${i+1}`, data.students.map(s => [s.name, s.id]))
          preference.inputs.push(select)
          preferenceContainer.appendChild(select)
        }
        
      } else if (preference.type == "studentDislike") {
        preferenceTitle.innerText = `Unpreferred Students for ${preference.category}`
        preference.inputs = []
        for (let i = 0; i < preference.numChoices; i++) {
          const select = createDynamicSelect(`Pick Student #${i+1}`, data.students.map(s => [s.name, s.id]))
          preference.inputs.push(select)
          preferenceContainer.appendChild(select)
        }
      } else if (preference.type == "topicLike") {
        preferenceTitle.innerText = `Preferred Topics for ${preference.category}`
        preference.inputs = []
        for (let i = 0; i < preference.numChoices; i++) {
          const select = createDynamicSelect(`Pick Topic #${i+1}`, preference.topics.map(topic => [topic, topic]))
          preference.inputs.push(select)
          preferenceContainer.appendChild(select)
        }
      } else if (preference.type == "topicDislike") {
        preferenceTitle.innerText = `Unpreferred Topics for ${preference.category}`
        preference.inputs = []
        for (let i = 0; i < preference.numChoices; i++) {
          const select = createDynamicSelect(`Pick Topic #${i+1}`, preference.topics.map(topic => [topic, topic]))
          preference.inputs.push(select)
          preferenceContainer.appendChild(select)
        }
      }

      
      formContainer.insertBefore(preferenceContainer, submit)
    }
    
    submit.addEventListener("click", async () => {
      const validateResult = validateForm(data)
      if (validateResult.status) {
        data.preferences.map(preference => {
          preference.inputs = preference.inputs.map(input => input.value)
        })
        const saveResult = await saveStudentPreferences(form[0], form[1], studentIdInput.value, data.preferences)
        if (saveResult.status) {
          hideFade(formSection)
          showFade(completeSection)
          setTimeout(() => {
            formSection.style.display = "none"
          }, 300)
        } else {
          createError(saveResult.error)
        }
      } else {
        createError(validateResult.error)
      }
    })

    showFade(formSection)
    endLoad()
  }
})

function createDynamicSelect(placeholder, options) {
  const select = document.createElement("select")
  select.required = true
  select.classList = "form-select"

  const placeholderOption = document.createElement("option")
  placeholderOption.disabled = true
  placeholderOption.selected = true
  placeholderOption.value = ""
  placeholderOption.innerText = placeholder

  select.appendChild(placeholderOption)

  for (const option of options) {
    const selectOption = document.createElement("option")
    selectOption.innerText = option[0]
    selectOption.value = option[1]
    select.appendChild(selectOption)
  }

  return select
}

function validateForm(data) {
  studentIdInput.classList.remove("invalid")

  if (studentIdInput.value == "") {
    studentIdInput.classList.add("invalid")
    return {status: false, error: "Student ID cannot be empty."}
  }

  if (!data.students.map(s => s.id).includes(md5(studentIdInput.value))) {
    studentIdInput.classList.add("invalid")
    return {status: false, error: "Student ID not found."}
  }

  let valid = true

  for (const preference of data.preferences) {
    for (const input of preference.inputs) {
      input.classList.remove("invalid")
      if (input.value == "") {
        input.classList.add("invalid")
        valid = false
      }
    }
  }

  if (!valid) {
    return {status: false, error: "Please fill out all fields."}
  }

  return {status: true}
}

function saveStudentPreferences(userId, classId, studentId, preferences) {
  return fetch("/saveStudentPreferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId: userId,
      id: classId,
      studentId: studentId,
      preferences: preferences
    })
  }).then(res => res.json())
}