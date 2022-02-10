//all the code for the seating chart of groups 
function seatingChart(grouping){
    statusTitle.innerText = "Seating Chart"
    switchSection(seatingChartSection)
    setState(7, {id: state.info.id, groupingId: grouping.id, currentGroup:grouping})
    if(document.querySelector('.grid').children.length <= 0) {
      createGrid(6); // Note that this only runs if the grid class in HTML has no child elements
    }
}

/***
 * Creates a grid of interactable boxes
 * @param size The X and Y dimension of the box
 */
function createGrid(size)
{
  for(let row = 0; row < size; row++) {
    for(let col = 0; col < size; col++) {
      let div = document.createElement("div");
      div.className = `box`;
      div.setAttribute('row',row) // The divs created for each box have two attributes, their row position and col position
      div.setAttribute('col',col) // Both positions run from 0 - 5
      document.querySelector('.grid').appendChild(div);
    }
  }
  let boxes = document.querySelectorAll(".box");

  Array.from(boxes, function(box) {
    box.addEventListener("click", function() {
      console.log(`[${box.getAttribute('row')}][${box.getAttribute('col')}]`)
    });
  });
}