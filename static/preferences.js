function showAddPreferenceModal() {
  createModal("tall", (modal, exit) => {
    modal.classList.add("add-preference-modal")
    const choiceTitle = document.createElement("h1")
    choiceTitle.innerText = "Choice"
    const choicesDropdown = document.createElement("select")
    const placeholder = document.createElement("option")
    placeholder.innerText = "Choose Type"
    placeholder.disabled = true
    placeholder.selected = true
    placeholder.required = true
    placeholder.value = ""
    placeholder.style.color = "var(--accent)"
    placeholder.style.fontWeight = "500"
    choicesDropdown.appendChild(placeholder)
    choicesDropdown.style.fontWeight = "500"
    const choices = {
      studentLike: "Preferred Students",
      studentDislike: "Unpreferred Students",
      topicLike: "Preferred Topic",
      topicDislike: "Unpreferred Topic"
    }
    const availableChoices = Object.keys(choices).filter(c => !classes[state.info.id].obj.preferences.includes(c))
    for (const choice of availableChoices) {
      const choiceOption = document.createElement("option")
      choiceOption.innerText = choices[choice]
      choiceOption.value = choice
      choicesDropdown.appendChild(choiceOption)
    }

    const additionalData = document.createElement("div")

    modal.appendChild(choiceTitle)
    modal.appendChild(choicesDropdown)
    modal.appendChild(additionalData)
    
    let selected
    let dataInputs = []

    choicesDropdown.addEventListener("change", (e) => {
      additionalData.innerHTML = ""
      dataInputs = []

      if (["studentLike", "studentDislike"].includes(choicesDropdown.value)) {
        const categoryName = createPlaceholderInput("Category")
        dataInputs.push(categoryName.children[0])
        const numChoicesInput = createPlaceholderInput("# Choices", "numChoices")
        dataInputs.push(numChoicesInput.children[0])
        additionalData.appendChild(categoryName)
        additionalData.appendChild(numChoicesInput)
      } else if (["topicLike", "topicDislike"].includes(choicesDropdown.value)) {
        const categoryName = createPlaceholderInput("Category")
        dataInputs.push(categoryName.children[0])
        const numChoicesInput = createPlaceholderInput("# Choices", "numChoices")
        dataInputs.push(numChoicesInput.children[0])
        const topicsTextarea = document.createElement("textarea")
        topicsTextarea.placeholder = "Topics (new-line separated)"
        topicsTextarea.classList = "topics"
        dataInputs.push(topicsTextarea)
        additionalData.appendChild(categoryName)
        additionalData.appendChild(numChoicesInput)
        additionalData.appendChild(topicsTextarea) 
      }
     
      if (!selected) {
        const infoTitle = document.createElement("h1")
        infoTitle.innerText = "Info"
        choicesDropdown.after(infoTitle)
        selected = true
        const add = document.createElement("button")
        add.classList = "button"
        add.innerText = "Add Choice"
        modal.appendChild(add)

        add.addEventListener("click", () => {
          if (["studentLike", "studentDislike"].includes(choicesDropdown.value)) {
            dataInputs[0].classList.remove("invalid")
            dataInputs[1].classList.remove("invalid")

            if (dataInputs[0].value === "") {
              createError("Category cannot be blank.")
              dataInputs[0].classList.add("invalid")
              return
            }

            if (dataInputs[1].value === "" || dataInputs[1].value != +dataInputs[1].value) {
              createError("# Choices must be a number.")
              dataInputs[1].classList.add("invalid")
              return
            }

            if (classes[state.info.id].obj.preferences.map(p => p.id).includes(md5(choicesDropdown.value + dataInputs[0].value))) {
              createError("Duplicate Choice")
              return
            }

            completeAddPreference({
              id: md5(choicesDropdown.value + dataInputs[0].value),
              type: choicesDropdown.value,
              category: dataInputs[0].value,
              numChoices: dataInputs[1].value
            }, exit)

          } else if (["topicLike", "topicDislike"].includes(choicesDropdown.value)) {
            dataInputs[0].classList.remove("invalid")
            dataInputs[1].classList.remove("invalid")
            dataInputs[2].classList.remove("invalid")

            if (dataInputs[0].value === "") {
              createError("Category cannot be blank.")
              dataInputs[0].classList.add("invalid")
              return
            }

            if (dataInputs[1].value === "" || dataInputs[1].value != +dataInputs[1].value) {
              createError("# Choices must be a number.")
              dataInputs[1].classList.add("invalid")
              return
            }

            if (dataInputs[2].value === "" || dataInputs[2].value.replace(/ /g, "") === "") {
              createError("Topics cannot be blank.")
              dataInputs[2].classList.add("invalid")
              return
            }

            if (classes[state.info.id].obj.preferences.map(p => p.id).includes(md5(choicesDropdown.value + dataInputs[0].value))) {
              createError("Duplicate Choice")
              return
            }

            completeAddPreference({
              id: md5(choicesDropdown.value + dataInputs[0].value),
              type: choicesDropdown.value,
              category: dataInputs[0].value,
              numChoices: dataInputs[1].value,
              topics: dataInputs[2].value.split("\n")
            }, exit)
          }
        })
      }
    })
  })
}

