const VITEZA_ROTATIE = 400
const VITEZA_DEPLASARE = 5 // 5px/sec
const VITEZA_ASTEROID = 50
const VITEZA_RACHETA = 500 // px/sec
const CADRE = 30 // cadre/sec
const NUMAR_ASTEROIZI = 4
const MAX_RAZA_ASTEROID = 40
const DIMENSIUNE_RACHETA = 5
const NR_MAXIM_RACHETE = 3
const SCOR_REGENERARE = 100
const NUMAR_MAXIM_VIETI = 3

var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d")

var scorSalvat = false
var topScoruriAfisat = false
var jucator = prompt("Alegeti un nume:", "");

if (jucator === null || jucator === ""){
    document.location.reload()
}

var nava = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    raza: 15,
    //nava va incepe cu varful in sus fapt pt care am ales 90
    //operatia de dupa e pentru a transforma in radiani ca sa putem calcula mai departe
    directie: 90  / 180 * Math.PI,
    nrRachete: NR_MAXIM_RACHETE
}

var scor = 0
var asteroizi = []
var rachete = []
var numarVieti = 3
genereazaAsteroizi()

document.addEventListener("keydown", press)
canvas.addEventListener('touchstart', touch)

function genereazaAsteroizi(){
    asteroizi = []
    var xNou
    var yNou
    for(i = 0; i < NUMAR_ASTEROIZI; i++) {
        //pentru a nu genera din prima langa/peste nava
        do {
            xNou = Math.floor(Math.random() * canvas.width)
            yNou = Math.floor(Math.random() * canvas.height)
        } while (calculDistanta(nava.x, nava.y, xNou, yNou) < 200)
        asteroizi.push(asteroidNou(xNou, yNou))
    }
}

function calculDistanta(x, y, w, z){
    return Math.sqrt(Math.pow(w - x, 2) + Math.pow(z - y, 2));
}

function obtineScoruriSortate(){
    chei = Object.keys(localStorage)
    scoruri = []
    for(cheie of chei){
        scoruri.push([cheie, localStorage.getItem(cheie)])
    }
    scoruri.sort(function(x, y) {
        return x[1] - y[1];
    })
    return scoruri
}

function deseneazaTopScoruri(){
    if(!topScoruriAfisat){
        scoruri = obtineScoruriSortate()
        var topScoruriString = "Top Scoruri:"
        ctx.save()
        ctx.fillStyle="white"
        ctx.font = "20px serif"
        coordonataX = canvas.width / 2 - ctx.measureText(topScoruriString).width / 2
        coordonataY = 25
        ctx.fillText(topScoruriString, 
            coordonataX,
            coordonataY)
        for(var i=0; i < scoruri.length; i++){
            ctx.fillText(scoruri[i][0] + ": " + scoruri[i][1], 
                coordonataX + 10,
                coordonataY+ (scoruri.length-i) * 20)
        }
        ctx.restore()
    }
    TOP_SCOR_AFISAT = true
}

function salveazaScor(utilizator, scor){
    if(!scorSalvat){
        if(localStorage.length < 5){
            localStorage.setItem(utilizator, scor);        
        }else{
            // verificam daca jucatorul curent este deja in top
            scorJucatorTop = localStorage.getItem(utilizator)
            if(scorJucatorTop){
                if (parseInt(scorJucatorTop) < scor)
                    localStorage.setItem(utilizator, scor)
            }else{
                scoruri = obtineScoruriSortate()
                for(scorTop of scoruri){
                    if(scor > parseInt(scorTop[1])){
                        localStorage.setItem(utilizator, scor)
                        localStorage.removeItem(scorTop[0])
                        break
                    }
                }
            }
        }
    }
    scorSalvat = true
}

