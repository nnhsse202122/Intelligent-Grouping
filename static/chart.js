
let selectedGroup = null;

//expand and hide menu
document.getElementById('chart-button').addEventListener('click', function(){
    this.classList.toggle('active')
    document.getElementById('chart-sidebar').classList.toggle('active')
})


//all the code for the seating chart of groups 
function seatingChart(grouping){
    statusTitle.innerText = "Seating Chart"
    groupNumber = 1
    switchSection(seatingChartSection)
    setState(7, {id: state.info.id, groupingId: grouping.id, currentGroup:grouping})
    const groups = getGroups(grouping)
    //clearSidebar()
    populateSidebar(groups)
    if(chartGrid.children.length <= 0) {
        createGrid(5,8); // Note that this only runs if the grid class in HTML has no child elements
    }
    //all testing of grid groups below
}


//expand and hide menu
document.getElementById('chart-button').addEventListener('click', function(){
  this.toggle('active')
  document.getElementById('chart-sidebar').classList.toggle('active')
})


//returns a list of groups filled with student objects
function getGroups(grouping){
    //making deep copy of groups for names
    const groups = [];
    for(let i = 0; i < grouping.groups.length; i++){
        const groupObj = grouping.groups[i];
        const group = {ids:[...groupObj.ids], row:groupObj.row, col:groupObj.col};
        groups.push(group);
    }
    
    //changing from ids to names
    for(const student of classes[state.info.id].obj.students){
        for(const group of groups){
            
            for(let i = 0; i < group.ids.length; i++){
                //console.log(`STU: ${student.id} vs GROUP: ${group[i]}`)
                if(student.id == group.ids[i]){
                    group.ids[i] = student; //changes it to a student OBJECT (not string)
                }
            }
            
        }
    }
    
    return groups;
}

function populateSidebar(groups){

    const seatingChartSidebar = document.getElementById('chart-sidebar')

    const MAX_STUDENTS_DISPLAYED = 3 //how many student names are shown before it is cut off by ellipse (...)
    for(const group of groups){
        const groupDiv = document.createElement('div')
        groupDiv.classList.add("chart-sidebar-group-div")
        groupDiv.id = `group-${groupNumber}`

        const groupName = document.createElement("h1")
        groupName.classList.add("chart-sidebar-header")
        groupName.innerText = `Group ${groupNumber}`
        groupDiv.appendChild(groupName)

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
          selectedGroup = group;
          console.log(selectedGroup)
        });
        seatingChartSidebar.appendChild(groupDiv)
        groupNumber+= 1
    }
}

function clearSidebar() { //fix later lol
  const seatingChartSidebar = document.getElementById('chart-sidebar')
  while (seatingChartSidebar.firstChild) {
    seatingChartSidebar.removeChild(seatingChartSidebar.firstChild);
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
      div.setAttribute('row',row) // The divs created for each box have two attributes, their row position and col position
      div.setAttribute('col',col) // Both positions run from 0 - 5
      chartGrid.appendChild(div);
    }
  }
  let boxes = document.querySelectorAll(".box");

  Array.from(boxes, function(box) {
    box.addEventListener("click", function() {
      console.log(`[${box.getAttribute('row')}][${box.getAttribute('col')}]`)
      let selectedB = getBox(box.getAttribute('row'),box.getAttribute('col'))
      if(box.querySelector(".grid-group-container")) {
        const removed = box.removeChild(box.querySelector(".grid-group-container"))
        const name = removed.children[1].children[0].innerText
        const firstName;
        const lastInitial;
        firstName,lastInitial = name.split(' ');
        for(const group of groups){
          const splitName = group.ids[0].split(' ')
          //if(&&){}
        }
        groupNumber--
      } else {
        createGridGroup(selectedGroup,selectedB)
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
  const title = document.createElement('h1');
  title.classList.add("grid-group-title");
  title.innerText = `${groupNumber}:`;
  groupNumber++;

  const namesList = document.createElement('ul');
  namesList.classList.add('grid-names-list');

  for(let i = 1; i < group.ids.length;i++){
    const studentName = document.createElement('li');
    const student = group.ids[i];
    studentName.innerText = `${student.first} ${student.last[0]}`;
    studentName.classList.add('grid-name');
    namesList.appendChild(studentName);
  }

  group.row =box.attributes.row.value;
  group.col = box.attributes.col.value;
  gridGroupContainer.appendChild(title);
  gridGroupContainer.appendChild(namesList);
  box.appendChild(gridGroupContainer);
}

function loadGroupsToChart(groups){
  const sidebarGroups = [];
  for(const group of groups){
    console.log(group.row, group.col)
    if(group.row == -1 && group.col == -1){
      sidebarGroups.push(group);
    }
    else{
      createGridGroup(group, getBox(group.row,group.col));
    }
  }
  console.log(sidebarGroups);
  populateSidebar(sidebarGroups);
  console.log("GROUPS LOADED");
}

function saveGroupsFromChart(){
  //druh
}