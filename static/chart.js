//all the code for the seating chart of groups 
function seatingChart(grouping){
    statusTitle.innerText = "Seating Chart"
    switchSection(seatingChartSection)
    setState(7, {id: state.info.id, groupingId: grouping.id, currentGroup:grouping})
    const groups = getGroups(grouping)
    //populateSidebar(groups)
    if(chartGrid.children.length <= 0) {
        createGrid(5,8); // Note that this only runs if the grid class in HTML has no child elements
    }
    createGridGroup(groups[0], getBox(2,2))
}

//returns a list of groups filled with student objects
function getGroups(grouping){
    //making deep copy of groups for names
    const nameGroups = [];
    for(const group of grouping.groups){
        nameGroups.push([...group])
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
    const seatingChartSidebar = document.createElement('div') //temp PLS CHANGE JONATHAN
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
        if(group.length > 1){
            plural = "s"
        }
        studentCount.innerText = `${group.length} Student${plural}`
        groupDiv.appendChild(studentCount)

        let displayed = 0
        let isShortened = false;
        for(const student of group){
            if(displayed >= MAX_STUDENTS_DISPLAYED){
                isShortened = true;
                break
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
        seatingChartSidebar.appendChild(groupDiv)
        groupNum++
    }
    
}

/***
 * Creates a grid of interactable boxes
 * @param rows The amount of rows in the grid
 * @param columns The amount of columns in the grid
 */
function createGrid(rows,columns)
{
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

/**
 * Displays a group on the grid, scaling by size
 * @param group The group to be displayed
 */
function createGridGroup(group, box){
  const gridGroupContainer = document.createElement('div');
  const title = document.createElement('h1');
  const namesDiv = document.createElement('div');

  
}