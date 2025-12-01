let width = 100;
let height = 100;

class Ramo {
    static get width() {
        return width
    }

    static get height() {
        return height
    }

    static getDisplayWidth(scaleX) {
        return width * scaleX;
    }

    static getDisplayHeight(scaleY){
        return height * scaleY;
    }


    constructor(name, sigla, credits, category, prer = [], id, malla, creditsSCT = 0, isCustom = false, dictatesIn="") {
        // Propiedades del ramo
        this.name = name;
        this.sigla = sigla;
        this.credits = credits;
        this.category = category;
        this.prer = new Set(prer);
        if (creditsSCT){
            this.creditsSCT = creditsSCT
            this.USMtoSCT = false
        } else {
            this.creditsSCT = Math.round(credits * 5 / 3)
            this.USMtoSCT = true
        }
        this.dictatesIn = dictatesIn

        // Propiedades para renderizado e interacciones
        this.malla = malla
        this.isCustom = isCustom
        this.beenEdited= false
        this.id = id;
        this.ramo = null;
        this.approved = false;
        //console.log(this.category)
    }

    // Auto explanatorio
    getSCTCredits() {
        return this.creditsSCT
    }

    // Auto explanatorio
    getUSMCredits() {
        return this.credits;
    }

    // Actualiza uno o ambos créditos dependiendo de los valores de entrada
    updateCredits(creditsUSM, creditsSCT = 0) {
        this.credits = creditsUSM
        if (creditsSCT)
            this.creditsSCT = creditsSCT
        else
            this.creditsSCT = Math.round(creditsUSM * 5 / 3)
    }

    // Retorna los creditos del tipo correcto según como el usuario lo pida
    getDisplayCredits() {
        if (this.malla.sct) {
            return  this.getSCTCredits()
        } else {
            return this.getUSMCredits()
        }
    }

