class CustomMalla extends Malla {
    constructor(sct = false, ramoType = Ramo, scaleX = 1, scaleY = 1) {
        super(sct, ramoType, scaleX, scaleY);
        this.customSectors = undefined
        this.customSubjects = undefined
        this.customMalla = undefined
    }

    // Hace los mismo que el originar, solo que ademas obtiene primero los datos guardados de la generadora
    setCareer(carr, fullCareerName, relaPath) {
        let customSectors = localStorage["generatorUserCategory" + carr]
        let customSubjects = localStorage["generatorUserSubjects" + carr]
        let customMalla = localStorage["generatorUserData" + carr]
        if (customSubjects !== undefined)
            this.customSubjects = JSON.parse(customSubjects)
        if (customSectors !== undefined)
            this.customSectors = JSON.parse(customSectors)
        if (customMalla !== undefined)
            this.customMalla = JSON.parse(customMalla)

        return super.setCareer(carr, fullCareerName, relaPath);
    }

    setMallaAndCategories(malla, sectors) {
        if (this.customMalla === undefined) {
            super.setMallaAndCategories(malla,sectors)
            return
        }
        let longest_semester = 0;
        let totalCredits = 0;
        let totalRamos = 0;

        let subjectsList = new Set()
        let categoriesToUse = new Set()
        // Se crea una lista de todos los ramos de la malla
        Object.values(this.customMalla).forEach(list => {
            subjectsList = new Set([...subjectsList, ...list])
            if (list.length > longest_semester)
                longest_semester = list.length
            totalRamos += list.length

        })
        this.longestSemester = longest_semester;
        this.totalSubjects = totalRamos

        Object.keys(this.customMalla).forEach(semester => {
            this.malla[semester] = {};
            this.customMalla[semester].forEach(sigla => {

                // Buscar ramo en ramos oficiales
                Object.keys(malla).forEach(semester2 => {
                    let i = 0
                    for (i; i < malla[semester2].length; i++) {
                        if (malla[semester2][i][1] === sigla && this.customSubjects[sigla] === undefined) {
                            // Si se encuentra, y no fue editado
                            let subject = malla[semester2][i]
                            if (subject.length === 7) {
                                // Nuevo formato con ramos SCT
                                let prer = [...subject[5]]
                                categoriesToUse.add(subject[4])
                                prer.forEach(prer => {
                                    // se quitan los prerrequisitos que no estan en la malla
                                    if (!subjectsList.has(prer))
                                        subject[5].splice(subject[5].indexOf(prer),1)
                                })
                                this.malla[semester][sigla] = new this.subjectType(subject[0], subject[1], subject[2], subject[4], subject[5],this.SUBJECTID++, this, subject[3],false ,subject[6])
                            } else {
                                // Formato viejo
                                categoriesToUse.add(subject[3])
                                this.malla[semester][sigla] = new this.subjectType(subject[0], subject[1], subject[2], subject[3], (function hasPrer() {
                                    if (subject.length > 4) {
                                        let prer = [...subject[4]]
                                        // se quitan los prerrequisitos que no estan en la malla
                                        prer.forEach(prer => {
                                            if (!subjectsList.has(prer))
                                                subject[4].splice(subject[4].indexOf(prer),1)
                                        })
                                        return subject[4];
                                    }
                                    return [];
                                })(), this.SUBJECTID++, this);
                            }
                        return
                        }
                    }
                })

                // Si existe una edicion o no estaba en la malla oficial
                if (this.customSubjects){
                    if (this.customSubjects[sigla] !== undefined) {
                        let data = this.customSubjects[sigla]
                        categoriesToUse.add(data[2])
                        let prer = [...data[3]]
                        prer.forEach(prer => {
                            if (!subjectsList.has(prer))
                                data[3].splice(data[3].indexOf(prer), 1)
                        })
                        this.malla[semester][sigla] = new this.subjectType(data[0], sigla, data[1], data[2], data[3],
                            this.SUBJECTID++, this, data[4], false, data[5])
                    }
                    totalCredits += this.malla[semester][sigla].getDisplayCredits()
                    this.addSubject(this.malla[semester][sigla])
                }
            })
        })
        this.totalCredits = totalCredits
        this.categories = {}
        let categories
        if (this.customSectors)
            categories = this.customSectors
        else
            categories = sectors

        categoriesToUse = [...categoriesToUse]
        categoriesToUse.forEach(category => {
            this.categories[category] = categories[category]
        })

        this.isMallaSet = true;
    }
}