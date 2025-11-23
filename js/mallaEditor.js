class MallaEditor {
    constructor(semesterManager, customSubjectLocation, categoryLocation = false) {
        // This constructor is bananas
        this.semesterManager = semesterManager
        this.customManager = document.querySelector(customSubjectLocation)
        this.categories = Object.assign({}, this.semesterManager.malla.categories)
        this.categoryList = {}
        this.subjectList = []
        this.tableList = {}
        this.defaultSector = ["#000000", "Fuera de la malla | editado"]
        this.categories["Custom"] = this.defaultSector

        if (categoryLocation) {
            document.getElementById("deleteCategories").addEventListener("click", this.restoreCategories.bind(this))
            this.categoryManager = document.querySelector(categoryLocation)
            let showModalButton = document.querySelector("#showCatModal")
            showModalButton.addEventListener("click", this.setUpCategoryModal.bind(this, false, null))
            let categoryModalId = showModalButton.getAttribute("data-target")
            this.createCatEventListener = this.createCategory.bind(this, null)
            this.editCatEventListener = null
            this.deleteCatEventListener = null
            this.categoryModal = $(categoryModalId)
            this.categoryModal.on("hidden.bs.modal", e => {
                e.target.querySelector("#cat-name").value = ""
                e.target.querySelector("#small-cat-name").value = ""
                e.target.querySelector("#small-cat-name").removeAttribute("disabled")
                e.target.querySelector("#cat-color").value = ""
                e.target.querySelector("#sectorDeleteButton").classList.remove("d-none")
                e.target.querySelector("#sectorDeleteButton").removeEventListener("click", this.deleteCatEventListener)
                let doneButton = e.target.querySelector("#sectorDoneButton")
                doneButton.removeEventListener("click", this.createCatEventListener)
                doneButton.removeEventListener("click", this.editCatEventListener)
                doneButton.textContent = "Agregar"
                e.target.querySelector("#catTitle").textContent = "Agregar"

            })

        } else
            this.categoryManager = null

        this.subjectTable = this.customManager.querySelector("#customTableContent")

        let creatorModalId = this.customManager.getElementsByClassName("button-create-subject")[0]
            .getAttribute("data-target")

        this.createSubjectModal = $(creatorModalId)
        this.createSubjectModal.on("hidden.bs.modal", e => {
            e.target.querySelector("#custom-name").value = ""
            e.target.querySelector("#custom-sigla").value = ""
            e.target.querySelector("#custom-credits-USM").value = ""
            e.target.querySelector("#custom-credits-SCT").value = ""
            e.target.querySelector("#custom-credits-SCT").placeholder = "Ingrese un valor"
        })

        this.createAdvancedSubjectModal = null

        let modal = document.querySelector(creatorModalId)
        modal.querySelector("#createSubject")
            .addEventListener("click", e => {
                this.createSubject(modal)
            })

        document.getElementById("deleteSubjects").addEventListener("click", this.cleanSubjects.bind(this))

        let advanced =this.customManager.getElementsByClassName("button-advanced-subject")

        if (advanced.length !== 0) {
            this.createSubEventListener = this.createAdvancedSubject.bind(this)
            this.editSubEvent = null
            this.advanced = true
            let advancedCreatorModalId = advanced[0]
                .getAttribute("data-target")
            this.createAdvancedSubjectModal = $(advancedCreatorModalId)
            advanced[0].addEventListener("click", () => {this.setUpModal()})
            this.createAdvancedSubjectModal.on("hidden.bs.modal", e => {
                e.target.querySelector("#custom-namea").value = ""
                let sigla = e.target.querySelector("#custom-siglaa")
                sigla.value = ""
                sigla.removeAttribute("disabled")
                e.target.querySelector("#custom-creditsa-USM").value = ""
                e.target.querySelector("#custom-creditsa-SCT").value = ""
                e.target.querySelector("#custom-creditsa-SCT").placeholder = "Ingrese un valor"
                e.target.querySelector("#dictatesIn").value = ""
                let sectorC = e.target.querySelector("#sectorChooser")
                sectorC.textContent = ""
                let defaultSector = document.createElement("option")
                defaultSector.value = this.defaultSector[0]
                sectorC.append(defaultSector)

                let prerC = e.target.querySelector("#prerChooser")
                prerC.textContent = ""
                let choosePrer = document.createElement("option")
                choosePrer.value = "0"
                choosePrer.textContent = "Elige los prerrequisitos"
                prerC.append(choosePrer)
                e.target.querySelector("#prerList").textContent = ""
                let doneButton = e.target.querySelector("#createAdvSubject")
                doneButton.textContent = "Agregar"
                doneButton.removeEventListener("click", this.createSubEventListener)
                doneButton.removeEventListener("click", this.editSubEvent)
                this.createAdvancedSubjectModal.get(0).querySelector("#advSubjectTitle").textContent = "Agregar"
            })
            let prerChooser = this.createAdvancedSubjectModal.get(0).querySelector("#prerChooser")
            prerChooser.addEventListener("change", this.addPrerToModal.bind(this))
        } else
            this.advanced = false

        this.subjectModalPrer = new Set()
    }

    // prepara el modal para agregar o editar asignaturas
    setUpModal(isEdit = false, subject=null) {
        let modal = this.createAdvancedSubjectModal.get(0)
        let sectorChooser = modal.querySelector("#sectorChooser")
        Object.keys(this.categories).forEach(category => {
            if (category !== "Custom") {
                let option = document.createElement("option")
                option.value = category
                option.textContent = this.categories[category][1]
                sectorChooser.append(option)
            }
        })
        if (this.categories["Custom"])
            sectorChooser.firstElementChild.textContent = this.categories["Custom"][1]
        else
            sectorChooser.firstElementChild.textContent = this.defaultSector[1]
        let prerChooser = modal.querySelector("#prerChooser")
        Object.keys(this.semesterManager.malla.ALLSUBJECTS).forEach(sigla => {
            let option = document.createElement("option")
            option.value = sigla
            option.textContent = this.semesterManager.malla.ALLSUBJECTS[sigla].name + " | " + sigla
            prerChooser.append(option)
        })
        this.subjectModalPrer = new Set()
        if (isEdit) {
            modal.querySelector("#custom-namea").value = subject.name
            let sigla = modal.querySelector("#custom-siglaa")
            sigla.value = subject.sigla
            sigla.setAttribute("disabled", "disabled")
            modal.querySelector("#custom-creditsa-USM").value = subject.getUSMCredits()
            if (Math.round(subject.getUSMCredits() * 5 / 3) !== subject.getSCTCredits())
                modal.querySelector("#custom-creditsa-SCT").value = subject.getSCTCredits()
            sectorChooser.value = subject.category
            subject.prer.forEach(sigla => {
                prerChooser.value = sigla
                this.addPrerToModal(null, prerChooser)
            })
            modal.querySelector("#dictatesIn").value = subject.dictatesIn
            if (this.tableList[subject.sigla])
                this.editSubEvent = this.tableList[subject.sigla][1]
            else
                this.editSubEvent = this.editSubject.bind(this, subject)
            this.createAdvancedSubjectModal.get(0).querySelector("#createAdvSubject").textContent = "Editar"
            this.createAdvancedSubjectModal.get(0).querySelector("#advSubjectTitle").textContent = "Editar"
            this.createAdvancedSubjectModal.get(0).querySelector("#createAdvSubject")
                .addEventListener("click", this.editSubEvent)
            this.createAdvancedSubjectModal.modal("show")
        } else {
            this.createAdvancedSubjectModal.get(0).querySelector("#createAdvSubject")
                .addEventListener("click", this.createSubEventListener)

        }
    }

    // Subject related

    // Muestra la asignatura en la tabla
    displaySubject(subject) {
        let fadeIn = [
            {opacity: 0},
            {opacity: 1}
        ]

        let subjectInfo = document.createElement("tr")
        subjectInfo.setAttribute("id", "custom-" + subject.sigla)
        let subjectRow = document.createElement("td")
        subjectRow.setAttribute("scope", "row")
        subjectRow.textContent = subject.sigla
        let subjectNameCol = document.createElement("td")
            subjectNameCol.textContent = subject.name
        let subjectCreditsCol = document.createElement("td")
            subjectCreditsCol.textContent = subject.getUSMCredits() + " USM | " + subject.getSCTCredits() + " SCT"
        let subjectState = document.createElement("td")
        subjectState.setAttribute("id", "state")
        if (subject.selected) {
            subjectState.textContent = "Seleccionado"
        } else {
            subjectState.textContent = "No seleccionado"
        }
        let subjectPrer = null
        if (this.advanced) {
            subjectPrer = document.createElement("td")
            let i = 0
            subject.prer.forEach(prer => {
                if (i === 0) {
                    subjectPrer.textContent = prer
                    i = 1
                } else
                    subjectPrer.textContent += " | " + prer
            })
            if (subjectPrer.textContent.length === 0)
                subjectPrer.textContent = "Sin prerrequisitos"
        }

        let actionsCol = document.createElement("td")
        actionsCol.classList.add("py-0")
        let actions = document.createElement("div")
        actions.classList.add("btn-group")
        actions.setAttribute("role", "group")
        let selectButton = document.createElement("button")
        selectButton.setAttribute("id", "sel-" + subject.sigla)
        selectButton.setAttribute("type", "button")
        selectButton.classList.add("btn", "btn-secondary")
        selectButton.textContent = "Seleccionar"
        selectButton.addEventListener("click", e => {
            subject.selectRamo()
            this.updateState(subject)
        })
        if(subject.selected)
            selectButton.textContent = "Deseleccionar"
        actions.append(selectButton)
        let editButton = null
        let editCatEventListener = null
        if (this.advanced) {
            editButton = document.createElement("button")
            editButton.setAttribute("type", "button")
            editButton.classList.add("btn", "btn-secondary")
            editButton.textContent = "Editar"
            editCatEventListener = this.editSubject.bind(this, subject)
            editButton.addEventListener("click", this.setUpModal.bind(this, true, subject))
            actions.append(editButton)
        }

        if (subject.isCustom) {
            let deleteButton = document.createElement("button")
            deleteButton.setAttribute("id", "delete-" + subject.sigla)
            deleteButton.classList.add("btn", "btn-danger")
            deleteButton.textContent = "Eliminar"
            deleteButton.addEventListener("click", e => {this.deleteSubject(subject)})
            actions.appendChild(deleteButton)
        } else {
            let restoreButton = document.createElement("button")
            restoreButton.setAttribute("id", "restore-" + subject.sigla)
            restoreButton.classList.add("btn", "btn-danger")
            restoreButton.textContent = "Restaurar"
            restoreButton.addEventListener("click", e => {this.restoreSubject(subject)})
            actions.appendChild(restoreButton)
        }
        actionsCol.append(actions)

        subjectInfo.append(subjectRow)
        subjectInfo.append(subjectNameCol)
        subjectInfo.append(subjectCreditsCol)
        subjectInfo.append(subjectState)
        if (this.advanced)
            subjectInfo.append(subjectPrer)
        subjectInfo.append(actionsCol)
        subjectInfo.childNodes.forEach(x => x.classList.add("align-middle"))
        if (subjectInfo.animate)
            subjectInfo.animate(fadeIn, 500)

        this.subjectTable.append(subjectInfo)
        this.tableList[subject.sigla] = [subjectInfo, editCatEventListener]


    }

    // Elimina la asignatura de la tabla
    unDisplaySubject(subject) {
        this.subjectTable.querySelector("#custom-" + subject.sigla).remove()
        delete this.tableList[subject.sigla]
    }

    // Actualiza la asignatura en la tabla con nuevos datos
    updateState(subject) {
        if (!subject.isCustom) {
            if (!subject.beenEdited) {
                return;
            } else if (this.tableList[subject.sigla] === undefined) {
                this.displaySubject(subject)
                return
            }
        }
        let subjectRow = this.tableList[subject.sigla][0].childNodes
        subjectRow[1].textContent = subject.name
        subjectRow[2].textContent = subject.getUSMCredits() + " USM | " + subject.getSCTCredits() + " SCT"
        if (this.advanced) {
            let subjectPrer = subjectRow[4]
            subjectPrer.textContent = null
            let i = 0
            subject.prer.forEach(prer => {
                if (i === 0) {
                    subjectPrer.textContent = prer
                    i = 1
                } else
                    subjectPrer.textContent += " | " + prer
            })
            if (subjectPrer.textContent.length === 0)
                subjectPrer.textContent = "Sin prerrequisitos"
        }
        let subjectState = subjectRow[3]
        subjectState.textContent = "No seleccionado"
        if (subject.selected) {
            subjectState.textContent = "Seleccionado"
        //} else if () {
        } else {
            let i = true
            Object.keys(this.semesterManager.selectedPerSemester).forEach(semester => {
                if (semester !== this.semesterManager.semester) {
                    let found = this.semesterManager.selectedPerSemester[semester].indexOf(subject)
                    if (found !== -1){
                        if (semester < this.semesterManager.semester)
                        if (i) {
                            subjectState.textContent = "Seleccionado en S" + semester
                            i = false
                        } else {
                            subjectState.textContent += ", S" + semester
                        }
                    }
                }
            })
        }

        let subjectSelButton = this.tableList[subject.sigla][0].querySelector("#sel-" + subject.sigla)
        if (subject.selected) {
            subjectSelButton.textContent = "Deseleccionar"
        } else
            subjectSelButton.textContent = "Seleccionar"

        if (!subject.approved) {
            subjectSelButton.removeAttribute("disabled")
        } else {
            subjectSelButton.setAttribute("disabled", "disabled")
        }

    }

    updateAllStates() {
        this.subjectList.forEach(subject => this.updateState(subject))
    }

    // Como actuar cuando se cambia de semestre
    semesterChange() {
        this.subjectList.forEach(subject => {
            this.updateState(subject)
        })
    }

    // Crea la asignatura a partir del modal
    createSubject(modal) {
        let name = modal.querySelector("#custom-name").value
        let sigla = modal.querySelector("#custom-sigla").value
        let creditsUSM = parseInt(modal.querySelector("#custom-credits-USM").value)
        let creditsSCT = parseInt(modal.querySelector("#custom-credits-SCT").value)
        if (isNaN(creditsSCT))
            creditsSCT = 0
        let prer = []


        let sectorName = "Custom"

        let subject = new SelectableRamo(name, sigla, creditsUSM, sectorName, prer, this.semesterManager.malla.SUBJECTID++, this.semesterManager.malla, creditsSCT ,true)
        this.subjectList.push(subject)
        this.semesterManager.malla.addSubject(subject)
        this.displaySubject(subject)
        this.saveSubjects()

        if (this.advanced) {
            this.saveCategories()
        }
    }

    // Crea la asignatura a partir del modal
    createAdvancedSubject() {
        let modal = this.createAdvancedSubjectModal.get(0)
        let name = modal.querySelector("#custom-namea").value
        let sigla = modal.querySelector("#custom-siglaa").value
        let creditsUSM = modal.querySelector("#custom-creditsa-USM").value
        let creditsSCT = modal.querySelector("#custom-creditsa-SCT").value
        if (isNaN(parseInt(creditsUSM))) {
            creditsUSM = 1
        } else
            creditsSCT = parseInt(creditsUSM)
        if (isNaN(parseInt(creditsSCT)))
            creditsSCT = 2
        else
            creditsSCT = parseInt(creditsSCT)

        let sectorName = modal.querySelector('#sectorChooser').value;
        let dictatesIn = modal.querySelector('#dictatesIn').value;
        let prer = []
        modal.querySelector("#prerList").querySelectorAll("li").forEach(item => {
            prer.push(item.getAttribute("id").slice(4))
        })
        let subject = new SelectableRamo(name, sigla, creditsUSM, sectorName, prer, this.semesterManager.malla.SUBJECTID++, this.semesterManager.malla, creditsSCT ,true, dictatesIn)
        this.subjectList.push(subject)
        this.semesterManager.malla.addSubject(subject)
        this.createAdvancedSubjectModal.modal("hide")
        this.displaySubject(subject)
        this.saveSubjects()

    }

    // Edita la asignatura a partir del modal
    editSubject(subject) {
        let modal = this.createAdvancedSubjectModal.get(0)
        subject.name = modal.querySelector("#custom-namea").value
        subject.category = modal.querySelector("#sectorChooser").value
        subject.prer = new Set(this.subjectModalPrer)
        subject.dictatesIn = modal.querySelector('#dictatesIn').value;

        let creditsUSM = modal.querySelector("#custom-creditsa-USM").value
        let creditsSCT = modal.querySelector("#custom-creditsa-SCT").value
        if (creditsSCT.length === 0)
            creditsSCT = null
        subject.updateCredits(creditsUSM, creditsSCT)
        subject.verifyPrer()
        if (!subject.beenEdited)
            this.subjectList.push(subject)
        subject.beenEdited = true
        this.updateState(subject)
        this.semesterManager.updateDisplayedSubject(subject)
        this.saveSubjects()

    }

    // Elimina asignaturas creadas
    deleteSubject(subject) {
        if (subject.selected)
            subject.selectRamo()
        this.semesterManager.removeSubjectOutsideSemester(subject)
        this.unDisplaySubject(subject)


        let i = this.subjectList.indexOf(subject)
        if (i > -1) {
            this.subjectList.splice(i, 1);
            this.semesterManager.malla.delSubjects(subject)
        }
        this.saveSubjects()

    }

    restoreSubject(subject) {
        // revisa en malla.rawMalla los datos originales del ramo y los usa
        // se quita el ramo de la tabla y también si esta seleccionado, se actualiza ahi también
        // si la categoría original esta borrada, se recrea
        Object.values(this.semesterManager.malla.rawMalla).forEach(subjectList => {
            for(let rawSubject of subjectList) {
                if (rawSubject[1] === subject.sigla) {
                    subject.name = rawSubject[0]
                    subject.updateCredits(rawSubject[2], rawSubject[3])
                    subject.category = rawSubject[4]
                    subject.prer = new Set(rawSubject[5])
                    subject.dictatesIn = rawSubject[6]

                    if (subject.selected)
                        this.semesterManager.updateDisplayedSubject(subject)

                    if (JSON.stringify(this.categories[rawSubject[4]]) !== JSON.stringify(this.semesterManager.malla.categories[rawSubject[4]])) {
                        this.restoreCategory(rawSubject[4])
                    }
                    this.unDisplaySubject(subject)
                    let i = this.subjectList.indexOf(subject)
                    if (i > -1)
                        this.subjectList.splice(i, 1);
                    this.saveSubjects()
                }
            }
        })
    }

    cleanSubjects() {
        let listToClean = [...this.subjectList]
        listToClean.forEach(subject => {
            if (subject.isCustom)
                this.deleteSubject(subject)
            else
                this.restoreSubject(subject)
        })
        // se borran todos los ramos y se restauran los que lo necesiten
    }

    saveSubjects() {
        let cache = {}
        this.subjectList.forEach(subject => {
            cache[subject.sigla] = [subject.name, subject.getUSMCredits(), subject.category, [...subject.prer]]
            if (subject.USMtoSCT)
                cache[subject.sigla].push(0)
            else
                cache[subject.sigla].push(subject.getSCTCredits())
            cache[subject.sigla].push(subject.dictatesIn)
        })
        cache = JSON.stringify(cache)
        if (this.advanced) {
            localStorage["generatorUserSubjects" + this.semesterManager.malla.currentMalla] = cache
        } else {
            localStorage["priorixUserSubjects" + this.semesterManager.malla.currentMalla] = cache
        }
    }

    loadSubjects() {
        let cache
        if (this.advanced){
            cache = localStorage["generatorUserSubjects" + this.semesterManager.malla.currentMalla]
        } else {
            cache = localStorage["priorixUserSubjects" + this.semesterManager.malla.currentMalla]
        }
        if (cache === undefined) {
            // Si no encuentra nuevo cache, se busca el cache antiguo
            this.loadOldSubjects()
            return
        }
        cache = JSON.parse(cache)
        //console.log(cache)
        let prersNotFound = {}
        Object.keys(cache).forEach(sigla => {
            let data = cache[sigla]
            if (this.semesterManager.malla.ALLSUBJECTS[sigla] === undefined) {
                data[3] = data[3].filter(prer => {
                    if (this.semesterManager.malla.ALLSUBJECTS[prer] === undefined) {
                        if (prersNotFound[prer] === undefined) {
                            prersNotFound[prer] = []
                        }
                        prersNotFound[prer].push(sigla)
                        return false
                    }
                    return true
                })
                let subject = new SelectableRamo(data[0], sigla, data[1], data[2], data[3],
                    this.semesterManager.malla.SUBJECTID++, this.semesterManager.malla, data[4], true, 6 === data.length ? data[5] : "")
                this.semesterManager.malla.addSubject(subject)
                this.subjectList.push(subject)
                this.displaySubject(subject)
            } else {
                let subject = this.semesterManager.malla.ALLSUBJECTS[sigla]
                subject.name = data[0]
                subject.updateCredits(data[1], data[4])
                subject.category = data[2]
                subject.prer = new Set(data[3])
                subject.beenEdited = true
                this.subjectList.push(subject)
                this.updateState(subject)
            }
        })
        if (Object.keys(prersNotFound).length !== 0) {
            let toast = $('.toast')
            toast.toast('show')
            toast.css("zIndex","3")
            let list = d3.select('#deletedSubjects').append('ul')
            Object.keys(prersNotFound).forEach(prer => {
                let nestedList = list.append('li').text(`Ramos que tenían a ${prer} como prerrequisito`).append('ul')
                prersNotFound[prer].forEach(subject => {
                    nestedList.append('li').text(subject)
                })
            })
            d3.select('#deletedCard').classed('d-none', false)
        }

    }

    loadOldSubjects() {
        let cache
        if (this.advanced){
            cache = localStorage["Custom-" + this.semesterManager.malla.currentMalla + "_CUSTOM"]
            if (cache) {
                let prersNotFound = {}

                let customSubjects = JSON.parse(cache);

                for (let sigla in customSubjects) {
                    // inicializar ramos fuera de malla
                    let data = customSubjects[sigla];
                    let prer = [];
                    if (data.length === 6) {
                        prer = data[5]
                    } else if (!(data[4] != [])) {
                        prer = data[4]
                    }
                    prer = prer.filter(prer => {
                        if (this.semesterManager.malla.ALLSUBJECTS[prer] === undefined) {
                            if (prersNotFound[prer] === undefined) {
                                prersNotFound[prer] = []
                            }
                            prersNotFound[prer].push(sigla)
                            return false
                        }
                        return true
                    })


                    if (this.semesterManager.malla.ALLSUBJECTS[sigla] === undefined) {
                        let subject = new this.semesterManager.malla.subjectType(data[0], data[1], data[2], data[3], prer,
                            this.semesterManager.malla.SUBJECTID++, this.semesterManager.malla, 0, true);
                        this.semesterManager.malla.addSubject(subject)
                        this.subjectList.push(subject)
                        this.displaySubject(subject)
                    } else {
                        let subject = this.semesterManager.malla.ALLSUBJECTS[sigla]
                        subject.name = data[0]
                        subject.updateCredits(data[2])
                        subject.category = data[3]
                        subject.prer = prer
                        subject.beenEdited = true
                        this.updateState(subject)
                    }
                }
                delete localStorage["Custom-" + this.semesterManager.malla.currentMalla + "_CUSTOM"]
                if (Object.keys(prersNotFound).length !== 0) {
                    let toast = $('.toast')
                    toast.toast('show')
                    toast.css("zIndex","3")
                    let list = d3.select('#deletedSubjects').append('ul')
                    Object.keys(prersNotFound).forEach(prer => {
                        let nestedList = list.append('li').text(`Ramos que tenían a ${prer} como prerrequisito`).append('ul')
                        prersNotFound[prer].forEach(subject => {
                            nestedList.append('li').text(subject)
                        })
                    })
                    d3.select('#deletedCard').classed('d-none', false)
                }

            }
        } else {
            // prioridad
            cache = localStorage["prioridad-" + this.semesterManager.malla.currentMalla + "_CUSTOM"]
            if (cache) {
                cache = JSON.parse(cache);

                for (let sigla in cache) {
                    // inicializar ramos fuera de malla
                    let customSubject = cache[sigla];
                    let subject = new this.semesterManager.malla.subjectType(customSubject[0],customSubject[1],
                        customSubject[2],customSubject[3],[],this.semesterManager.malla.SUBJECTID++,
                        this.semesterManager.malla, 0,true);
                    this.semesterManager.malla.addSubject(subject)
                    this.subjectList.push(subject)
                    this.displaySubject(subject)
                }
                delete localStorage["prioridad-" + this.semesterManager.malla.currentMalla + "_CUSTOM"]
            }
        }
        this.saveSubjects()
    }

    addPrerToModal(e, prerChooser = null){
        let selector = null
        if (prerChooser)
            selector = prerChooser
        else
            selector = e.target

        let selectedOption= selector.selectedOptions[0]
        if (selectedOption.value !== 0) {
            let arText = selectedOption.textContent.split(" | ")
            this.subjectModalPrer.add(selectedOption.value)
            selectedOption.setAttribute("disabled", "disabled")
            let prer = document.createElement("li")
            prer.setAttribute("id", "pre-" + arText[1])
            prer.classList.add("list-group-item", "d-flex", "align-items-center", "pr-0", "py-0")
            let text = document.createElement("div")
            text.classList.add("flex-grow-1")
            text.textContent = arText.reverse().join(" | ")
            let delBtn = document.createElement("button")
            delBtn.classList.add("btn", "btn-danger")
            delBtn.setAttribute("type", "button")
            delBtn.textContent = "Quitar"
            delBtn.addEventListener("click", () => {
                this.subjectModalPrer.delete(selectedOption.value)
                selectedOption.removeAttribute("disabled")
                prer.remove()
            })
            prer.append(text)

            prer.append(delBtn)
            this.createAdvancedSubjectModal.get(0).querySelector("#prerList").append(prer)
        }
        selector.firstElementChild.setAttribute("selected", true)
    }

    // Category related

    // Llenado inicial de la tabla de categorías
    fillCategories() {
        Object.keys(this.categories).forEach(category => {
            this.displayCategory(category)
        })
    }

    // Se explica solo
    createCategory(catData = null) {
        let categorySN, name, color
        if (catData) {
            name = catData['name']
            categorySN = catData['categorySN']
            color = catData["color"]
        } else {
            let modal = this.categoryModal.get(0)
            name = modal.querySelector("#cat-name").value
            categorySN = modal.querySelector("#small-cat-name").value
            color = modal.querySelector("#cat-color").value
            this.categoryModal.modal("hide")
        }
        this.categories[categorySN] = [color, name]
        this.displayCategory(categorySN)
        this.saveCategories()
    }

    // Se explica solo
    editCategory(category, catData = null) {
        if (catData) {
            this.categories[category][0] = catData["color"]
            this.categories[category][1] = catData["name"]

        } else {
            let modal = this.categoryModal.get(0)
            this.categories[category][0] = modal.querySelector("#cat-color").value
            this.categories[category][1] = modal.querySelector("#cat-name").value
        }
        this.updateCategory(category)
        this.saveCategories()
    }

    deleteCategory(categorySN) {
        // se recorren todos los ramos y si pertenecen a esa categoria se cambia a Custom
        // luego se elimina la categoría
        this.categoryList[categorySN].remove()
        delete this.categoryList[categorySN]
        delete this.categories[categorySN]
        Object.values(this.semesterManager.malla.ALLSUBJECTS).forEach(subject => {
            if (subject.category === categorySN) {
                subject.category = "Custom"
                subject.beenEdited = true
                this.subjectList.push(subject)
                this.updateState(subject)
            }
        })
        this.saveSubjects()
        this.saveCategories()
    }

    restoreCategory(categorySN = "Custom", a=null) {
        let data = {"categorySN" : categorySN}
        if (categorySN === "Custom") {
            data["name"] = this.defaultSector[1]
            data["color"] = this.defaultSector[0]
        } else {
            data["name"] = this.semesterManager.malla.categories[categorySN][1]
            data["color"] = this.semesterManager.malla.categories[categorySN][0]
        }
        if (this.categories[categorySN] === undefined)
            this.createCategory(data)
        else
            this.editCategory(categorySN, data)
    }

    restoreCategories() {
        // se eliminan los ramos no originales y se recrean lo originales borrados
        // no se editan las categorías de los ramos
        let categories =  this.semesterManager.malla.categories
        Object.keys(this.categories).forEach(category =>{
            if (categories[category] === undefined)
                this.deleteCategory(category)
        })
        Object.keys(categories).forEach(category => {
            this.restoreCategory(category)
        })
        this.restoreCategory("Custom")

    }

    setUpCategoryModal(isEdit=false, category="Custom") {
        if (isEdit) {
            let modal = this.categoryModal.get(0)
            modal.querySelector("#cat-name").value = this.categories[category][1]
            let categorySN = modal.querySelector("#small-cat-name")
            categorySN.value = category
            categorySN.setAttribute("disabled", true)
            modal.querySelector("#cat-color").value = this.categories[category][0]
            this.editCatEventListener = this.editCategory.bind(this, category, null)
            this.deleteCatEventListener = this.deleteCategory.bind(this, category)
            if (category === "Custom") {
                modal.querySelector("#sectorDeleteButton").classList.add("d-none")
            } else {
                modal.querySelector("#sectorDeleteButton")
                    .addEventListener("click", this.deleteCatEventListener)
            }
            modal.querySelector("#sectorDoneButton")
                .addEventListener("click", this.editCatEventListener)
            modal.querySelector("#catTitle").textContent = "Editar"
            modal.querySelector("#sectorDoneButton").textContent = "Editar"

            this.categoryModal.modal("show")
        } else {
            this.categoryModal.get(0).querySelector("#sectorDeleteButton").classList.add("d-none")
            this.categoryModal.get(0).querySelector("#sectorDoneButton")
                .addEventListener("click", this.createCatEventListener)
        }
    }

    // Se explica solo
    displayCategory(categorySN) { // ShortName
        let category = document.createElement("button")
        category.classList.add("list-group-item",
            "list-group-item-action",
            "sector")

        let color = this.categories[categorySN][0]
        if (this.needsWhiteText(color))
            category.classList.add("text-white")

        category.setAttribute("type", "button")
        category.setAttribute("id", "cat-" + categorySN)
        category.style.backgroundColor = color
        category.textContent = this.categories[categorySN][1]
        category.addEventListener("click", this.setUpCategoryModal.bind(this, true, categorySN))
        this.categoryManager.append(category)
        this.categoryList[categorySN] = category
    }

    // Actualiza la categoría según la edición del usuario
    updateCategory(categorySN) {
        let category = this.categoryList[categorySN]
        category.style.backgroundColor = this.categories[categorySN][0]
        if (this.needsWhiteText(this.categories[categorySN][0]))
            category.classList.add("text-white")
        else
            category.classList.remove("text-white")
        category.textContent = this.categories[categorySN][1]
    }

    saveCategories() {
        localStorage["generatorUserCategory" + this.semesterManager.malla.currentMalla] = JSON.stringify(this.categories)
    }

    loadCategories() {
        let cache = localStorage["generatorUserCategory" + this.semesterManager.malla.currentMalla]
        if (cache) {
            cache = JSON.parse(cache)
            //console.log(this.categoryManager.children)
            this.categories = cache
        } else {
            this.loadOldCategories()
        }
        this.fillCategories()
    }

    loadOldCategories() {
        let cache = localStorage["Custom-" + this.semesterManager.malla.currentMalla + "_SECTORS"]
        if (cache) {
            cache = JSON.parse(cache)
            //console.log(this.categoryManager.children)
            Object.keys(cache).forEach(categorySN => {
                this.categories[categorySN] = cache[categorySN]
            })
            //delete localStorage["Custom-" + this.semesterManager.malla.currentMalla + "_SECTORS"]
            this.saveCategories()
            delete localStorage["Custom-" + this.semesterManager.malla.currentMalla + "_CUSTOM"]
        }
    }

    // Retorna un booleano dependiendo si el hex entregado contrasta mejor con blanco
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