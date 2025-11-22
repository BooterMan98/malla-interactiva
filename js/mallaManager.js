
class MallaManager {
    constructor(malla, homologatedMalla = null) {
    this.malla = malla;
    this.homologatedMalla = homologatedMalla;
    this.homologatedRamos = []
    }

    renderHomologateMalla() {
      if (this.homologatedMalla.hasSetCarrerPromise != null) {
        this.homologatedMalla.hasSetCarrerPromise.then(() => {
          let approvedList = this.malla.APPROVED.map( subject => subject.sigla)
          if (this.homologatedMalla.isMallaRendered) {
            this.homologatedMalla.defineHomologatedRamos(approvedList)
            let homologatedMallaElement = document.getElementsByClassName("homologatedMalla")[0]
            homologatedMallaElement.scrollIntoView({behavior: "smooth", block: "center"})
            return
          }
          document.getElementsByClassName("homologatedMalla")[0].textContent = ""
          this.homologatedMalla.drawMalla(".homologatedMalla")
          this.homologatedMalla.showColorDescriptions(".hologated-color-description")
          this.homologatedMalla.enablePrerCheck()
          this.homologatedMalla.defineHomologatedRamos(approvedList)
          let homologatedMallaElement = document.getElementsByClassName("inset-overlay-content")[0]
          let homologatedRows = document.getElementsByClassName("homologatedRow")
          for (let row of homologatedRows) {
            row.classList.remove("d-none")
          }
          document.getElementById("homologate").textContent = "Reflejar cambios";
          homologatedMallaElement.scrollIntoView({behavior: "smooth", block: "start"})
        })
      }
    }

    updatedHomologatedRamos() {
    
    }
}