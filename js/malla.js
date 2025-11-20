// Futuro remplazo de canvas.js

class Malla {

    constructor(sct = false, subjectType = Ramo, scaleX = 1, scaleY = 1) {

        // Propiedades antes del render
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.subjectType = subjectType;
        this.rawMalla = {};
        this.categories = {};
        this.malla = {};
        this.sct = sct;
        this.longestSemester = 0;
        this.totalCredits = 0;
        this.totalSubjects = 0;
        this.semesterManager = null
        this.currentMalla = null;
        this.generatedCode = []

        // Propiedades despues del render
        this.APPROVED = [];
        this.SUBJECTID = 1;
        this.ALLSUBJECTS = {};
        this.checkPrer = false;
        this.saveEnabled = false;
        this.isMallaSet = false;
        this.showCreditSystem = false;
        this.showCreditStats = false

        this.totalCredits = 0;
        this.totalSubjects = 0;

        if (document.getElementById("loadfile")) {
            document.getElementById("loadfile").addEventListener("click", this.loadFile.bind(this))
        }

    }

    // Se explica solo
    enableCreditsStats() {
        this.showCreditStats = true
    }

    // Se explica solo
    enableCreditsSystem() {
        this.showCreditSystem = true
    }

    // Habilita el guardado de ramos aprobados para futuras sesiones
    enableSave() {
        this.saveEnabled = true
    }

    // Obtiene los datos de la carrera y retorna una promesa para cuando los datos se hayan conseguido y
    // las propiedades estén listas
    setCareer(carr, fullCareerName, relaPath) {
        if (localStorage["sharedMalla"] != undefined) {
            let unparsedData = localStorage["sharedMalla"]
            localStorage.removeItem("sharedMalla")
            let data = JSON.parse(unparsedData)
            this.currentMalla = data.name;
            this.fullCareerName = data.name
            console.log("hola")
            console.log(data.name)
            return Promise.resolve(this.setMallaAndCategories(data.malla, data.categories))

        } else {
            this.currentMalla = carr;
            this.fullCareerName = fullCareerName
            let promises = [];
    
            promises.push(d3.json( relaPath + "data/data_" + this.currentMalla + ".json"));
            promises.push(d3.json( relaPath + "data/colors_" + this.currentMalla + ".json"));
            return Promise.all(promises).then(values => {this.setMallaAndCategories(values[0], values[1])})

        }
    }

    // Define los datos de la malla y propiedades
    setMallaAndCategories(malla, categories) {
        let semester;
        let longest_semester = 0;
        let totalCredits = 0;
        let totalRamos = 0;

        this.rawMalla = malla;
        this.categories = categories;

        for (semester in this.rawMalla) {
            this.malla[semester] = {};

            if (malla[semester].length > longest_semester)
                longest_semester = malla[semester].length;
            malla[semester].forEach(subject => {
                // Se instancia el ramo y se agrega a la malla en su semestre
                totalRamos += 1;
                // Agregado de ramos por semestre
                if (subject.length >= 7) {
                    // Nuevo formato con ramos SCT
                    this.malla[semester][subject[1]] = new this.subjectType(subject[0], subject[1], subject[2], subject[4], subject[5],this.SUBJECTID++, this, subject[3], false ,subject[6])
                } else {
                    // Formato antiguo
                    this.malla[semester][subject[1]] = new this.subjectType(subject[0], subject[1], subject[2], subject[3], (function hasPrer() {
                        if (subject.length > 4) {
                            return subject[4];
                        }
                        return [];
                    })(), this.SUBJECTID++, this);
                }
                // Se agrega el ramo a la lista de asignaturas
                this.ALLSUBJECTS[subject[1]] = this.malla[semester][subject[1]];
                totalCredits += this.malla[semester][subject[1]].getDisplayCredits()
            });
        }
        this.longestSemester = longest_semester;
        this.totalCredits = totalCredits;
        this.totalSubjects = totalRamos;
        this.isMallaSet = true;
    }

    // Define el controlador de semestres para que las asignaturas puedan acceder a el
    setSemesterManager(semesterManager) {
        this.semesterManager = semesterManager
    }

