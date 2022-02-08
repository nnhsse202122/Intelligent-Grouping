//all the code for the seating chart of groups 
function seatingChart(grouping){
    statusTitle.innerText = "Seating Chart"
    switchSection(seatingChartSection)
    setState(7, {id: state.info.id, groupingId: grouping.id, currentGroup:grouping})
}

window.addEventListener("DOMContentLoaded", function() {
    let boxes = document.querySelectorAll(".box");
  
    Array.from(boxes, function(box) {
      box.addEventListener("click", function() {
        alert(this.classList[1]);
        // On box click function here for when we need to move groups to click location
      });
    });
  });

function createGrid()
{
    for(let row = 0; row < 6; row++) {
        for(let col = 0; col < 6; col++) {
            let div = document.createElement("div");
            let place = div.classList.add(`box [${row}][${col}]`);
            div.appendChild(place);
            grid.appendChild(div); // Trying to append div to grid
        }
    }
}