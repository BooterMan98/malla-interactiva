
class HomologatedRamo extends Ramo {

    constructor(name, sigla, credits, sector, prer, id, malla, creditsSCT = 0, isCustom=false, dictatesIn = "", homologations= [], hologationType=1) {
        super(name, sigla, credits, sector, prer, id, malla, creditsSCT, isCustom, dictatesIn);
        this.isCustom = isCustom;
        this.homologations = homologations;
        this.homologated = false
        this.homologationType = hologationType
    }   

    drawActions(posX, posY, sizeX, sizeY) {
        super.drawActions(posX, posY, sizeX, sizeY);
        this.ramo.append("rect")
            .attr("x", posX)
            .attr("y", posY)
            .attr("width", sizeX)
            .attr("height", sizeY)
            .attr("stroke", 'purple')
            .attr("stroke-width", '7')
            .attr("opacity", this.homologated ? "0.8" : "0.001")
            .attr("fill-opacity", "0.001")
            .attr("class", "selected");
    }

    // acciones a realizar cuando se clickea el ramo
    isBeingClicked() {
        if (!this.homologated || this.homologationType === 2) {
            this.approveRamo()
            this.malla.verifyPrer();
        }

    }

    checkHomologatability(approvedSubjects) {
        if (this.homologations.length == 0) {
            return false
        }
        for (let homologation of this.homologations) {
           let hasSujectToHomologate = approvedSubjects.find((subject) => subject == homologation)
            if (hasSujectToHomologate) {
                return true
            }
        }
        return false
    }

    // se selecciona o deselecciona el ramo con su respectiva animación
    homologateRamo() {
        if (!this.isCustom) {
            this.ramo.select(".selected").transition().delay(20).attr("opacity", ".8");
            let cross = this.ramo.select(".cross").select("path")
            // let rect = this.ramo.select("rect")
            //     let positionx = Number(rect.attr("x"));
            //     let positiony = Number(rect.attr("y"));

            //     let sizey = Number(rect.attr("height")) / 2
            //     let sizex = Number(rect.attr("width")) / 2
            //     let enterx = positionx + sizex;
            //     let entery = positiony + sizey;
            cross.attr("stroke", "purple")
            // cross
            //     .attr("transform", `rotate(90,${enterx}, ${entery})`);
    }
        this.homologated = true;
        if (this.homologationType === 1 && !this.approved) {
            this.approveRamo()
        }
        this.verifyPrer()
    };

    deHomologateRame() {
        if (!this.isCustom) {
            this.ramo.select(".selected").transition().delay(20).attr("opacity", "0.01");
            this.ramo.select(".cross").select("path")
            //     .attr("transform", null)
                .attr("stroke","#550000")
        }
        this.homologated = false;
        if (this.approved) {
            this.approveRamo()
        }
        this.verifyPrer()
    }

    verifyPrer() {
        if (!this.homologated) {
            super.verifyPrer()
            return
        }
        this.ramo.select(".non-approved").transition().delay(20).attr("opacity", "0.0");
    }

    // activa la animación de warning con el color que se desee
    showWarning(warningColor = "red") {
        if (!this.isCustom) {
            this.ramo.select(".selected").attr('stroke',warningColor);
            let animation = this.ramo.select(".selected").transition().duration(200).attr("opacity", ".8")
                .transition().duration(150).attr("opacity", ".5")
                .transition().duration(150).attr("opacity", ".8")
                .transition().duration(200).attr("opacity", ".001")
                .attr('stroke','green');
            if (this.selected) {
                animation.transition().attr("opacity", ".8")
            }
        }
    }
}