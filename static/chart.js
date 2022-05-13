let groups = null;

let selectedGroup = null
let selectedChild = null
let selectedB = null


//expand and hide menu
document.getElementById('chart-button').addEventListener('click', function(){
    this.classList.toggle('active')
    chartSidebar.classList.toggle('active')
})


//all the code for the seating chart of groups 
function seatingChart(grouping){
    statusTitle.innerText = "Seating Chart"
    unhighlightSidebarAndGrid()
    switchSection(seatingChartSection)
    setState(7, {id: state.info.id, groupingId: grouping.id, currentGroup:grouping})
    groups = getGroups(grouping)

    destroyGrid();
    createGrid(5,8);

    clearContents(false)
    loadGroupsToChart(groups);
}

function clearSidebar(){
  const groupDivs = document.getElementsByClassName('chart-sidebar-group-div')
  const length = groupDivs.length
  for(let i = 0; i < length; i++){
    groupDivs[0].remove()
  }
}


//move groups back to sidebar
chartSidebar.addEventListener("click", function() {
  if (selectedChild && selectedChild.classList.contains("grid-group-container")) {

    populateSidebar([selectedGroup])
    const name = selectedChild.children[0].innerText
    const topName = name.split('\n')[0]; //first name and last initial (ie. Ryan B)
    
    console.log(topName)
    for(const group of groups){
      if(topName == group.ids[0].first + ' ' + group.ids[0].last[0]){
        group.row = -1
        group.col = -1
        console.log("MATCH FOUND")
        break;
      }
    }
    selectedGroup = null
    selectedChild.remove() 
    selectedChild = null
    unhighlightSidebarAndGrid()
  }
});

//returns a list of groups filled with student objects
function getGroups(grouping){
    //making deep copy of groups for names
    const newGroups = [];
    for(let i = 0; i < grouping.groups.length; i++){
        const groupObj = grouping.groups[i];
        const group = {ids:[...groupObj.ids], row:groupObj.row, col:groupObj.col};
        newGroups.push(group);
    }
    //changing from ids to names
    for(const student of classes[state.info.id].obj.students){
        for(const group of newGroups){
            
            for(let i = 0; i < group.ids.length; i++){
                //console.log(`STU: ${student.id} vs GROUP: ${group[i]}`)
                if(student.id == group.ids[i]){
                    group.ids[i] = student; //changes it to a student OBJECT (not string)
                }
            }
            
        }
    }
    
    return newGroups;
}


function populateSidebar(sidebarGroups){
    const seatingChartSidebar = chartSidebar
    const MAX_STUDENTS_DISPLAYED = 3 //how many student names are shown before it is cut off by ellipse (...)
    for(const group of sidebarGroups){

        const groupDiv = document.createElement('div')
        groupDiv.classList.add("chart-sidebar-group-div")
        //groupDiv.id = `group-${groupNumber}`
        /*
        const groupName = document.createElement("h1")
        groupName.classList.add("chart-sidebar-header")
        groupName.innerText = `Group ${groupNumber}`
        groupDiv.appendChild(groupName)
        */

        const studentCount = document.createElement('h2')
        studentCount.classList.add('chart-student-count')
        let plural = ""
        if(group.ids.length-1 > 1){
            plural = "s"
        }
        studentCount.innerText = `${group.ids.length} Student${plural}`
        groupDiv.appendChild(studentCount)

        let displayed = 0
        let isShortened = false;
        for(const student of group.ids){
            if(displayed >= MAX_STUDENTS_DISPLAYED){
                isShortened = true;
                break;
            }
            const studentText = document.createElement('p')
            studentText.innerText = student.first + " " + student.last[0]
            studentText.classList.add("chart-sidebar-text")
            groupDiv.appendChild(studentText)
            displayed++
        }
        const ellipseEnd = document.createElement('p')
        ellipseEnd.innerText = " "
        ellipseEnd.classList = "chart-sidebar-ellipse"
        if(isShortened){
            ellipseEnd.innerText = "..."
        }
        groupDiv.appendChild(ellipseEnd)
        groupDiv.addEventListener("click", function() {

          if(selectedGroup == group){
            selectedGroup = null
            selectedChild = null
            groupDiv.style.borderColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--dark')
          } else {
            highlightGrid()
            selectedGroup = group
            unhighlightPrevious()
            selectedChild = groupDiv
            groupDiv.style.borderColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--accent')
          }
        });
        seatingChartSidebar.appendChild(groupDiv)
        
    }
}

