/*
 * Obtencion de archivos JS de manera paralela y carga sincronica
 */
//loadjs(['https://kit.fontawesome.com/bf671ef02a.js', 'https://cdnjs.cloudflare.com/ajax/libs/d3/4.13.0/d3.min.js', '/js/ramos.js', '/js/canvas.js'], 'init');
/*loadjs.ready('init', {
    success: function() { console.log("Recursos cargados") },
    error: function(depsNotFound) {
        Swal.fire(
            "Fallo al cargar",
            "Tuvimos problemas al cargar algunas dependencias... el sitio se recargara en 5 segundos.",
            "error"
        );
        setTimeout(function(){
            location.reload();
        }, 5000);
    },
});*/

(function () { // comment out this if needed
  const allowedHosts = ['localhost', 'booterman98.github.io']; 
  const currentHost = window.location.hostname;

  if (!allowedHosts.includes(currentHost)) {
    window.location.href = 'https://booterman98.github.io/malla-interactiva/';
  }
})();

let vh = window.innerHeight * 0.01;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty('--vh', `${vh}px`);
window.addEventListener('resize', () => {
    // We execute the same script as before
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
});

function render(props) {
    return function(tok, i) {
        return (i % 2) ? props[tok] : tok;
    };
}
let relaPath = './'
let prioridad = document.URL.includes('prioridad')
let personalizar = document.URL.includes('personalizar')
let mallaPersonal = document.URL.includes("malla.")
let contact = document.URL.includes("contact")
let fullCareerName = ""
let homologatedTo = null
let homologatedName = ""
let texts = "Malla"
if (mallaPersonal)
    texts = "Personal"
else if (prioridad)
    texts = "Prioridad"
else if (personalizar)
    texts = "Generadora"

if (texts !== "Malla" || contact) {
    relaPath = '../'
}
// Disabled due to safari bug
/*if ('serviceWorker' in navigator) {
    console.log("Service worker compatible")
    window.addEventListener('load', function() {
        navigator.serviceWorker.register(relaPath + 'serviceWorker.js').then(function(registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}*/

let params = new URLSearchParams(window.location.search)

let carr = localStorage.getItem("currentCarreer")

if (params.get('m')) {
    carr = params.get('m')
    localStorage.setItem("currentCarreer", carr)
}

// update the url for feedback
if (carr) {
    let url = new URL(window.location.href)
    url.searchParams.set('m', carr)
    window.history.pushState({}, '', url);
}


if (!carr)
    carr = 'INF'

let sct = true
if (params.get('SCT') === "false")
    sct = false

