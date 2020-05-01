// Futuro remplazo de canvas.js
var malla = null;


class Malla {

    constructor(sct = false, ramoType = Ramo, scaleX = 1, scaleY = 1 ) {
        if (!malla){
            malla = this;
            // Propiedades antes del render
            this.scaleX = scaleX;
            this.scaleY = scaleY;
            this.separator = 10;
            this.ramoType = ramoType;
            this.rawMalla = {};
            this.sectors = {};
            this.malla = {};
            this.sct = sct;
            this.currentMalla = null;

            // Propiedades despues del render
            this.APPROVED = [];
            this.SELECTED = [];
            this.RAMOID = 1;
            this.ALLRAMOS = {};
            this.checkPrer = false;
            this.saveEnabled = false;
            this.isMallaSet = false;
            this.showCreditSystem = false;
            this.showCreditStats = false

            this.totalCredits = 0;
            this.totalRamos = 0;
        }
        return malla;
    }

    enableCreditsStats() {
        this.showCreditStats = true
    }

    enableCreditsSystem() {
        this.showCreditSystem = true
}

    setCarrera(carr) {
        this.currentMalla = carr;
        let promises = [];

        promises.push(d3.json("/data/data_" + this.currentMalla + ".json"));
        promises.push(d3.json("/data/colors_" + this.currentMalla + ".json"));
        return Promise.all(promises).then(values => {this.setMallaAndSectors(values[0], values[1])})
    }

