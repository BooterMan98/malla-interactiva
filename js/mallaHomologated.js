
// Futuro remplazo de canvas.js

class MallaHomologated extends Malla {

    constructor(sct = false, subjectType = HomologatedRamo, scaleX = 1, scaleY = 1) {
        super(sct, subjectType, scaleX, scaleY);
        this.homologated = [];
        this.hasSetCarrerPromise = null
    }


    setCareer(carr, fullCareerName, relaPath) {
        let setPromise = super.setCareer(carr, fullCareerName, relaPath);
        this.hasSetCarrerPromise = setPromise
        return setPromise
    }

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
                    // Nuevo formato con ramos SCT
                let homologations = []
                    if (subject.length === 8) {
                        homologations = subject[7]
                    }
                this.malla[semester][subject[1]] = new this.subjectType(subject[0], subject[1], subject[2], subject[4], subject[5],this.SUBJECTID++, this, subject[3], false ,subject[6], homologations)
                
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

    defineHomologatedRamos(oldAprovedSubjects) {
        while (this.homologated.length > 0) {
            let ramo = this.homologated.pop()
            ramo.deHomologateRame()
        }
        this.verifyPrer()
        for (let subject of Object.values(this.ALLSUBJECTS)) {
            let isHomologatable = subject.checkHomologatability(oldAprovedSubjects)
            if (isHomologatable) {
                subject.homologateRamo()
                this.homologated.push(subject)
            } 
        }
    }

    homologateButton() {
        if (this.hasSetCarrerPromise != null) {
            this.hasSetCarrerPromise.then(() => {
                this.defineHomologatedRamos
            })
       } else {
            this.drawMalla(".homologatedMalla")
        }   
    }
}