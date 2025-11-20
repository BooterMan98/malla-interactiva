
class MallaManager {
    constructor(malla, homologatedMalla = null) {
    this.malla = malla;
    this.homologatedMalla = homologatedMalla;
    this.homologatedRamos = []
    }

    renderHomologateMalla() {
      console.log(this.homologatedMalla.hasSetCarrerPromise)
      if (this.homologatedMalla.hasSetCarrerPromise != null) {
        console.log("not null")
        this.homologatedMalla.hasSetCarrerPromise.then(() => {
      console.log("Rendering homologated malla")
          document.getElementsByClassName("homologatedMalla")[0].textContent = ""
          this.homologatedMalla.drawMalla(".homologatedMalla")
          this.homologatedMalla.showColorDescriptions(".hologated-color-description")
          this.homologatedMalla.enablePrerCheck()
          this.homologatedMalla.defineHomologatedRamos(this.malla.APPROVED)
          document.getElementsByClassName("homologatedMalla")[0].scrollIntoView({behavior: "smooth", block: "start"})
        })
      } else {
        this.homologatedMalla.defineHomologatedRamos(this.malla.getApprovedSubjects())
      }
    }

    updatedHomologatedRamos() {
    
    }
}