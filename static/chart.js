//all the code for the seating chart of groups 
function seatingChart(grouping){
    statusTitle.innerText = "Seating Chart"
    switchSection(seatingChartSection)
    setState(7, {id: state.info.id, groupingId: grouping.id, currentGroup:grouping})
    populateSidebar(getGroups(grouping))
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
    // TEMP \\
    seatingChartSidebar = document.createElement('div')
    seatingChartSection.appendChild(seatingChartSidebar)
    console.log("populateSidebar() currently putting all sidebar groups on the main area for testing, change this in chart.js")
    //      \\
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