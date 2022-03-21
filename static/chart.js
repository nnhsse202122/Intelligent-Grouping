let selectedGroup = null;
let selectedChild = null;

//expand and hide menu
document.getElementById('chart-button').addEventListener('click', function(){
    this.classList.toggle('active')
    document.getElementById('chart-sidebar').classList.toggle('active')
})

//all the code for the seating chart of groups 
function seatingChart(grouping){
    statusTitle.innerText = "Seating Chart"
    switchSection(seatingChartSection)
    setState(7, {id: state.info.id, groupingId: grouping.id, currentGroup:grouping})
    const groups = getGroups(grouping)
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
    const nameGroups = [];
    for(let i = 0; i < grouping.groups.length; i++){
        const list = [...grouping.groups[i]];
        list.unshift(i+1);
        nameGroups.push(list);
    }
    
    //changing from ids to names
    for(const student of classes[state.info.id].obj.students){
        for(const group of nameGroups){
            
            for(let i = 0; i < group.length; i++){
                //console.log(`STU: ${student.id} vs GROUP: ${group[i]}`)
                if(student.id == group[i]){
                    group[i] = student; //changes it to a student OBJECT (not string)
                }
            }
            
        }
    }
    
    return nameGroups;
}

function populateSidebar(groups){
    const seatingChartSidebar = document.getElementById('chart-sidebar')
    const MAX_STUDENTS_DISPLAYED = 3 //how many student names are shown before it is cut off by ellipse (...)
    let groupNum = 1; //current group being displauyed
    for(const group of groups){
        const groupDiv = document.createElement('div')
        groupDiv.classList.add("chart-sidebar-group-div")
        groupDiv.id = `group-${groupNum}`

        const groupName = document.createElement("h1")
        groupName.classList.add("chart-sidebar-header")
        groupName.innerText = `Group ${groupNum}`
        groupDiv.appendChild(groupName)

        const studentCount = document.createElement('h2')
        studentCount.classList.add('chart-student-count')
        let plural = ""
        if(group.length-1 > 1){
            plural = "s"
        }
        studentCount.innerText = `${group.length} Student${plural}`
        groupDiv.appendChild(studentCount)

        let displayed = 0
        let isShortened = false;
        for(const student of group){
            if(student == group[0]){
              continue; //skipping the group number
            }
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
            selectedGroup = null;
            selectedChild = null;
            groupDiv.style.borderColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--dark')
          } else {
            selectedGroup = group;

            unhighlightPrevious();
            selectedChild = groupDiv;
            groupDiv.style.borderColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--accent')
          }
        });
        seatingChartSidebar.appendChild(groupDiv)
        groupNum++
    }
}

function unhighlightPrevious(){
  if(selectedChild){
    selectedChild.style.borderColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--dark')
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
        unhighlightPrevious();
        
        selectedGroup = JSON.parse(box.getAttribute("grouping"))
        selectedChild = box.querySelector(".grid-group-container")
        selectedChild.style.borderColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent')
      } else if (selectedGroup) {
        createGridGroup(selectedGroup,selectedB)
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
  title.innerText = `Group ${group[0]}:`;

  const namesList = document.createElement('ul');
  namesList.classList.add('grid-names-list');

  for(let i = 1; i < group.length;i++){
    const studentName = document.createElement('li');
    const student = group[i];
    studentName.innerText = `${student.first} ${student.last[0]}`;
    studentName.classList.add('grid-name');
    namesList.appendChild(studentName);
  }
  gridGroupContainer.appendChild(title);
  gridGroupContainer.appendChild(namesList);
  box.appendChild(gridGroupContainer);
  box.setAttribute("grouping", JSON.stringify(group));
}