//todo: fix confusing function names xd
function unhighlightPrevious(){
  if(selectedChild){
    selectedChild.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--dark')
    unhighlightSidebarAndGrid()
  }
}

function highlightSidebar(){
  chartSidebar.style.cursor = "pointer"
  chartSidebar.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--accent')
} function unhighlightSidebar(){
  chartSidebar.style.cursor = "auto"
  chartSidebar.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--dark')
}
function highlightGrid(){
  const boxes = document.getElementsByClassName('box')
  for(box of boxes){
    box.style.cursor = "pointer"
  }
} function unhighlightGrid(){
  const boxes = document.getElementsByClassName('box')
  for(box of boxes){
    box.style.cursor = "auto"
  }
}

resetChartBtn.addEventListener("click", async () => {
  clearContents(true)
})

function clearContents(isClick) {
  let rows = document.querySelector('.grid').style.getPropertyValue('--rowSize')
  let cols = document.querySelector('.grid').style.getPropertyValue('--colSize')
  
  for(let r = 0; r < rows; r++)
  {
    for(let c = 0; c < cols; c++)
    {
      clearBox(r,c);
    }
  }
  if(isClick) {
    for(const group of groups){
      group.row = -1
      group.col = -1
    }
  }

    clearSidebar();
    unhighlightSidebarAndGrid()
    if(isClick){
      populateSidebar(groups);
    }
  
}

/***
 * Creates a grid of interactable boxes
 * @param rows The amount of rows in the grid
 * @param columns The amount of columns in the grid
 */
function createGrid(rows,columns)
{
  document.querySelector('.grid').style.setProperty('--rowSize', rows) // Changes Grid size in CSS
  document.querySelector('.grid').style.setProperty('--colSize', columns) // Changes Grid size in CSS
  for(let row = 0; row < rows; row++) {
    for(let col = 0; col < columns; col++) {
      let div = document.createElement("div");
      div.className = `box`;
      div.setAttribute('row',row)
      div.setAttribute('col',col)
      chartGrid.appendChild(div);
    }
  }
  let boxes = document.querySelectorAll(".box");

  Array.from(boxes, function(box) {
    box.addEventListener("click", function() {

      const clickedB = getBox(box.getAttribute('row'),box.getAttribute('col'))
      const clickedChild = box.querySelector(".grid-group-container")
      if (clickedChild) {
        unhighlightPrevious()
        const clickedGroup = JSON.parse(box.getAttribute("grouping"))
        if (selectedGroup && selectedGroup[0] == clickedGroup[0]) {
          unhighlightSidebarAndGrid()
          selectedGroup = null
          selectedChild = null
        } else if (selectedGroup && selectedB){ //swap groups
          console.log("swap groups")
          selectedChild.remove()
          createGridGroup(clickedGroup,selectedB)
          // changing db values
          const name = clickedChild.children[0].innerText
          const topName = name.split('\n')[0]; //first name and last initial (ie. Ryan B
          console.log(topName)
          for(const group of groups){
            if(topName == group.ids[0].first + ' ' + group.ids[0].last[0]){
              group.row = -1
              group.col = -1
              console.log("MATCH FOUND")
              break;
            }
          }
          clickedChild.remove()
          //
          createGridGroup(selectedGroup,clickedB)
          unhighlightSidebarAndGrid()
          selectedGroup = null
          selectedChild = null
        } else {
        highlightSidebar()
        highlightGrid()
        selectedGroup = clickedGroup
        selectedChild = clickedChild
        selectedChild.style.borderColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent')
        selectedB = clickedB
        }
      } else if (selectedGroup) {
        unhighlightSidebarAndGrid()
        createGridGroup(selectedGroup,clickedB)
        selectedGroup = null
        selectedChild.remove()
        selectedChild = null
      }
    });
  });
}