    getInstance(callback) {
        callback(null, malla);
    }
    setMallaAndSectors(malla, sectors) {
        let semester;
        let longest_semester = 0;
        let totalCredits = 0;
        let totalRamos = 0;

        this.rawMalla = malla;
        this.sectors = sectors;

        for (semester in this.rawMalla) {
            this.malla[semester] = {};

            if (malla[semester].length > longest_semester)
                longest_semester = malla[semester].length;
            malla[semester].forEach(ramo => {
                totalRamos += 1;
                // Agregado de ramos por semestre
                this.malla[semester][ramo[1]] = new this.ramoType(ramo[0], ramo[1], ramo[2], ramo[3], (function() {
                    if (ramo.length > 4) {
                        return ramo[4];
                    }
                    return [];
                })(), this.RAMOID++, this.sectors[ramo[3]][0]);
                this.ALLRAMOS[ramo[1]] = this.malla[semester][ramo[1]];
                totalCredits += this.malla[semester][ramo[1]].getDisplayCredits()
            });
        }
        this.longestSemester = longest_semester;
        this.totalCredits = totalCredits;
        this.totalRamos = totalRamos;
        this.isMallaSet = true;
    }
    drawMalla(canvasId) {
        if (!this.isMallaSet)
            return;

        let separator = 10;
        let semesterIndicatorHeight = 30 * this.scaleY;

        let width = (this.ramoType.getDisplayWidth(this.scaleX) * Object.keys(this.malla).length) +
            separator * (Object.keys(this.malla).length - 1);
        let height = (this.ramoType.getDisplayHeight(this.scaleY) + separator) * this.longestSemester +
            semesterIndicatorHeight * 2 + separator;
        width += separator; // for full show svg
        height += separator/2

        const canvas = d3.select(canvasId).append("svg")
            .attr("width", width)
            .attr("height", height);
        const drawer = canvas.append('g');
        let globalX = 5,
            globalY = 0;
        let isBigBarRendered = false;
        let semestersPassed = 0;
        let currentYearIndicator;
        let currentYear = 0;
        let currentYearIndicatorText;
        let yearIndicator;
        for (let semester in this.malla) {
            globalY = 0;
            // Barra indicadora de años
            if (semestersPassed === 0) {
                yearIndicator = drawer.append("g")
                    .attr("cursor", "pointer");

                currentYearIndicator = yearIndicator.append("rect")
                    .attr("x", globalX)
                    .attr("y", globalY)
                    .attr("width", this.ramoType.getDisplayWidth(this.scaleX))
                    .attr("height", semesterIndicatorHeight)
                    .attr("fill", 'gray')
                    .classed('bars', true);
                semestersPassed++;

                currentYearIndicatorText = yearIndicator.append("text")
                    .attr('x', globalX + this.ramoType.getDisplayWidth(this.scaleX) / 2.0)
                    .attr('y', globalY + semesterIndicatorHeight / 2)
                    .text("Año " + currentYear++ + " 1/2")
                    // .attr("font-family", "sans-serif")
                    .attr("font-weight", "bold")
                    .attr("fill", "white")
                    .attr("dominant-baseline", "central")
                    .attr('text-anchor', 'middle');

                yearIndicator.on("click", function () {
                    let number = parseInt(d3.select(this).select("text").text().substr(4));
                    let ramosToSelect;
                if (this.getBBox().width === malla.ramoType.getDisplayWidth(malla.scaleX)) {
                    d3.select("#sem" + (number * 2 + 1)).dispatch('click')
                } else {
                    d3.select("#sem" + number * 2).dispatch('click');
                    d3.select("#sem" + (number * 2 - 1)).dispatch('click')

                }

                });
            } else {
                currentYearIndicator.attr("width", this.ramoType.getDisplayWidth(this.scaleX) * 2 + separator);
                currentYearIndicatorText.text("Año " + (currentYear));
                currentYearIndicatorText.attr("x", globalX - separator / 2);
                semestersPassed = 0;
            }

            globalY += semesterIndicatorHeight + separator;

            // Barra gigante de semestres
            if (!isBigBarRendered) {
                drawer.append("rect")
                    .attr("x", globalX)
                    .attr("y", globalY)
                    .attr("width", width)
                    .attr("height", semesterIndicatorHeight)
                    .attr("fill", '#EEE');
                isBigBarRendered = true;
            }

            let semesterIndicator = drawer.append("g")
                .attr("id", "sem" + semester.substr(1))
                .attr("cursor", "pointer")
                .attr("width", this.ramoType.getDisplayWidth(this.scaleX))
                .attr("height", semesterIndicatorHeight);



            // barra de semestres individuales
            semesterIndicator.append("rect")
                .attr("cursor", "pointer")
                .attr("x", globalX)
                .attr("y", globalY)
                .attr("width", this.ramoType.getDisplayWidth(this.scaleX))
                .attr("height", semesterIndicatorHeight)
                .attr("fill", '#EEE');
            isBigBarRendered = true;

            semesterIndicator.append("text")
                .attr('x', globalX + this.ramoType.getDisplayWidth(this.scaleX) / 2.0)
                .attr('y', globalY + semesterIndicatorHeight / 2)
                .text(romanize(parseInt(semester.substr(1))))
                // .attr("font-family", "sans-serif")
                // .attr("font-weight", "bold")
                // .attr("fill", "white")
                .attr("dominant-baseline", "central")
                .attr('text-anchor', 'middle');

            semesterIndicator.on("click", function () {
                function deRomanize(roman){
                    var r_nums = getRnums();
                    var a_nums = getAnums();
                    var remainder = roman.replace(/i/g, "M");
                    var arabic = 0, count = 0, test = remainder;

                    var len=r_nums.length;
                    for ( var i=1;  i<len; ++i ){
                        var numchrs = r_nums[i].length;
                        while( remainder.substr(0,numchrs) === r_nums[i]){
                            if((count++) > 30) return -1;
                            arabic += a_nums[i];
                            remainder = remainder.substr(numchrs,remainder.length-numchrs);
                        }
                        if(remainder.length <= 0) break;
                    }
                    if(remainder.length !==0 ){
                        alert(roman + " INVALID truncating to "+test.replace(remainder,'') );
                    }
                    if( (0 < arabic) && (arabic < 4000000) )return arabic;
                    else return -1;
                }

                let semNumber = deRomanize(d3.select(this).select("text").text());
                Object.values(malla.malla["s" + semNumber]).forEach(ramo => {
                    ramo.isBeingClicked()
                })

            });

            globalY += semesterIndicatorHeight + separator;

            for (let ramo in this.malla[semester]) {
                this.malla[semester][ramo].draw(drawer, globalX, globalY, this.scaleX, this.scaleY);
                globalY += this.ramoType.getDisplayHeight(this.scaleY) + separator;
            }

            globalX += this.ramoType.getDisplayWidth(this.scaleX) + separator;
        }


        // Funciones solo para dibujar mallas
        function romanize(arabic) {
            if (arabic > 3999999 || arabic < 1) {
                return 'Expect number from 1 to 3,999,999';
            }
            let r_nums = getRnums();
            let a_nums = getAnums();
            let remainder = parseInt(arabic);
            let roman = '', count = 0;

            let len = r_nums.length;
            for (let i = 1; i < len; ++i) {
                while (remainder >= parseInt(a_nums[i])) {
                    if ((count++) > 30) return -1;
                    roman = roman + r_nums[i];
                    remainder = remainder - a_nums[i];
                }
                if (remainder <= 0) break;
            }
            return roman;
        }


        function getRnums() {
            let r_nums = Array();
            r_nums[1] = 'm';
            r_nums[2] = 'cm';
            r_nums[3] = 'd';
            r_nums[4] = 'cd';
            r_nums[5] = 'c';
            r_nums[6] = 'xc';
            r_nums[7] = 'l';
            r_nums[8] = 'xl';
            r_nums[9] = 'x';
            r_nums[10] = 'Mx';
            r_nums[11] = 'v';
            r_nums[12] = 'Mv';
            r_nums[13] = 'M';
            r_nums[14] = 'CM';
            r_nums[15] = 'D';
            r_nums[16] = 'CD';
            r_nums[17] = 'C';
            r_nums[18] = 'XC';
            r_nums[19] = 'L';
            r_nums[20] = 'XL';
            r_nums[21] = 'X';
            r_nums[22] = 'IX';
            r_nums[23] = 'V';
            r_nums[24] = 'IV';
            r_nums[25] = 'I';
            return r_nums;
        }

        function getAnums() {
            let a_nums = Array();
            a_nums[1] = 1000000;
            a_nums[2] = 900000;
            a_nums[3] = 500000;
            a_nums[4] = 400000;
            a_nums[5] = 100000;
            a_nums[6] = 90000;
            a_nums[7] = 50000;
            a_nums[8] = 40000;
            a_nums[9] = 10000;
            a_nums[10] = 9000;
            a_nums[11] = 5000;
            a_nums[12] = 4000;
            a_nums[13] = 1000;
            a_nums[14] = 900;
            a_nums[15] = 500;
            a_nums[16] = 400;
            a_nums[17] = 100;
            a_nums[18] = 90;
            a_nums[19] = 50;
            a_nums[20] = 40;
            a_nums[21] = 10;
            a_nums[22] = 9;
            a_nums[23] = 5;
            a_nums[24] = 4;
            a_nums[25] = 1;
            return a_nums;
        }
    }

