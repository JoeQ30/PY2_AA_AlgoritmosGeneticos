//const CANTIDAD_INDIVIDUOS = 20;
//const GENERACIONES = 200;
//const PORCENTAJE_MUTACIONES = 0.7;
//const PORCENTAJE_COMBINAR = 0.5;
//const PORCENTAJE_INDIVIDUOS_GENERACION = 0.20;

var sliders = document.querySelectorAll(".slider");
var startButton = document.getElementById("startButton");
var outputs = document.querySelectorAll("span[id^='sliderValue']");
var inputs = document.querySelectorAll("#maxGenerations, #unitXGeneration");

//Estos valores se asignan al iniciar el programa
var maxGenerationsValue = 0
var indivXGenerationValue = 0

//Valores de los slidebars, estos son los datos por defecto 
var percentTop = 0   //variable que tendrá el porcentaje de individuos que se seleccionarán
var percentMutate = 0
var percentCombine = 0

var receiveImg = false

var width = 0;
var height = 0;

function updateBtnStatus() {
    maxGenerationsValue = parseInt(document.getElementById("maxGenerations").value);
    indivXGenerationValue = parseInt(document.getElementById("unitXGeneration").value);

    maxGenerationsValue = isNaN(maxGenerationsValue) ? 0 : maxGenerationsValue;
    indivXGenerationValue = isNaN(indivXGenerationValue) ? 0 : indivXGenerationValue;

    percentTop = parseInt(document.getElementById("sliderValue1").textContent);
    percentMutate = parseInt(document.getElementById("sliderValue2").textContent);
    percentCombine = parseInt(document.getElementById("sliderValue3").textContent);

    total = percentTop + percentMutate + percentCombine;

    startButton.disabled = total !== 100 || maxGenerationsValue === 0 || indivXGenerationValue === 0 || !receiveImg;
    //console.log(total);

    //console.log("Total: " + total);
    //console.log("Max Generations: " + maxGenerationsValue);
    //console.log("Individuals per Generation: " + indivXGenerationValue);
}

sliders.forEach(function(slider, index) {
    slider.addEventListener("input", function() {
        outputs[index].textContent = this.value; // Actualiza el valor mostrado
        updateBtnStatus();
    });
    outputs[index].textContent = slider.value; // Establece el valor inicial mostrado
});

// Agrega eventos input a cada uno de los inputs
inputs.forEach(function(input) {
    input.addEventListener("input", function() {
        updateBtnStatus(); // Llama a la función para actualizar el estado del botón
    });
});


document.getElementById('startButton').addEventListener('click', function() {
    changeScene('idScene2');
    setTimeout(initGeneticArt, 0);
});

function changeScene(sceneId) {
  // Ocultar todas las escenas
  let scenes = document.querySelectorAll('.scene');
  scenes.forEach(scene => {
    scene.className = 'scene'; // Resetear clase a 'scene'
  });

  // Mostrar la escena seleccionada
  let activeScene = document.getElementById(sceneId);
  if (activeScene) {
    activeScene.className = 'scene active'; // Cambiar clase a 'scene active'
  }
}


class Triangulo{
  constructor(p1, p2, p3, color, alpha) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.color = color;
    this.alpha = alpha;
  }
  dibujar(src) {
    let triangle = new cv.Mat(1, 3, cv.CV_32SC2);
    triangle.data32S.set([this.p1.x, this.p1.y, this.p2.x, this.p2.y, this.p3.x, this.p3.y]);

    // rellena el triangulo de color
    cv.fillConvexPoly(src, triangle, this.color);

    cv.addWeighted(src, 1.0 - this.alpha, src, this.alpha, 0.0, src);
    triangle.delete();
   // temp.delete();
  }

  clone() {
    return new Triangulo(this.p1, this.p2, this.p3, this.color, this.alpha);
  }

}

class Individuo {
  constructor(){
    this.CANTIDAD_TRIANGULOS = 4;
    this.triangulos = [];
    this.fitness = 1;
    this.imagenIndividuo = null;
  }

