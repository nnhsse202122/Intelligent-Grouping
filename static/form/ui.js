let modalExit

function createModal(size, construct, cancel = () => {}) {
  const blind = document.createElement("div")
  blind.classList = "modal-blind"
  const modal = document.createElement("div")
  modal.classList = `modal ${size}`
  const close = document.createElement("i")
  close.classList = "fa fa-times modal-close"
  modalExit = () => {
    hideFade(blind)
    hideFade(modal)
    setTimeout(() => {
      app.removeChild(blind)
      app.removeChild(modal)
    }, 300)
    cancel()
  }
  blind.addEventListener("click", modalExit)
  close.addEventListener("click", modalExit)
  modal.appendChild(close)
  app.appendChild(blind)
  construct(modal, modalExit)
  app.appendChild(modal)
  blind.offsetHeight
  modal.offsetHeight
  showFade(blind)
  showFade(modal)
  return modalExit
}

function clearDiv(div) {
  for (const child of Array.from(div.children)) {
    if (!child.classList || !child.classList.contains("persist")) {
      div.removeChild(child)
    }
  }
}

function getNodeHeight(node, target) {
  let height, clone = node.cloneNode(true)
  let parentClone = document.createElement("div")
  parentClone.style.cssText = `height:${target.clientHeight}; width: ${target.clientWidth}; position:fixed; top:-9999px; opacity:0;`
  parentClone.appendChild(clone)
  document.body.appendChild(parentClone)
  height = clone.clientHeight
  parentClone.parentNode.removeChild(parentClone)
  return height
}

function showFade(element) {
  element.classList.add("visible")
}

function hideFade(element) {
  element.classList.remove("visible")
}

function switchSection(to) {
  const sections = Array.from(document.getElementsByClassName("section"))
  for (const section of sections) {
    if (section != to) {
      hideFade(section)
    }
  }
  showFade(to)
}

function removeList(element) {
  element.style.height = element.clientHeight + "px"
  element.style.opacity = 1
  element.offsetHeight
  element.classList.add("hidden")
  setTimeout(() => {
    element.parentNode.removeChild(element)
  }, 300)
}

function addList(element, target) {
  const height = getNodeHeight(element, target)
  element.classList.add("hidden")
  element.style.height = height + "px"
  target.appendChild(element)
  element.offsetHeight
  element.classList.remove("hidden")
  setTimeout(() => {
    element.style.height = "auto"
  }, 300)
}

function createError(errorText) {
  const errorElement = document.createElement("p")
  errorElement.classList = "error"
  errorElement.innerText = "Error: " + errorText
  document.body.appendChild(errorElement)
  errorElement.offsetHeight
  errorElement.style.top = "55px"
  setTimeout(() => {
    errorElement.style.top = "0"
    setTimeout(() => {
      document.body.removeChild(errorElement)
    }, 600)
  }, 5000)
}

async function loadAround(func) {
  startLoad()
  await func()
  endLoad()
}

async function startLoad() {
  clearTimeout(resetLoadTimeout)
  loadingBar.style.width = "30%"
  loadingBar.style.opacity = 1
  loadingBar.style.height = "4px"
}

async function endLoad() {
  loadingBar.style.width = "100%"
  setTimeout(() => {
    loadingBar.style.height = 0
    loadingBar.style.opacity = 0
    resetLoadTimeout = setTimeout(() => {
      loadingBar.style.width = 0
      setTimeout(() => {
        loadingBar.style.opacity = 1
        loadingBar.style.height = "4px"
      }, 500)
    }, 500)
  }, 750)
}

function createPlaceholderInput(text, inputClassName, value="") {
  const labelContainer = document.createElement("label")
  labelContainer.classList = "label"
  const input = document.createElement("input")
  input.classList.add("input")
  input.classList.add(inputClassName)
  input.required = true
  input.value = value
  const span = document.createElement("span")
  span.innerText = text
  labelContainer.appendChild(input)
  labelContainer.appendChild(span)
  return labelContainer
}

let resetLoadTimeout