async function completeAddPreference(preference, modalExit) {
  startLoad()
  const saveResult = await savePreference(preference)
  if (saveResult.status) {
    classes[state.info.id].obj.preferences.push(preference)
    addPreferenceToList(preference)
    modalExit()
  } else {
    createError(saveResult.error)
  }
  endLoad()
}

async function savePreference(preference) {
  return fetch("/addPreference", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: auth2.currentUser.get().getAuthResponse().id_token
    },
    body: JSON.stringify({
      id: state.info.id,
      preference: preference
    })
  }).then(res => res.json())
}

function addPreferenceToList(preference) {
  const preferenceContainer = document.createElement("div")
  preferenceContainer.classList.add("preference-container")
  preferenceContainer.id = `${preference.id}`
  const preferenceType = document.createElement("p")
  const choices = {
    studentLike: "Preferred Students",
    studentDislike: "Unpreferred Students",
    topicLike: "Preferred Topic",
    topicDislike: "Unpreferred Topic"
  }
  preferenceType.innerText = `${choices[preference.type]} - ${preference.category} (${preference.numChoices})`
  const deletePreference = document.createElement("i")
  deletePreference.classList = "fa fa-times fa-2x"

  // preferenceContainer.addEventListener("click", () => {
  //   editGrouping(grouping)
  // })

  deletePreference.addEventListener("click", async (e) => {
    e.stopPropagation()
    startLoad()
    const deleteResult = await deletePreferenceFromDB(state.info.id, preference.id)
    if (deleteResult.status) {
      preferencesList.removeChild(preferenceContainer)
      const deleteIndex = classes[state.info.id].obj.preferences.find(p => p.id == preference.id)
      classes[state.info.id].obj.preferences.splice(deleteIndex, 1)
    } else {
      createError(deleteResult.error)
    }
    endLoad()
  })

  preferenceContainer.appendChild(preferenceType)
  preferenceContainer.appendChild(deletePreference)
  preferencesList.appendChild(preferenceContainer)
}

function deletePreferenceFromDB(id, preferenceId) {
  return fetch("/deletePreference", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: auth2.currentUser.get().getAuthResponse().id_token
    },
    body: JSON.stringify({
      id: id,
      preferenceId: preferenceId
    })
  }).then(res => res.json())
}

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}

async function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  await navigator.clipboard.writeText(text)
}

let blinkTimeout
let textTimeout
async function formLink() {
  await copyTextToClipboard(`${window.location.origin}/form/${currentUser.sub}/${state.info.id}/`)
  copyFormLink.style.animation = "blink 0.15s alternate infinite ease"
  copyFormLink.innerText = "Copied!"
  clearTimeout(blinkTimeout)
  clearTimeout(textTimeout)
  blinkTimeout = setTimeout(() => {
    copyFormLink.style.animation = "none"
  }, 600)
  textTimeout = setTimeout(() => {
    copyFormLink.innerText = "Copy Form Link"
  }, 1500)
}

addPreference.addEventListener("click", showAddPreferenceModal)
copyFormLink.addEventListener("click", formLink)