// document.addEventListener("DOMContentLoaded", loadViews)
//
// window.addEventListener("load", function () {console.log("load")})
// function loadViews() {
    console.log("dom")
    // obtener vistas
    let includes = document.querySelectorAll('[data-include]')
    let promises = []
    let welcomeTexts = {}
    includes.forEach(include => {
        let fileURL = relaPath + 'views/' + include.attributes['data-include'].nodeValue + '.html';
        promises.push(fetch(fileURL).then(response => response.text())
            .then(data => {
                include.insertAdjacentHTML("afterbegin", data)
            }))
    })
    let fileURL = relaPath + "data/welcomeTexts.json"
    promises.push(fetch(fileURL).then(response => response.json()))
    Promise.all(promises)
        .then( () => {
            return fetch(new Request(relaPath + "date.txt"))
        }).then(response => {
            console.log(response)
            let lastModified = response.headers.get("last-modified")
            let date = new Date(lastModified)
            console.log(date)
            document.getElementById("lastUpdate").textContent = date.toLocaleString()
        })
    let bigPromise = Promise.all(promises).then((datas) => {
        welcomeTexts = datas.pop()[texts]

        let home = document.getElementById("goToHome")
        let calculator = document.getElementById("goToCalculator")
        let generator = document.getElementById("goToGenerator")
        let goToContact = document.getElementById("contact")
        if (!mallaPersonal) {
            if (!prioridad)
                calculator.setAttribute("href", relaPath + 'prioridad/?m=' + carr)
            else
                calculator.classList.add("active")
            if (!personalizar)
                generator.setAttribute("href", relaPath + 'personalizar/?m=' + carr)
            else {
                generator.classList.add("active")
                document.getElementById("generate").setAttribute("href", "./malla.html?m=" + carr)
            }
        } else
            generator.setAttribute("href", relaPath + 'personalizar/?m=' + carr)
        if (contact)
            goToContact.classList.add("active")
        goToContact.setAttribute("href", relaPath + "contact/")
        home.setAttribute("href", relaPath + '?m=' + carr)
        return fetch(relaPath + '/data/carreras.json')
    }).then(response => response.json()).then((careers,) => {
        //if (!mallaPersonal) {
            let tabTpl1 = document.querySelector('script[data-template="tab-template1"]').text.split(/\${(.+?)}/g);
            let tabTpl2 = document.querySelector('script[data-template="tab-template2"]').text.split(/\${(.+?)}/g);
            if (contact) {
                document.querySelectorAll(".carrers").forEach(element => element.remove())
            }

            careers.forEach(career => {
                if (career['Link'] === carr) {
                    console.log(career)
                    fullCareerName = career["Nombre"]
                    homologatedTo = career["homologatedTo"]
                    console.log(homologatedTo)
                    console.log("homo 2")
                    welcomeTexts["welcomeTitle"] = welcomeTexts["welcomeTitle"].replace("CARRERA", career['Nombre'])
                    $('.carrera').text(career['Nombre'])
                    if (mallaPersonal) {
                     let title = document.title
                     document.title = title + " basada en " + career['Nombre']
                    } else {
                        let title = document.title.slice(0, 17)
                        title += " " + career['Nombre']
                        title += document.title.slice(17)
                        document.title = title
                    }
                }
            });

            homo = careers.find((career) => career['Link'] == homologatedTo)
            if (homo != null) {
                homologatedName = homo["Nombre"]
            }
            $('#carreras1-nav').append(careers.map(function (values) {
                return tabTpl1.map(render(values)).join('');
            }));
            $('#carreras2-nav').append(careers.map(function (values) {
                return tabTpl2.map(render(values)).join('');
            }));
            if ( document.querySelector(".overlay-content h1")){
            document.querySelector(".overlay-content h1").textContent = welcomeTexts["welcomeTitle"]
            document.querySelector(".overlay-content h5").textContent = welcomeTexts["welcomeDesc"]
        }
    })
// }

function removeHomologatedPopUp() {
    d3.selectAll(".inset-overlay").style("-webkit-backdrop-filter", "blur(0px) contrast(100%)");
    d3.selectAll(".inset-overlay").style("backdrop-filter", "blur(0px) contrast(100%)");
    d3.select(".overlay-content").transition().style("filter", "opacity(0)")
    d3.select(".inset-overlay").transition().style("filter", "opacity(0)").on('end', function() {
        d3.select(this).remove();
    })
}
function removePopUp() {
    d3.select("body").style("overflow", "initial")
    d3.selectAll(".overlay").style("-webkit-backdrop-filter", "blur(0px) contrast(100%)");
    d3.selectAll(".overlay").style("backdrop-filter", "blur(0px) contrast(100%)");
    d3.select(".overlay-content").transition().style("filter", "opacity(0)")
    d3.select(".overlay").transition().style("filter", "opacity(0)").on('end', function() {
        d3.select(this).remove();
    })
}