  generarTriangulos(width, height){
    let contador = 0;
    while(contador < this.CANTIDAD_TRIANGULOS){

      let p1 = generarPuntoAleatorio(width, height);
      let p2 = generarPuntoAleatorio(width, height);
      let p3 = generarPuntoAleatorio(width, height);
      let color = randomColor();
      let alpha = 0.1 + Math.random() * 0.9; 
      alpha = 1;
      this.triangulos.push(new Triangulo(p1, p2, p3, color, alpha));
      contador++;
    }
    console.log(this.triangulos);

  }
  /**
   * Metodo que calcula el fitness de un individuo
   * @param {image} imagen original  
   */
  calcThisfitness(imagen){
    for(let i = 0; i < height ; i++){
      for(let j = 0; j < width; j++){
        let pixelObjetivo = imagen.ucharPtr(i, j);
        let pixelIndividuo = this.imagenIndividuo.ucharPtr(i, j);

        let distancia = Math.sqrt(
          Math.pow(pixelObjetivo[0] - pixelIndividuo[0], 2) +
          Math.pow(pixelObjetivo[1] - pixelIndividuo[1], 2) +
          Math.pow(pixelObjetivo[2] - pixelIndividuo[2], 2)
      );

      this.fitness += distancia;
      }


    }
  }

  initiateImagenIndividuo(){
    let src = new cv.Mat(height, width, cv.CV_8UC4);
  // Llena la matriz con el color blanco (255, 255, 255)
    src.setTo(new cv.Scalar(255,255,255, 255));
    this.imagenIndividuo = src;
    this.dibujarIndividuo(this.imagenIndividuo);
    }
  dibujarIndividuo(src){
    for(let triangule of this.triangulos){
      triangule.dibujar(src);
    }
    console.log("hay estos triangulos: "+this.triangulos.length);
  }

  mutar(){
    let randNumMutate = Math.random();
    let randDesicion = Math.floor(randNumMutate * 10) + 1;
    // Probabilidad de 50% que se aplique una mutacion u otra
    if (randDesicion <= 5){
      console.log("Se muta el color...");
      this.#mutarColor();
    }else{
      console.log("Se muta el agregando o quitando...");
      this.#mutarAddOrRem();
    }
  }

  #mutarColor(){
    for (let triangulo of this.triangulos) {
      // Si se cumple la probabilidad de mutación, mutar el color del triángulo
      if (Math.random() < percentMutate) {
        this.#mutarColorAux(triangulo); // Llamar al método privado para mutar el color
      }
    }
  }

  #mutarColorAux(triangulo) { // Método privado para mutar el color de un triángulo
    // Elegir un canal de color al azar
    let canal = Math.floor(Math.random() * 3);

    // Calcular una cantidad de cambio al azar entre -200 y 200
    let cambio = Math.floor(Math.random() * 21) - 10;

    // Aplicar el cambio al canal de color, asegurándose de que el nuevo valor esté entre 0 y 255
    triangulo.color[canal] = Math.min(Math.max(triangulo.color[canal] + cambio, 0), 255);
  }

  #mutarAddOrRem(){
    let randNum = Math.round(Math.random());
    console.log("Número aleatorio (mutar3): "+randNum);
    if (randNum === 0){
      console.log("Se quitará un triangulo de forma aleatoria");
      let indice = Math.floor(Math.random() * this.triangulos.length);
      this.triangulos.splice(indice, 1);
    }else {
      console.log("Se agregará un triángulo de forma aleeatoria");
      let p1 = generarPuntoAleatorio(width, height);
      let p2 = generarPuntoAleatorio(width, height);
      let p3 = generarPuntoAleatorio(width, height);
      let color = randomColor();
      let alpha = 0.1 + Math.random() * 0.9;
      this.triangulos.push(new Triangulo(p1, p2, p3, color, alpha));
    }
  }

  //Metodo que crea una copia de esta instancia cuyos cambios en la copia no afectan al original
  clone() {
    const newIndividuo = new Individuo(this.imagenIndividuo);
    newIndividuo.triangulos = this.triangulos.map(triangulo => triangulo.clone());
    newIndividuo.fitness = this.fitness;
    return newIndividuo;
  }
}

