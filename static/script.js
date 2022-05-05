// (() => {
// Elements \\

//-------\\

// Data (local) \\
let classes = {}
let state = {mode: 0, info: {}}
/*
0 = logged out
1 = dashboard
2 = adding class manually
3 = editing class manually
4 = class view
5 = create group
6 = edit group
7 = seating chart
8 = student responses overview
*/
//-------\\

startLoad()

function setState(mode, info={}) {
  state.mode = mode
  state.info = info
}

function resetApp() {
  username.innerText = ""
  clearDiv(classListDiv)
  switchSection(welcomeSection)
  classes = []
}