    showColorDescriptions(locationId) {
        Object.keys(this.sectors).forEach(key => {
            let color_description = d3.select(".color-description").append("div")
                .attr("style", "display:flex;vertical-align:middle;margin-right:15px;");
            let circle_color = color_description.append("svg")
                .attr("height", "25px")
                .attr("width", "25px");
            circle_color.append("circle")
                .attr("r", 10)
                .attr("cx", 12)
                .attr("cy", 12)
                .attr("fill", this.sectors[key][0]);

            color_description.append("span").text(this.sectors[key][1]);

        });
    }

    enablePrerCheck() {
        this.checkPrer = true;
        this.verifyPrer()
    }

    verifyPrer() {
        if (this.checkPrer) {
            Object.values(this.ALLRAMOS).forEach(ramo => {
                ramo.verifyPrer();
            });
            this.saveApproved()
        }
    }

    displayCreditSystem() {
        if (!this.showCreditSystem)
            return
        d3.select("#credits-system").text(this.sct ? 'SCT' : 'USM')
    }

    updateStats() {
        if (!this.showCreditStats)
            return
        let currentCredits = 0;
        let currentRamos = 0;
        this.APPROVED.forEach(ramo => {
            currentCredits += ramo.getDisplayCredits();
            currentRamos += 1
        })
        let creditPercentage = currentCredits/this.totalCredits * 100;
        let careerAdvance = currentRamos/this.totalRamos * 100;
        d3.select("#credits").text(parseInt(currentCredits))
        d3.select("#credPercentage").text(parseInt(creditPercentage))
        d3.select("#ramoPercentage").text(parseInt(careerAdvance))
    }

    cleanRamos() {
        let listToClean = [...this.APPROVED]
        listToClean.forEach(ramo => {
            ramo.cleanRamo()
        })
        this.verifyPrer()
        this.updateStats()
    }

    enableSave() {
        this.saveEnabled = true
    }

    saveApproved() {
        if (this.saveEnabled)
            StorageManager.saveApproved(this.APPROVED, this.currentMalla)
    }

    loadApproved() {
        let loadedData = StorageManager.loadApproved(this.currentMalla);
            loadedData.forEach(siglaRamo => {
                console.log(siglaRamo)
                this.ALLRAMOS[siglaRamo].approveRamo()
        })
        this.verifyPrer()
    }
}