function doRendering () {
    let fulfillBeforeFirstRender = []
      if (contact)
          return

      if (sct) {
          document.getElementById("creditsExample").textContent = "Créditos SCT";
          let credit = parseInt(document.getElementById("creditsNumberExample").textContent);
          document.getElementById("creditsNumberExample").textContent = (Math.round(credit * 5 / 3)).toString()
      }


      let malla = null
      let semesterManager = null
      if (prioridad) {
          malla = new Malla(sct, SelectableRamo, 0.804, 1)
          malla.enableCreditsSystem()
          document.getElementById("custom-credits-USM").addEventListener("input", function updateSCTPlaceholder() {
              if (this.value == "")
                  document.getElementById("custom-credits-SCT").setAttribute("placeholder", "Ingrese un valor")
              else
                  document.getElementById("custom-credits-SCT").setAttribute("placeholder", Math.round(this.value * 5/3).toString())
          })

      } else if (personalizar && !mallaPersonal) {
          malla = new Malla(sct, SelectableRamo, 0.804, 1)
          malla.enableCreditsSystem()
          document.getElementById("custom-credits-USM").addEventListener("input", function updateSCTPlaceholder() {
              if (this.value == "")
                  document.getElementById("custom-credits-SCT").setAttribute("placeholder", "Ingrese un valor")
              else
                document.getElementById("custom-credits-SCT").setAttribute("placeholder", Math.round(this.value * 5/3).toString())
          })
          document.getElementById("custom-creditsa-USM").addEventListener("input", function updateSCTPlaceholder() {
              if (this.value == "")
                  document.getElementById("custom-creditsa-SCT").setAttribute("placeholder", "Ingrese un valor")
              else
                  document.getElementById("custom-creditsa-SCT").setAttribute("placeholder", Math.round(this.value * 5/3).toString())
          })


          //document.getElementById("#reset").addEventListener("click", () => malla.semesterManager.cleanSemester())
          //document.getElementById("#resetc").addEventListener("click", () => malla.semesterManager.cleanAll())
      } else  if (mallaPersonal) {
          malla = new CustomMalla(sct)
          document.getElementById("cleanApprovedButton").addEventListener("click",() => malla.cleanSubjects())
          malla.enableCreditsStats()
          malla.enableCreditsSystem()
      } else {
          malla = new Malla(sct);
          malla.enableCreditsStats()
          malla.enableCreditsSystem()
          malla.enableSave()
        console.log(homologatedTo)
        console.log(carr)
        console.log(fullCareerName)
           if (homologatedTo != null) {
                let homologatedMalla = new MallaHomologated(sct)
                let manager = new MallaManager(malla, homologatedMalla)
                fulfillBeforeFirstRender.push(homologatedMalla.setCareer(homologatedTo, homologatedName, relaPath))
                console.log("homo")
               document.getElementById("homologate").addEventListener("click", () => manager.renderHomologateMalla())
           }
          document.getElementById("cleanApprovedButton").addEventListener("click", () => malla.cleanSubjects())

      }
      fulfillBeforeFirstRender.push(malla.setCareer(carr, fullCareerName, relaPath))
      let drawnMalla = Promise.all(fulfillBeforeFirstRender) .then((val) => {
          return malla.drawMalla(".canvas")
      });
      drawnMalla.then(() => {
          malla.updateStats()
          malla.displayCreditSystem()
          malla.showColorDescriptions(".color-description")
          document.getElementById("overlay").addEventListener("click", () => {
              if (prioridad || personalizar && !mallaPersonal) {
                  malla.semesterManager.loadSemesters()
              } else
                  malla.loadApproved()
              malla.enablePrerCheck()
          })
      })
      drawnMalla.then(() => {
          if (prioridad){
              semesterManager = new Priorix(malla, "#priorix")
              semesterManager.subjectsInManySemesters = true
              semesterManager.mallaEditor.loadSubjects()
          }
          else if (personalizar && !mallaPersonal) {
              semesterManager = new Generator(malla, "#priorix")
              semesterManager.mallaEditor.loadSubjects()
              semesterManager.mallaEditor.loadCategories()
          }
          malla.setSemesterManager(semesterManager)
          malla.generateCode()


      })
  };

function changeCreditsSystem() {
    let key = 'SCT'
    let value = 'false'
    const params = new URLSearchParams(window.location.search);
    if (params.has(key)) {
        value = !('true' === params.get(key))
    }
    key = encodeURI(key); value = encodeURI(value);
    var kvp = document.location.search.substr(1).split('&');

    var i=kvp.length; var x; while(i--)
{
    x = kvp[i].split('=');

    if (x[0]===key)
    {
        x[1] = value;
        kvp[i] = x.join('=');
        break;
    }
}

    if(i<0) {kvp[kvp.length] = [key,value].join('=');}

    //this will reload the page, it's likely better to store this until finished
    document.location.search = kvp.join('&');
}

bigPromise.then(() => {
    doRendering()
})