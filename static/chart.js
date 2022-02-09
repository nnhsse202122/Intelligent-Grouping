//all the code for the seating chart of groups 
function seatingChart(grouping){
    statusTitle.innerText = "Seating Chart"
    switchSection(seatingChartSection)
    setState(7, {id: state.info.id, groupingId: grouping.id, currentGroup:grouping})
    if(document.querySelector('.grid').children.length <= 0) {
      createGrid(6); // Note that this only runs if the grid class in HTML has no child elements
    }
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


function createGrid(size)
{
  for(let row = 0; row < size; row++) {
    for(let col = 0; col < size; col++) {
      let div = document.createElement("div");
      div.className = `box`;
      console.log("test")
      document.querySelector('.grid').appendChild(div);
    }
  }
}