    // renderiza el ramo
    draw(canvas, posX, posY, scaleX, scaleY) {
        this.ramo = canvas.append('g')
            .attr("cursor", "pointer")
            .attr("role", "img")
            .classed("subject", true)
            // .attr("alt", "Texto de prueba")
            .attr('id', this.sigla);
        // Se establecen tamaños
        let sizeX = this.constructor.getDisplayWidth(scaleX),
            sizeY = this.constructor.getDisplayHeight(scaleY);
        let graybar = sizeY / 5;
        let credits = this.getDisplayCredits(this.credits);
        let color = this.malla.categories[this.category][0]

        let dictatesIn = {"":"¿ambos semestres?", "P": "semestres pares", "I": "semestres impares", "A": "ambos semestres"}
        let prers = ""
        let prerSize = this.prer.size - 1
        let counter = 0
        this.prer.forEach(prer => {
            if (counter === 0)
                prers += prer
            else if (counter === prerSize)
                prers += " y " + prer
            else
                prers += ", " + prer
            counter +=1
        })
        this.ramo.append("title").text(
            "Ramo " + this.sigla+ ", " + this.name+ ". Este ramo tiene " +
            this.getSCTCredits() + " créditos SCT. Se dicta en " + dictatesIn[this.dictatesIn] + " y "
            + (this.prer.size ? "tiene como prerrequisitos a " + prers : "no tiene prerrequisitos") + ".")

        this.ramo.append("rect")
            .attr("x", posX)
            .attr("y", posY)
            .attr("width", sizeX )
            .attr("height", sizeY)
            .attr("fill", color);

        // above bar
        this.ramo.append("rect")
            .attr("x", posX)
            .attr("y", posY)
            .attr("width", sizeX )
            .attr("height", graybar)
            .attr("fill", '#6D6E71')
            .classed('bars', true);

        // below bar
        this.ramo.append("rect")
            .attr("x", posX)
            .attr("y", posY + sizeY - graybar)
            .attr("width", sizeX )
            .attr("height", graybar)
            .attr("fill", '#6D6E71')
            .classed('bars', true);

        // credits rect
        this.ramo.append("rect")
            .attr("x", posX + sizeX  - 22 * scaleX)
            .attr("y", posY + sizeY - graybar)
            .attr("width", 20 * scaleX)
            .attr("height", graybar)
            .attr("fill", 'white');

        // texto créditos
        this.ramo.append("text")
            .attr("x", posX + sizeX  - 22 * scaleX + 20 * scaleX / 2)
            .attr("y", posY + sizeY - graybar / 2)
            .text(credits)
            .attr("font-weight", "regular")
            .attr("fill", "black")
            .attr("dominant-baseline", "central")
            .attr("text-anchor", "middle")
            .attr("font-size", 12 * scaleY);

        // Nombre ramo
        this.ramo.append("text")
            .attr("x", posX + sizeX  / 2)
            .attr("y", posY + sizeY / 2)
            .attr("dy", 0)
            .text(this.name)
            .attr("class", "ramo-label")
            .attr("fill", () => {
                if (this.needsWhiteText(color))
                    return "white";
                return '#222222';
            })
            .attr("font-size", 13)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central");

        // Sigla
        this.ramo.append("text")
            .attr("x", posX + 2)
            .attr("y", posY + 10)
            .attr("dominant-baseline", "central")
            .text(this.sigla)
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .attr("font-size", scaleX < 0.85 ? 11 : 12);

        // Indicador the semestres
        if (this.dictatesIn === "P" || this.dictatesIn === "I") {
            this.ramo.append("text")
                .attr("x", posX + sizeX - (scaleX < 0.85 ? 25 : 30))
                .attr("y", posY + 10)

                .attr("dominant-baseline", "central")
                .attr("text-anchor", "middle")
                .text(this.dictatesIn)
                .attr("font-weight", "bold")
                .attr("fill", "yellow")
                .attr("font-size", scaleX < 0.85 ? 11 : 12);
        }
        this.drawActions(posX, posY, sizeX, sizeY);


        // id
        this.ramo.append("circle")
            .attr("cx", posX + sizeX  - 10)
            .attr("cy", posY + graybar / 2)
            .attr("fill", "white")
            .attr("r", 8);
        this.ramo.append("text")
            .attr("x", posX + sizeX  - 10)
            .attr("y", posY + graybar / 2)
            .attr("dominant-baseline", "central")
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr('font-size', 10)
            .text(this.id);

        // prerr circles!
        this.drawPrers(posX, posY, sizeX, sizeY, scaleX);
        this.createActionListeners();
        this.wrap(sizeX - 5, sizeY / 5 * 3);
    }