class Poblacion {

  constructor(cantidad_individuos, imagenObjetivo){
    this.cantidad_individuos = cantidad_individuos;
    this.individuos = [];
    this.imagenObjetivo = imagenObjetivo;

  }


  calcularFitness(imagenObjetivo){
    for(let individuo of this.individuos){
      individuo.initiateImagenIndividuo();
      individuo.calcThisfitness(imagenObjetivo);
    }
    this.individuos.sort((a, b) => a.fitness - b.fitness);
  }

  
  
  combinar(individuo1, individuo2){
    let puntoCruce = Math.floor(Math.random() * individuo1.triangulos.length);

    // Crea los nuevos arreglos de triángulos
    let triangulos1 = individuo1.triangulos.slice(0, puntoCruce).concat(individuo2.triangulos.slice(puntoCruce));
    let triangulos2 = individuo2.triangulos.slice(0, puntoCruce).concat(individuo1.triangulos.slice(puntoCruce));

    // Crea los nuevos individuos
    let nuevoIndividuo1 = new Individuo();
    nuevoIndividuo1.triangulos = triangulos1;
    nuevoIndividuo1.initiateImagenIndividuo();
    nuevoIndividuo1.calcThisfitness(this.imagenObjetivo);

    let nuevoIndividuo2 = new Individuo();
    nuevoIndividuo2.triangulos = triangulos2;
    nuevoIndividuo2.initiateImagenIndividuo();
    nuevoIndividuo2.calcThisfitness(this.imagenObjetivo);
    if (nuevoIndividuo1.fitness < nuevoIndividuo2.fitness) {
      return nuevoIndividuo1;
  } else {
      return nuevoIndividuo2;
  }



  }

}


/**
 * Funcion que genera un punto de forma aleatorio en la imagen correspondiente al ancho y alto de la imagen
 * 
 * @param {imageWidth} maxX 
 * @param {imageHeight} maxY 
 * @returns Punto aleatorio
 */
function generarPuntoAleatorio(maxX, maxY){

  let x = Math.floor(Math.random() * maxX);
  let y = Math.floor(Math.random() * maxY);
  return new cv.Point(x, y);

}

/**
 * Funcion que genera un color aleatorio de OpenCV
 * @returns Color aleatorio
 */
function randomColor() {
  let r = Math.floor(Math.random() * 256);
  let g = Math.floor(Math.random() * 256);
  let b = Math.floor(Math.random() * 256);
  return new cv.Scalar(r, g, b, 255);
}

/**
 * Funcion que inicializa la poblacion de individuos de manera aleatoria
 * @param {image} imagenObjetivo
 * @returns Poblacion de individuos
 */
function initPoblacion(imagenObjetivo){
  let contador = 0;
  let poblacion = new Poblacion(indivXGenerationValue, imagenObjetivo);
  console.log("---> 3...");
  while (contador < indivXGenerationValue){
    let individuo = new Individuo();
    individuo.generarTriangulos(width, height);
    individuo.initiateImagenIndividuo();
    
    poblacion.individuos.push(individuo);
    
    contador++; 
  }
  poblacion.calcularFitness(imagenObjetivo);
  return poblacion;
}

/**
 * Funcion para iniciar el algoritmo Genetico
 */