    // Agrega ramos a la malla
    addSubject(subject) {
        this.ALLSUBJECTS[subject.sigla] = subject
    }

    // Elimina ramos de la malla y todo rastro de ellos
    delSubjects(subject) {
        Object.values(this.ALLSUBJECTS).forEach(otherSubject => {
            // Elimina el ramo como prerrequisito de otros
            if (otherSubject.prer.has(subject.sigla)){
                otherSubject.prer.delete(subject.sigla)
                otherSubject.verifyPrer()
            }
        })
        delete this.ALLSUBJECTS[subject.sigla]
    }

    // Renderiza la malla. canvasId puede ser una clase o una id
    drawMalla(canvasId) {

        if (!this.isMallaSet)
            return;

        let separator = 10;
        let semesterIndicatorHeight = 30 * this.scaleY;
        // Se define el tamaño
        let width = (this.subjectType.getDisplayWidth(this.scaleX) * Object.keys(this.malla).length) +
            separator * (Object.keys(this.malla).length - 1);
        let height = (this.subjectType.getDisplayHeight(this.scaleY) + separator) * this.longestSemester +
            semesterIndicatorHeight * 2 + separator;
        let canvasWidth = width + separator; // for full show svg
        let canvasHeight = height + separator/2

        const canvas = d3.select(canvasId).append("svg")
            .attr("width", canvasWidth)
            .attr("height", canvasHeight)
            .attr("role", "figure");

        canvas.append("title")
            .text("Malla " + this.fullCareerName)

        const drawer = canvas;
        let globalX = separator / 2,
            globalY = 0;
        let isBigBarRendered = false;
        let semestersPassed = 0;
        let currentYear = 0;
        let currentYearIndicator = null;
        let currentYearIndicatorText = null;
        let yearIndicator = null;

        Object.keys(this.malla).forEach(semester => {
            globalY = 0;
            // Barra indicadora de años
            if (semestersPassed === 0) {
                yearIndicator = drawer.append("g")
                    .attr("cursor", "pointer")
                    .attr("role", "heading")
                    .attr("aria-level", "5")
                    .classed("year", true);
                // se crea la barra en caso de semestre impar
                let desc = yearIndicator.append("title")
                // rectangulo de la barra
                currentYearIndicator = yearIndicator.append("rect")
                    .attr("x", globalX)
                    .attr("y", globalY)
                    .attr("width", this.subjectType.getDisplayWidth(this.scaleX))
                    .attr("height", semesterIndicatorHeight)
                    .attr("fill", 'gray')
                    .classed('bars', true);
                semestersPassed++;
                // texto de la barra
                currentYearIndicatorText = yearIndicator.append("text")
                    .attr('x', globalX + this.subjectType.getDisplayWidth(this.scaleX) / 2.0)
                    .attr('y', globalY + semesterIndicatorHeight / 2)
                    .text("Año " + currentYear++ + " 1/2")
                    // .attr("font-family", "sans-serif")
                    .attr("font-weight", "bold")
                    .attr("fill", "white")
                    .attr("dominant-baseline", "central")
                    .attr('text-anchor', 'middle');
                desc.text("Año " + currentYear + " 1/2")
                // Evento en caso de hacer click en el
                yearIndicator.on("click", () => {
                    let bar = d3.select(d3.event.currentTarget)
                    let number = parseInt(bar.select("text").text().substr(4));
                    let ramosToSelect;
                if (bar.node().getBBox().width <= this.subjectType.getDisplayWidth(this.scaleX) * 2 - this.subjectType.getDisplayWidth(this.scaleX) / 2) {
                    d3.select("#sem" + (number * 2 + 1)).dispatch('click')
                } else {
                    d3.select("#sem" + number * 2).dispatch('click');
                    d3.select("#sem" + (number * 2 - 1)).dispatch('click')

                }

                });
            } else {
                // si es par, la actual se expande
                currentYearIndicator.attr("width", this.subjectType.getDisplayWidth(this.scaleX) * 2 + separator);
                currentYearIndicatorText.text("Año " + (currentYear));
                currentYearIndicatorText.attr("x", globalX - separator / 2);
                semestersPassed = 0;
                yearIndicator.select("title").text("Año "+ (currentYear))
            }

            globalY += semesterIndicatorHeight + separator;

            // Barra gigante de semestres
            if (!isBigBarRendered) {
                // Se crea la barra
                drawer.append("rect")
                    .attr("x", globalX)
                    .attr("y", globalY)
                    .attr("width", width)
                    .attr("height", semesterIndicatorHeight)
                    .attr("fill", '#EEE')
                    .classed("sem", true);
                isBigBarRendered = true;
            }

            // Pequeño seteo de variables en caso de que semestre sea "S1" o 1 por ejemplo
            let intToRomanize = semester
            if (intToRomanize[0] === "s") {
                intToRomanize = parseInt(intToRomanize.substr(1))
            } else {
                intToRomanize = parseInt(intToRomanize)
            }

            // barra de semestres individuales
            let semesterIndicator = drawer.append("g")
                .attr("id", "sem" + intToRomanize)
                .attr("cursor", "pointer")
                .attr("width", this.subjectType.getDisplayWidth(this.scaleX))
                .attr("height", semesterIndicatorHeight)
                .attr("role", "heading")
                .attr("aria-level", "6")
                .classed("sem", true);

            semesterIndicator.append("title").text("Semestre " + intToRomanize)



            semesterIndicator.append("rect")
                .attr("cursor", "pointer")
                .attr("x", globalX)
                .attr("y", globalY)
                .attr("width", this.subjectType.getDisplayWidth(this.scaleX))
                .attr("height", semesterIndicatorHeight)
                .classed("sem", true)
                .attr("fill", '#EEE');


            semesterIndicator.append("text")
                .attr('x', globalX + this.subjectType.getDisplayWidth(this.scaleX) / 2.0)
                .attr('y', globalY + semesterIndicatorHeight / 2)
                .text(this.romanize(intToRomanize))
                .attr("dominant-baseline", "central")
                .attr('text-anchor', 'middle');
            // evento en caso de clickear la barra del semestre
            semesterIndicator.on("click", () => {
                let bar = d3.select(d3.event.currentTarget)
                let semNumber = this.deRomanize(bar.select("text").text());
                if (semester[0] === "s")
                    semNumber = "s" + semNumber
                Object.values(this.malla[semNumber]).forEach(ramo => {
                    ramo.isBeingClicked()
                })

            });

            globalY += semesterIndicatorHeight + separator;

            // Se renderizan los ramos del semestre
            Object.keys(this.malla[semester]).forEach(subject => {
                this.malla[semester][subject].draw(drawer, globalX, globalY, this.scaleX, this.scaleY);
                globalY += this.subjectType.getDisplayHeight(this.scaleY) + separator;
            })


            globalX += this.subjectType.getDisplayWidth(this.scaleX) + separator;
        })
    }