    drawPrers(posX, posY, sizeX, sizeY, scaleX, graybar = sizeY / 5) {
        let c_x = 0;
        let prerGroup = this.ramo.append("foreignObject");
            prerGroup.attr("x", posX)
            prerGroup.attr("y", posY + sizeY - graybar)
            prerGroup.attr("width", sizeX  - 22 * scaleX)
            prerGroup.attr("height", graybar);
        prerGroup = prerGroup.append("xhtml:div")
        prerGroup.classed("prer-container", true)
        prerGroup = prerGroup.append("svg")
            prerGroup.attr("width", 5)
            prerGroup.attr("height", graybar);

        let startF1RPath = "M18 18 H9 A 9 9 0 0 1 9 0 h18 Z"
        let endF1RPath = "M0 0 H9 A 9 9 0 0 1 9 17 H0 Z"

        this.prer.forEach((p) => {
            let r = 9,
                fontsize = 10,
                variantX = 5;
            let variantY = 5;
            if (scaleX < 0.83) {
                r--;
                fontsize--;
                variantX = 1;
                variantY--;
            }

            if (p.constructor === Array) {

                let pLength = p.length
                p.forEach((subPrer, index) => {
                    prerGroup.attr("width", (r + 1) * 2 + Number(prerGroup.attr("width")));

                    let startF1RPath = `M${r * 2 + c_x + 1 + variantX} ${graybar / 2 + r} H${r + 1 + c_x + variantX} A ${r} ${r} 0 0 1 ${r + 1 + c_x + variantX} ${graybar / 2 - r} H${r * 2 + 1 + c_x + variantX} Z`
                    let midF1RPath = `M${1 + c_x + variantX} ${graybar / 2 - r} H${r * 2 + c_x + 1 + variantX} V${graybar / 2 + r} H${1 + c_x + variantX} Z`
                    let endF1RPath = `M${1 + c_x + variantX} ${graybar / 2 - r} H${r + 1 + c_x + variantX} A ${r} ${r} 0 0 1 ${r + 1 + c_x + variantX} ${graybar / 2 + r} H${1 + c_x + variantX} Z`

                    let prerColor = this.malla.categories[this.malla.ALLSUBJECTS[subPrer].category][0]
                    let pPath = index === 0 ? startF1RPath : (index === pLength - 1 ? endF1RPath : midF1RPath)

                    let prer = prerGroup.append("g")
                    prer.append("path")
                        .attr('d', pPath)
                        .attr('fill', prerColor)
                        .attr('stroke', 'white');
                    prer.append('text')
                        .attr('x',1 + r + c_x + variantX)
                        .attr('y', graybar / 2)
                        .text(this.malla.ALLSUBJECTS[subPrer].id)
                        .attr("dominant-baseline", "central")
                        .attr("text-anchor", "middle")
                        .attr("font-size", fontsize)
                        .attr("dy", 0)
                        .attr('fill', () => {
                            if (this.needsWhiteText(prerColor))
                                return "white";
                            return '#222222';
                        });

                    c_x += r * 2;
                })

            } else {
            prerGroup.attr("width", (r + 1) * 2 + Number(prerGroup.attr("width")));

            let prerColor = this.malla.categories[this.malla.ALLSUBJECTS[p].category][0]
            let prer = prerGroup.append("g")
            prer.append("circle")
                .attr('cx', r + c_x + 1 + variantX)
                .attr('cy', graybar / 2)
                .attr('r', r)
                .attr('fill', prerColor)
                .attr('stroke', 'white');
            prer.append('text')
                .attr('x',1 + r + c_x + variantX)
                .attr('y', graybar / 2)
                .text(this.malla.ALLSUBJECTS[p].id)
                .attr("dominant-baseline", "central")
                .attr("text-anchor", "middle")
                .attr("font-size", fontsize)
                .attr("dy", 0)
                .attr('fill', () => {
                    if (this.needsWhiteText(prerColor))
                        return "white";
                    return '#222222';
                });
            c_x += r * 2;
            }
        });
    
    }

    // renderiza las animaciones de interacción
    drawActions(posX, posY, sizeX, sizeY) {
        if (this.ramo == null)
            return null;

        this.ramo.append("rect")
            .attr("x", posX)
            .attr("y", posY)
            .attr("width", sizeX)
            .attr("height", sizeY)
            .attr("fill", 'white')
            .attr("opacity", "0.001")
            .attr("class", "non-approved");

        let cross = this.ramo.append('g').attr("class", "cross").attr("opacity", 0);
        cross.append("path")
            .attr("d", "M" + posX + "," + posY + "L" + (posX + sizeX) + "," + (posY + sizeY))
            .attr("stroke", "#550000")
            .attr("stroke-width", 9);
    }

    // Crea las reacciones a las interacciones del usuario
    createActionListeners() {
        this.ramo.on("click", () => this.isBeingClicked());
    }

    // se llama cuando se pulsa del ramo
    isBeingClicked() {
        this.approveRamo();
        this.malla.verifyPrer();
        this.malla.updateStats();
        this.malla.saveApproved();
    }

    // Auto explanatorio
    approveRamo() {
        if (!this.approved) {
            if (!this.isCustom)
                this.ramo.select(".cross").transition().delay(20).attr("opacity", "1");
            this.malla.approveSubject(this)
        } else {
            if (!this.isCustom)
                this.ramo.select(".cross").transition().delay(20).attr("opacity", "0.01");
            this.malla.deApproveSubject(this)
            }
        this.approved = !this.approved;
    }

    // Se pone el ramo en el estado inicial
    cleanRamo() {
        // Se llama a metodos internos necesarios que "limpien" el ramo
        if (this.approved) {
            this.approveRamo()
        }
    }