function press(e){
    if(e.key === 'c') {
        nava.directie += -VITEZA_ROTATIE / 180 * Math.PI / CADRE
    }
    if(e.key === 'z') {
        nava.directie += VITEZA_ROTATIE / 180 * Math.PI / CADRE
    }
    if(e.key === 'x') {
        if(nava.nrRachete){
            trage()
        }
    }
    if(e.key === 'ArrowRight') {
        nava.x += VITEZA_DEPLASARE
        if(nava.x > canvas.width) {
            nava.x = 0
        }
    }
    if(e.key === 'ArrowDown') {
        nava.y += VITEZA_DEPLASARE
        if(nava.y > canvas.height) {
            nava.y = 0
        }
    }
    if(e.key === 'ArrowLeft') {
        nava.x -= VITEZA_DEPLASARE
        if(nava.x < 0) {
            nava.x = canvas.width
        }
    }
    if(e.key === 'ArrowUp') {
        nava.y -= VITEZA_DEPLASARE
        if(nava.y < 0) {
            nava.y = canvas.height
        }
    }
    if(e.key === 'p') {
        window.location.reload()
        topScoruriAfisat = false
        scorSalvat = false
    }
}

function touch(e){
    e.preventDefault();
    if(nava.nrRachete)
        trage()
}

function asteroidNou(x, y){
    var asteroidNou = {
        x: x,
        y: y,
        deplasareLateral: Math.random() * VITEZA_ASTEROID / CADRE * (Math.random() < 0.5? 1 : -1),
        deplasareVertical: Math.random() * VITEZA_ASTEROID / CADRE * (Math.random() < 0.5? 1 : -1),
        raza: MAX_RAZA_ASTEROID,
        nrRachete: Math.floor(Math.random() * 5)
    }
    //ajusteaza raza in functie de numarul de rachete
    var nrRachete = asteroidNou.nrRachete < 1 ? 1 : asteroidNou.nrRachete
    var razaActualizata = nrRachete * 10
    asteroidNou.nrRachete = nrRachete
    asteroidNou.raza = razaActualizata
    return asteroidNou
}

function trage(){
    var racheta = {
        x:nava.x,
        y:nava.y,
        dx: VITEZA_RACHETA * Math.cos(nava.directie) / CADRE,
        dy: -VITEZA_RACHETA * Math.sin(nava.directie) / CADRE
    }
    rachete.push(racheta)
    nava.nrRachete--
}

function createNava(){
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        raza: 15,
        directie: 90  / 180 * Math.PI,
        nrRachete: NR_MAXIM_RACHETE
    }
}

