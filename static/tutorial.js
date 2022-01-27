openTutorial.addEventListener("click", () => {
  statusTitle.innerText = "Help"
  switchSection(tutorialSection)
})

const accordions = document.getElementsByClassName('accordion-item')

for (i = 0; i < accordions.length; i++) {
  accordions[i].addEventListener('click', function(){
    this.classList.toggle('active')
  })
}