function initGeneticArt(){
  console.log("Se inicia el algoritmo genetico...");
  let contador1 = 0;
  let imgElement = document.getElementById("imageSrc");
  let mat = cv.imread(imgElement);
  console.log(mat.ucharPtr(12,3));
  width = imgElement.naturalWidth;
  height = imgElement.naturalHeight;
  
  // let inputElement = document.getElementById("fileInput");
  // Obtener las dimensiones de la imagen
  
  // matriz del tamaño de la imagen
  let src = new cv.Mat(height, width, cv.CV_8UC4);
  // Llena la matriz con el color blanco (255, 255, 255)
  src.setTo(new cv.Scalar(255,255,255, 255));
  cv.imshow('canvasOutput', src);
  console.log("color: " + src.ucharPtr(12,3));
  // La primera población será completamente aleatoria, es un punto de inicio
  let poblacionPadre = initPoblacion(mat);

  //poblacionPadre.individuos[0].dibujarIndividuo(src);

  while (contador1 < maxGenerationsValue){
    console.log("Generación número: " + contador1);
    let thisPoblacion = new Poblacion(indivXGenerationValue, mat);
    let mejoresIndividuos = [];
    //let nuevaListaIndividuos = [];
  
    // parte seleccionar
   
    let porcentajeSeleccionados = percentTop*0.01;
    let cantidadSeleccionados = Math.round(porcentajeSeleccionados * indivXGenerationValue);
    mejoresIndividuos = poblacionPadre.individuos.splice(0, cantidadSeleccionados);
    for (let i = 0; i < mejoresIndividuos.length; i++) {
      thisPoblacion.individuos.push(mejoresIndividuos[i].clone());
    }
    console.log ("cantidad de individuos seleccionados: "+ cantidadSeleccionados);

    // parte combinar
 
    let porcentajeCombinar = percentCombine*0.01;
    let cantidadCombinar = Math.round(porcentajeCombinar * indivXGenerationValue);

    let countCombinaciones = 0;

    while(countCombinaciones <= cantidadCombinar){
      let indice1 = Math.floor(Math.random() * cantidadSeleccionados);
      let indice2 = Math.floor(Math.random() * cantidadSeleccionados);
      let individuo1 = mejoresIndividuos[indice1].clone(); 
      let individuo2 = mejoresIndividuos[indice2].clone(); 
      let nuevoIndividuo = thisPoblacion.combinar(individuo1, individuo2);
      thisPoblacion.individuos.push(nuevoIndividuo);
      countCombinaciones++;
    }

    console.log ("cantidad de individuos combinados: "+ cantidadCombinar);

    // parte mutar
  
    let porcentajeMutar = percentMutate*0.01;
    let cantidadMutar = Math.round(porcentajeMutar * indivXGenerationValue);
    

    let countMutaciones = 0;
    
    while(countMutaciones <= cantidadMutar){
      let indice = Math.floor(Math.random() * cantidadSeleccionados);
      let individuo = mejoresIndividuos[indice].clone();
      individuo.mutar();
     
      thisPoblacion.individuos.push(individuo);
      countMutaciones++;
    }

    console.log ("cantidad de individuos mutados: "+ cantidadMutar);
  
    //poblacion.individuos = nuevaListaIndividuos;
    thisPoblacion.calcularFitness(mat);
    
    // calcular fitness
    // ordenamos la nuevaListaIndividuos

    // parte nueva generacion

    //repetir xd
    //let mejorIndividuo = thisPoblacion.individuos[0];
   // mejorIndividuo.dibujarIndividuo(src);
    
    poblacionPadre = thisPoblacion;

    contador1++;
  }
  console.log("hay estos individuos en poblacionPadre: "+poblacionPadre.individuos.length);
  let auxiliar = 0;
  for (individuo of poblacionPadre.individuos){ {

    individuo.dibujarIndividuo(src);
    console.log(individuo);
    console.log("Dibujando individuo...  " + auxiliar);
    auxiliar++;
  }}
  cv.imshow('canvasOutput', src);
}




/**
 * Función que se encarga de cargar la imagen y realizar el proceso de triangulación
 */
function cargar(){
  let imgElement = document.getElementById("imageSrc")
  let inputElement = document.getElementById("fileInput");
  inputElement.addEventListener("change", (e) => {
   imgElement.src = URL.createObjectURL(e.target.files[0]);
  }, false);

  imgElement.onload = function() {

    receiveImg = true;
    updateBtnStatus();

  }
};

var Module = {
  // https://emscripten.org/docs/api_reference/module.html#Module.onRuntimeInitialized
  onRuntimeInitialized() {
    document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
  }

};