/**
 * Gets rid of all current boxes inside of the grid
 */
 function destroyGrid()
 {
   while(chartGrid.firstChild)
   {
     chartGrid.removeChild(chartGrid.firstChild)
   }
 }

/**
 * 
 * @param row the row of the box in the seating chart grid 
 * @param col the column of the box in the seating chart grid
 * @returns the DOM div of the box in the seating chart grid
 */
function getBox(row,col){
  if(row < 0 || col < 0){
    throw `box at row ${row}, column ${col} is out of bounds`
  }
  let currentRow = 0;
  let currentCol = 0;
  let foundBox = null;
  for(const box of chartGrid.children){
    currentRow = box.attributes.row.value;
    currentCol = box.attributes.col.value;
    if(currentRow == row && currentCol== col){
      foundBox = box;
      break;
    }
  }
  return foundBox;
}

function clearBox(row,col){
  const box = getBox(row,col);
  if(box.firstChild){
    box.removeChild(box.firstChild);
    return true;
  }
  return false;
}

/**
 * Displays a group on the grid, scaling by size
 * @param group The group to be displayed
 */
function createGridGroup(group, box){
  const gridGroupContainer = document.createElement('div');
  gridGroupContainer.classList.add('grid-group-container');

  const namesList = document.createElement('ul');
  namesList.classList.add('grid-names-list');

  for(let i = 0; i < group.ids.length;i++){
    const studentName = document.createElement('li');
    const student = group.ids[i];
    studentName.innerText = `${student.first} ${student.last[0]}`;
    studentName.classList.add('grid-name');
    namesList.appendChild(studentName);
  }
  group.row = box.attributes.row.value;
  group.col = box.attributes.col.value;
  gridGroupContainer.appendChild(namesList);
  box.appendChild(gridGroupContainer);
  box.setAttribute("grouping", JSON.stringify(group));
}

// unhighlight functions:

function unhighlightPrevious(){
  if(selectedChild){
    selectedChild.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--dark')
    unhighlightSidebarAndGrid()
  }
}

function unhighlightSidebarAndGrid(){
  unhighlightSidebar()
  unhighlightGrid()
}
function highlightSidebar(){
  chartSidebar.style.cursor = "pointer"
  chartSidebar.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-dark')
} function unhighlightSidebar(){
  chartSidebar.style.cursor = "auto"
  chartSidebar.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--dark')
  selectedB = null
}
function highlightGrid(){
  const boxes = document.getElementsByClassName('box')
  for(box of boxes){
    box.style.cursor = "pointer"
  }
} function unhighlightGrid(){
  const boxes = document.getElementsByClassName('box')
  for(box of boxes){
    box.style.cursor = "auto"
  }
}

function loadGroupsToChart(chartGroups){
  const sidebarGroups = [];
  
  for(const group of chartGroups){
    
    if(group.row == -1 && group.col == -1){
      sidebarGroups.push(group);
    }
    else{
      createGridGroup(group, getBox(group.row,group.col));
    }
  }
  
  populateSidebar(sidebarGroups);
  
}

function saveGroupsFromChart(){
  const changedGroups = [];
  for(const group of groups){
    const studentIds = [];
    for(const stuObj of group.ids){
      studentIds.push(stuObj.id);
    }
    changedGroups.push({
      ids:studentIds,
      row:group.row,
      col:group.col,
    });
  }
  
  const oldGroup = classes[state.info.id].obj.groupings.find(g => g.id == state.info.groupingId);
  
  const newGrouping = {
    id:oldGroup.id,
    name:oldGroup.name,
    excluded:oldGroup.excluded,
    groups:changedGroups,
  };
  return fetch("/editGrouping", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: auth2.currentUser.get().getAuthResponse().id_token
    },
    body: JSON.stringify({
      id: state.info.id,
      oldId: state.info.groupId,
      grouping: newGrouping,
    })
  }).then(res => res.json())
}

//REFERENCE COMPLETE GROUP ADD TO SEE HOW TO MAKE LOADING METHOD
saveChartBtn.addEventListener("click", async () => {
  startLoad()
  await saveGroupsFromChart();
  endLoad();
})