    // Renderiza las descripciones de las categorías
    showColorDescriptions(className=".color-description") {
        Object.keys(this.categories).forEach(key => {
            let color_description = d3.select(className).append("div")
                .attr("style", "display:flex;vertical-align:middle;margin-right:15px;");
            let circle_color = color_description.append("svg")
                .attr("height", "25px")
                .attr("width", "25px");
            circle_color.append("circle")
                .attr("r", 10)
                .attr("cx", 12)
                .attr("cy", 12)
                .attr("fill", this.categories[key][0]);

            color_description.append("span").text(this.categories[key][1]);

        });
    }

    // Permite que se revise si los ramos cumplen prerrequisitos
    enablePrerCheck() {
        this.checkPrer = true;
        this.verifyPrer()
    }

    // Revisa que ramos cumplen prerrequisitos y "oculta" los que no los cumplen
    verifyPrer() {
        if (this.checkPrer) {
            Object.values(this.ALLSUBJECTS).forEach(ramo => {
                ramo.verifyPrer();
            });
            this.saveApproved()
        }
    }

    // Retorna el sistema de créditos utilizado
    displayCreditSystem() {
        if (!this.showCreditSystem)
            return
        d3.select("#credits-system").text(this.sct ? 'SCT' : 'USM')
    }

    // Actualiza los datos como porcentaje de ramos aprobados etc
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
        let careerAdvance = currentRamos/this.totalSubjects * 100;
        d3.select("#credits").text(parseInt(currentCredits))
        d3.select("#credPercentage").text(parseInt(creditPercentage))
        d3.select("#ramoPercentage").text(parseInt(careerAdvance))
    }

    // Limpia los ramos aprobados
    cleanSubjects() {
        let listToClean = [...this.APPROVED]
        listToClean.forEach(ramo => {
            ramo.cleanRamo()
        })
        this.verifyPrer()
        this.updateStats()
    }


    // Auto explanatorio
    approveSubject(subject) {
        this.APPROVED.push(subject)
    }

    // Auto explanatorio
    deApproveSubject(subject) {
        let _i = this.APPROVED.indexOf(subject);
        if (_i > -1) {
            this.APPROVED.splice(_i, 1);
        }
    }

    getSubject(sigla) {
        return this.ALLSUBJECTS[sigla]
    }

    // Auto explanatorio
    saveApproved() {
        if (this.saveEnabled) {
            let cacheName = "approvedRamos_" + this.currentMalla;
            let cacheToSave = [];
            this.APPROVED.forEach(ramo => {
                cacheToSave.push(ramo.sigla)
            });
            localStorage[cacheName] = JSON.stringify(cacheToSave);
        }
    }

    // Auto explanatorio
    loadApproved() {
        if (this.saveEnabled) {
            let cache = localStorage["approvedRamos_" + this.currentMalla]
            if (cache) {
                let loadedData = JSON.parse(cache)
                loadedData.forEach(siglaRamo => {
                    if (this.ALLSUBJECTS[siglaRamo] !== undefined)
                        this.ALLSUBJECTS[siglaRamo].approveRamo()
                })
                this.verifyPrer()
            }
        }
    }

    // EXTRA

    deRomanize(roman){
        let r_nums = this.getRnums();
        let a_nums = this.getAnums();
        let remainder = roman.replace(/i/g, "M");
        let arabic = 0, count = 0, test = remainder;

        let len=r_nums.length;
        for (let i=1; i<len; ++i ){
            const numchrs = r_nums[i].length;
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

    romanize(arabic) {
        if (arabic > 3999999 || arabic < 1) {
            return 'Expect number from 1 to 3,999,999';
        }
        let r_nums = this.getRnums();
        let a_nums = this.getAnums();
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


    getRnums() {
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

    getAnums() {
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

    // Genera código de la malla generada para poder actualizar o agregar carreras
    generateCode() {
        let data = {}
        let expresion1 = /("s[0-9]+":)+|(\[(?:,?[^\[\]])+(?:,\[[^\]]*])(?:,?[^\]]*)+])+/g

        // Se crea la data a guardar según el formato de la malla
        Object.keys(this.malla).forEach(semester => {
            let key
            if (semester.includes("s"))
                key = semester
            else
                key = "s" + semester
            data[key] = []

            Object.keys(this.malla[semester]).forEach(sigla => {
                let subject = this.ALLSUBJECTS[sigla]
                let subjectData = []

                subjectData.push(subject.name)
                subjectData.push(subject.sigla)
                subjectData.push(subject.getUSMCredits())
                if (subject.USMtoSCT)
                    subjectData.push(0)
                else
                    subjectData.push(subject.getSCTCredits())

                subjectData.push(subject.category)
                subjectData.push([...subject.prer])
                subjectData.push(subject.dictatesIn)
                data[key].push(subjectData)

            })
        })

        // Luego se crea el string de la data y se le da el formato
        let mallaResult = JSON.stringify(data).match(expresion1);

        let s = "{\n"
        let first = true
        let firstSem = true
        mallaResult.forEach(item => {
            if (/("s[0-9]+":)/.test(item)) {
                if (firstSem) {
                    s += "    " + item + " [\n"
                    firstSem = false
                } else {
                    s += "\n    ],\n" + "    " + item + " [\n"
                }
                first = true
            } else if (first) {
                s += "        " + item
                first = false
            } else
                s += ",\n" + "        " + item
        })
        s += "\n" + "    " + "]\n" + "}"

        // Se repite el proceso con las categorías
        let expresion2 = /("[^\]]+\],?)/g
        let colorResult = JSON.stringify(this.categories).match(expresion2)
        let c = "{"
        colorResult.forEach(color => {
            c += "\n" + "    " + color
        })
        c += "\n}"
        this.generatedCode = [this.currentMalla,s,c]

        let shareCode = `{\n "name": "${this.generatedCode[0]}",\n "malla": ${this.generatedCode[1]},\n "categories": ${this.generatedCode[2]}\n}`
        // Si existe el lugar para mostrarlo, se muestra
        if (document.getElementById('mallaCode')) {
            new ClipboardJS('.btn');
            document.getElementById('mallaCode').textContent = s;
            document.getElementById('colorCode').textContent = c
            PR.prettyPrint()

            document.getElementById('abrev').value = this.currentMalla
            document.getElementById("carrMalla1").textContent = this.currentMalla
            document.getElementById("carrMalla2").textContent = this.currentMalla
            document.getElementById("carrColor1").textContent = this.currentMalla
            document.getElementById("carrColor2").textContent = this.currentMalla

            let file1 = new Blob([s], {"aplication/json": "aplication/json"});
            let file2 = new Blob([c], {"aplication/json": "aplication/json"});
            let file3 = new Blob([shareCode], {"aplication/json": "aplication/json"});
            let downloadLink1 = document.getElementById('dMalla')
            let downloadLink2 = document.getElementById('dColor')
            let downloadLink3 = document.getElementById('dShare')
            downloadLink1.setAttribute('href', URL.createObjectURL(file1))
            downloadLink1.setAttribute('download', "data_" + this.currentMalla + '.json')
            downloadLink2.setAttribute("href", URL.createObjectURL(file2))
            downloadLink2.setAttribute("download", "colors_" + this.currentMalla + '.json')
            downloadLink3.setAttribute('href', URL.createObjectURL(file3))
            downloadLink3.setAttribute('download', this.currentMalla + '.json')

        } else {
            // Si no, se imprime en la consola
            console.log(s)
            console.log(c)

        }
        if (document.getElementById("abrev")) {
            document.getElementById("abrev").addEventListener('input', function (input) {
                document.getElementById("carrMalla1").textContent = input.target.value.toUpperCase()
                document.getElementById("carrMalla2").textContent = input.target.value.toUpperCase()
                document.getElementById("carrColor1").textContent = input.target.value.toUpperCase()
                document.getElementById("carrColor2").textContent = input.target.value.toUpperCase()
                document.getElementById('dMalla').setAttribute('download', "data_" + input.target.value.toUpperCase() + '.json')
                document.getElementById('dColor').setAttribute("download", "colors_" + input.target.value.toUpperCase() + '.json')
                console.log(this.generatedCode[0])
                this.generatedCode[0] = input.target.value

                $('[data-toggle="tooltip"]').tooltip()
                $('[data-toggle="tooltip"]').tooltip('disable')


                let downloadLink3 = document.getElementById('dShare')
                let shareCode = `{\n "name": "${this.generatedCode[0]}",\n "malla": ${this.generatedCode[1]},\n "categories": ${this.generatedCode[2]}\n}`
                let file3 = new Blob([shareCode], {"aplication/json": "aplication/json"});

                downloadLink3.setAttribute('href', URL.createObjectURL(file3))
                downloadLink3.setAttribute('download', this.generatedCode[0] + '.json')
            }.bind(this))
        }
    }

    loadFile(e) {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json'
        input.multiple = false
        var reader = new FileReader();
        reader.addEventListener("load", function (e) {
            localStorage["sharedMalla"] = e.target.result;
            location.reload()
        });
    
        input.onchange = _this => {
            let files =   Array.from(input.files);
                reader.readAsText(files[0]);
    
              };
        input.click();
    
    }
}