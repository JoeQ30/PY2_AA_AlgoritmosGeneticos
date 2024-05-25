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

    console.log("Total: " + total);
    console.log("Max Generations: " + maxGenerationsValue);
    console.log("Individuals per Generation: " + indivXGenerationValue);
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
    document.getElementById('container').style.display = 'none';
    document.getElementById('container2').style.display = 'block';
    geneticoX();
    //document.getElementById('outputImgObj').style.display = 'block';
});


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

    let temp = src.clone();

    // rellena el triangulo de color
    cv.fillConvexPoly(temp, triangle, this.color);

    cv.addWeighted(src, 1.0 - this.alpha, temp, this.alpha, 0.0, src);
    triangle.delete();
    temp.delete();
  }

}

class Individuo {
  constructor(){
    this.CANTIDAD_TRIANGULOS = 4;
    this.triangulos = [];
    let fitness;
  }
  generarTriangulos(){
    let contador = 0;
    while(contador < this.CANTIDAD_TRIANGULOS){

      let p1 = generarPuntoAleatorio(width, height);
      let p2 = generarPuntoAleatorio(width, height);
      let p3 = generarPuntoAleatorio(width, height);

      // crea el triangulo
      let triangle = new cv.Mat(1, 3, cv.CV_32SC2);
      triangle.data32S.set([p1.x, p1.y, p2.x, p2.y, p3.x, p3.y]);
      
      let temp = src.clone();
      let color = randomColor();


      
      let alpha = 0.1 + Math.random() * 0.9; 
      this.triangulos.push(new Triangulo(p1, p2, p3, color, alpha));
      contador++;
    }

  }
  /**
   * Metodo que calcula el fitness de un individuo
   * @param {image} imagen original  
   */
  fitness(imagen){
    for(let i = 0; i < imagen.naturalWidth; i++){
      for(let j = 0; j < imagen.naturalHeight; j++){
        let pixel = imagen.ucharPtr(i, j);
        for(let triangulo of this.triangulos){
          let color = triangulo.color;
          let distancia = Math.sqrt(Math.pow(pixel[0] - color[0], 2) + Math.pow(pixel[1] - color[1], 2) + Math.pow(pixel[2] - color[2], 2));
          this.fitness += distancia;
        }
      }


    }
  }
  mutar(){
    for (let triangulo of this.triangulos) {
      // Si se cumple la probabilidad de mutación, mutar el color del triángulo
      if (Math.random() < percentMutate) {
        this.#mutarColor(triangulo); // Llamar al método privado para mutar el color
      }
    }
  }

  #mutarColor(triangulo) { // Método privado para mutar el color de un triángulo
    // Elegir un canal de color al azar
    let canal = Math.floor(Math.random() * 3);

    // Calcular una cantidad de cambio al azar entre -200 y 200
    let cambio = Math.floor(Math.random() * 201) - 100;

    // Aplicar el cambio al canal de color, asegurándose de que el nuevo valor esté entre 0 y 255
    triangulo.color[canal] = Math.min(Math.max(triangulo.color[canal] + cambio, 0), 255);
  }

  combinar(individuo){

  }



}

class Poblacion {

  constructor(){


  }

  seleccion(){
    for(let i = 0; i < indivXGenerationValue; i++){
      let individuo = new Individuo();
    }

  }
  
  
  combinar(individuo1, individuo2){
  
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
  return new cv.Scalar(r, g, b);
}

/**
 * 
 */

function geneticoX(){
      let imgElement = document.getElementById("imageSrc")
      //let inputElement = document.getElementById("fileInput");
      // Obtener las dimensiones de la imagen
      console.log("Se ha cargado esto")

      let mat = cv.imread(imgElement);
      console.log(mat.ucharPtr(10,10)); // retorna el RGB de la imagen en la posicion 10,10
      let width = imgElement.naturalWidth;
      let height = imgElement.naturalHeight;
      
      // matriz del tamaño de la imagen
      let src = new cv.Mat(height, width, cv.CV_8UC3);
      // Llena la matriz con el color blanco (255, 255, 255)
      src.setTo(new cv.Scalar(255, 255, 255));
  
      // 3 vertices para el triangulo
  
      let contador = 0;
      console.log (indivXGenerationValue);
  
      while(contador < indivXGenerationValue){
  
        let p1 = generarPuntoAleatorio(width, height);
        let p2 = generarPuntoAleatorio(width, height);
        let p3 = generarPuntoAleatorio(width, height);
  
        // crea el triangulo
        let triangle = new cv.Mat(1, 3, cv.CV_32SC2);
        triangle.data32S.set([p1.x, p1.y, p2.x, p2.y, p3.x, p3.y]);
        
        let temp = src.clone();
        let color = randomColor();
        console.log(color);
        console.log(color[0]);
  
        // rellena el triangulo de color blanco
        cv.fillConvexPoly(temp, triangle, color);
        contador++;
  
        
        let alpha = 0.1 + Math.random() * 0.9; 
        cv.addWeighted(src, 1.0 - alpha, temp, alpha, 0.0, src);
        triangle.delete();
        temp.delete();
      }
      // Mostrar la imagen
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

function genetico(){
  let generaciones = 0;
  while (generaciones < maxGenerationsValue){
    generaciones++;
    seleccion();
  }


}