    // Se verifica que el ramo tenga los prerrequisitos cumplidos
    verifyPrer() {
        if (this.isCustom)
            return;
        let _a = [];
        this.malla.APPROVED.forEach(function(ramo) {
            _a.push(ramo.sigla);
        });
        _a = new Set(_a);
        for (let r of this.prer) {
            if (r.constructor === Array) {
                for (let subR of r) {
                    if (!_a.has(subR)) {
                        this.ramo.select(".non-approved").transition().delay(20).attr("opacity", "0.71");
                        return;
                    }
                }
            } else if (!_a.has(r)) {
                this.ramo.select(".non-approved").transition().delay(20).attr("opacity", "0.71");
                return;
            }
        }
        this.ramo.select(".non-approved").transition().delay(20).attr("opacity", "0.0");
    }

    // función para encuadrar texto
    wrap(sizeX,sizeY) {
        let text = this.ramo.select(".ramo-label");
        // let emEquivalent = convertEm(1, text.node());
        let words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
/*            y = text.attr("y"),
            dy = 0,*/
            fontsize = parseInt(text.attr("font-size"),10),
            tspan = text.text(null).append("tspan").attr("x", text.attr("x")).attr("dominant-baseline", "central").attr("dy", 0 + "em"),
            textLines,
            textHeight;
            word = words.pop();
        while (word) {
            line.push(word);
            tspan.text(line.join(" "));
            while (tspan.node().getComputedTextLength() > sizeX) {
                if (line.length === 1) {
                    text.attr("font-size", String(--fontsize));
                }
                else {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    // console.log(lineNumber + 1, lineHeight, dy, (lineNumber + 1) * lineHeight + dy,((lineNumber + 1) * lineHeight + dy) + "em");
                    tspan = text.append("tspan").attr("x", text.attr("x")).attr("dominant-baseline", "central").attr("dy",  lineHeight + "em").text(word);
                }
            }
            word = words.pop();
        }
        let texts = text.selectAll('tspan');
        text.attr("dy", 0); // forzar actualización de ems

        textLines = texts._groups[0].length;
        textHeight = text.node().getBoundingClientRect().height;


        while (textHeight > sizeY - 5) {
            text.attr("font-size", String(--fontsize));
            text.attr("dy", 0); // forzar actualización de ems
            textHeight = text.node().getBoundingClientRect().height;
            lineNumber = 0;
        }

        if (textLines !== 1) {
            let firstTspan = texts.filter(function (d, i) { return i === 0 });
            firstTspan.attr("dy", - (lineHeight * textLines / 2 - lineHeight / 2) + "em");
        }

        text.attr("dy", 0); // forzar actualización de ems


        // Funciones
        // function getElementFontSize(context) {
        //     // Returns a number
        //     return parseFloat(
        //         // of the computed font-size, so in px
        //         getComputedStyle(
        //             // for the given context
        //             context ||
        //             // or the root <html> element
        //             document.documentElement
        //         ).fontSize
        //     );
        // }

        // function convertEm(value, context) {
        //     return value * getElementFontSize(context);
        // }
    }

    // retorna true si el color contrasta mejor con texto blanco
    needsWhiteText(colorHex) {
        // Convert hex to RGB first
        let r = 0, g = 0, b = 0;
        if (colorHex.length === 4) {
            r = "0x" + colorHex[1] + colorHex[1];
            g = "0x" + colorHex[2] + colorHex[2];
            b = "0x" + colorHex[3] + colorHex[3];
        } else if (colorHex.length === 7) {
            r = "0x" + colorHex[1] + colorHex[2];
            g = "0x" + colorHex[3] + colorHex[4];
            b = "0x" + colorHex[5] + colorHex[6];
        }
        // console.log(r,g,b)
        // Then to HSL
        let rgb = [0, 0, 0];
        rgb[0] = r / 255;
        rgb[1] = g / 255;
        rgb[2] = b / 255;

        for (let color in rgb) {
            if (rgb[color] <= 0.03928) {
                rgb[color] /= 12.92
            } else {
                rgb[color] = Math.pow(((rgb[color] + 0.055) / 1.055), 2.4)
            }

        }

        // c <= 0.03928 then c = c/12.92 else c = ((c+0.055)/1.055) ^ 2.4
        let l = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
        // console.log(l)
        return l <= 0.6; // este valor deberia ser mas bajo según estandares...
    }

}