function cadruNou() {
    if(numarVieti){
    //desenez fundalul
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    //desenez nava
    ctx.save()
    ctx.strokeStyle = "#d90166"
    ctx.lineWidth = 2
    ctx.beginPath()

    ctx.moveTo( //varful navei
        nava.x + nava.raza * Math.cos(nava.directie), //cos vertical
        nava.y - nava.raza * Math.sin(nava.directie) //sin orizontal
    )
    ctx.lineTo( //linia stanga
        nava.x - nava.raza * (Math.cos(nava.directie) + Math.sin(nava.directie)),
        nava.y + nava.raza * (Math.sin(nava.directie) - Math.cos(nava.directie))
    )
    ctx.lineTo( //linia de jos
        nava.x - nava.raza * (Math.cos(nava.directie) - Math.sin(nava.directie)),
        nava.y + nava.raza * (Math.sin(nava.directie) + Math.cos(nava.directie))
    )
    ctx.closePath()
    ctx.stroke()
    ctx.restore()

    // actualizeaza numarul de rachete bazat pe dimensiunea listei de rachete lansate
    nava.nrRachete = NR_MAXIM_RACHETE - rachete.length

    var culoriAsteroizi = ["white", "red", "orange", "yellow" , "purple"]
    // deseneaza rachetele
    for(var i=0; i < rachete.length; i++){
        racheta = rachete[i]
        ctx.fillStyle = "white";
        ctx.fillRect(racheta.x - DIMENSIUNE_RACHETA / 2, racheta.y - DIMENSIUNE_RACHETA / 2, 
            DIMENSIUNE_RACHETA, DIMENSIUNE_RACHETA);
        racheta.x+=racheta.dx
        racheta.y+=racheta.dy
        // daca racheta a iesit din canvas, o scoatem din calcul
        if(racheta.x < 0 || racheta.x > canvas.width){
            rachete.splice(i,1)
            i-- // pentru a evita cazul in care avem mai multe rachete care indeplinesc criteriul
        }else if(racheta.y < 0 || racheta.x > canvas.height){
            rachete.splice(i,1)
            i-- // pentru a evita cazul in care avem mai multe rachete care indeplinesc criteriul
        }
    }
    // deseneaza asteroizii
    if (asteroizi.length){
    for(var i = 0; i < asteroizi.length; i++) {
        var asteroid = asteroizi[i]
        ctx.fillStyle = culoriAsteroizi[asteroid.nrRachete]
        ctx.beginPath()
        ctx.arc(asteroid.x, asteroid.y, asteroid.raza, 0, Math.PI * 2, false)
        ctx.fill()
        ctx.closePath()
        ctx.strokeStyle = "black"
        ctx.strokeText(asteroid.nrRachete.toString(), asteroid.x-3, asteroid.y+3)

        asteroid.x += asteroid.deplasareLateral
        asteroid.y += asteroid.deplasareVertical

        if(asteroid.y > canvas.height + asteroid.raza) {
            asteroid.y = 0 - asteroid.raza
        }
        if(asteroid.x > canvas.width + asteroid.raza) {
            asteroid.x = 0 - asteroid.raza
        }
        if(asteroid.y < 0 - asteroid.raza) {
            asteroid.y = canvas.height + asteroid.raza
        }
        if(asteroid.x < 0 - asteroid.raza) {
            asteroid.x = canvas.width + asteroid.raza
        }
        
        if(calculDistanta(nava.x, nava.y, asteroid.x, asteroid.y) < nava.raza + asteroid.raza) {
            numarVieti--
            nava = createNava()
        }

        // calculeaza impact racheta/asteroid
        for(var k=rachete.length-1;k>=0;k--){
            racheta = rachete[k]
            if(calculDistanta(asteroid.x, asteroid.y,racheta.x, racheta.y) <= asteroid.raza){
                rachete.splice(k,1);
                asteroid.nrRachete--
                asteroid.raza -= 10
                scor += 10
                if(scor%SCOR_REGENERARE == 0 && numarVieti < NUMAR_MAXIM_VIETI) {
                    numarVieti ++
                }
                if(asteroid.raza == 0)
                    asteroizi.splice(i, 1)
            }
        }

        for(j = 0; j < asteroizi.length; j++){
            if(i != j) {
                var distanta = calculDistanta(asteroid.x, asteroid.y, asteroizi[j].x, asteroizi[j].y)
                if(distanta < asteroizi[j].raza + asteroid.raza) {
                    asteroid.deplasareLateral = -1 * asteroid.deplasareLateral
                    asteroid.deplasareVertical = -1 * asteroid.deplasareVertical
                    asteroizi[j].deplasareLateral = -1 * asteroizi[j].deplasareLateral
                    asteroizi[j].deplasareVertical = -1 * asteroizi[j].deplasareVertical
                }
            }
        }
    }
    }else{
        genereazaAsteroizi()
    }

    }else{
        ctx.save()
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.restore()
        ctx.save()
        var gameOverString = "GAME OVER"
        ctx.fillStyle="red"
        ctx.font = "100px serif"

        ctx.fillText(gameOverString , (canvas.width/2) - (ctx.measureText(gameOverString).width / 2), canvas.height/2)

        salveazaScor(jucator, scor.toString())
        deseneazaTopScoruri()

        var restart = "Press p to play again"
        ctx.fillStyle="white"
        ctx.font = "30px serif"
        ctx.fillText(restart , (canvas.width/2) - (ctx.measureText(restart).width / 2), 550)
        ctx.restore()
    }

    ctx.save()
    ctx.fillStyle = "black"
    ctx.fillRect(500, 0, 100, 30)
    ctx.restore()
    ctx.save()
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, 100, 30)
    ctx.restore()
    ctx.save()
    ctx.fillStyle="white"
    ctx.font = "20px serif"
    ctx.fillText("Scor: " + scor.toString(), 20, 25)
    ctx.restore()
    ctx.save()

    var vietiString = "Vieti: "
    ctx.fillStyle="white"
    ctx.font = "20px serif"
    ctx.fillText(vietiString + + numarVieti.toString(), 520, 25)
    ctx.restore()
}

// bucla principala
setInterval(cadruNou, 1000 / CADRE)