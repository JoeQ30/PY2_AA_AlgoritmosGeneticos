const CANTIDAD_INDIVIDUOS = 20;
const GENERACIONES = 200;
const PORCENTAJE_MUTACIONES = 0.7;
const PORCENTAJE_COMBINAR = 0.5;
const PORCENTAJE_INDIVIDUOS_GENERACION = 0.20;


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
  fitness(imagen){
  }
  mutar(){
    for (let triangulo of this.triangulos) {
      // Si se cumple la probabilidad de mutación, mutar el color del triángulo
      if (Math.random() < PORCENTAJE_MUTACIONES) {
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
    for(let i = 0; i < CANTIDAD_INDIVIDUOS; i++){
      let individuo = new Individuo();
    }

  }
  
  mutar(individuo){
    
  }
  
  combinar(individuo1, individuo2){
  
  }
  
  fitness(individuo){
  
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
 * Función que se encarga de cargar la imagen y realizar el proceso de triangulación
 */
function cargar(){
  let imgElement = document.getElementById("imageSrc")
  let inputElement = document.getElementById("fileInput");
  inputElement.addEventListener("change", (e) => {
   imgElement.src = URL.createObjectURL(e.target.files[0]);
  }, false);

  imgElement.onload = function() {
    // Obtener las dimensiones de la imagen
    console.log("Se ha cargado esto")

    let mat = cv.imread(imgElement);
    console.log(mat.ucharPtr(10,10)); // retorna el RGB de la imagen en la posicion 10,10
    let width = imgElement.naturalWidth;
    let height = imgElement.naturalHeight;
    
    // matriz del tamaño de la imagen
    let src = new cv.Mat.zeros(height, width, cv.CV_8UC3);

    // 3 vertices para el triangulo

    let contador = 0;

    while(contador < CANTIDAD_INDIVIDUOS){

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
  };
}
var Module = {
  // https://emscripten.org/docs/api_reference/module.html#Module.onRuntimeInitialized
  onRuntimeInitialized() {
    document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
  }

};

function genetico(){
  let generaciones = 0;
  while (generaciones < GENERACIONES){
    generaciones++;
    seleccion();
  }


}