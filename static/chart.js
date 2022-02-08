//all the code for the seating chart of groups 
function seatingChart(grouping){
    statusTitle.innerText = "Seating Chart"
    switchSection(seatingChartSection)
    setState(7, {id: state.info.id, groupingId: grouping.id, currentGroup:grouping})
    getGroups(grouping)
}

function getGroups(grouping){
    //making deep copy of groups for names
    const nameGroups = [];
    for(const group of grouping.groups){
        nameGroups.push(...group)
    }
    console.log(nameGroups)
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
    console.log(nameGroups);
}