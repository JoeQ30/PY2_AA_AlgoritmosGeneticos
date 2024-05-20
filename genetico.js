const CANTIDAD_INDIVIDUOS = 20;
const GENERACIONES = 200;
const PORCENTAJE_MUTACIONES = 0.7;
const PORCENTAJE_COMBINAR = 0.5;
const PORCENTAJE_INDIVIDUOS_GENERACION = 0.20;


/**
 * Función que se encarga de generar la población inicial
 */
function seleccion(){


}

function mutar(individuo){

}

function combinar(individuo1, individuo2){

}

function fitness(individuo){

}

/**
 *  Funcion que genera un punto de forma aleatorio entre 
 * @returns Punto aleatorio
 */
function generarPuntoAleatorio(maxX, maxY){

  let x = Math.floor(Math.random() * maxX);
  let y = Math.floor(Math.random() * maxY);
  return new cv.Point(x, y);

}

function randomColor() {
  let r = Math.floor(Math.random() * 256);
  let g = Math.floor(Math.random() * 256);
  let b = Math.floor(Math.random() * 256);
  return new cv.Scalar(r, g, b, 255);
}

/**
 * Función que se encarga de cargar los triangulos
 */
function cargar(){
  let imgElement = document.getElementById("imageSrc")
  let inputElement = document.getElementById("fileInput");
  inputElement.addEventListener("change", (e) => {
   imgElement.src = URL.createObjectURL(e.target.files[0]);
  }, false);

  imgElement.onload = function() {
    // Obtener las dimensiones de la imagen
    let width = imgElement.naturalWidth;
    let height = imgElement.naturalHeight;
    
    // matriz de 255x255 de fondo negro
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

      let color = randomColor();

      // rellena el triangulo de color blanco
      cv.fillConvexPoly(src, triangle, color);
      contador++;
      triangle.delete();
    }

    // Mostrar la imagen
    cv.imshow('canvasOutput', src);


  };
  var Module = {
    // https://emscripten.org/docs/api_reference/module.html#Module.onRuntimeInitialized
    onRuntimeInitialized() {
      document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
    }


  }
}
/*
function onOpenCvReady(){
    let mat = cv.imread(imgElement);
    console.log(mat.ucharPtr(100,100))

    let p1  = new cv.Point(0, 0);
    let p2  = new cv.Point(20, 20);
    let p3  = new cv.Point(10, 0);
    let p4 = new cv.Point(65, 65);
    let p5 = new cv.Point(200, 200);


    let indiv = new cv.Mat.zeros(255, 255, cv.CV_8U);
    cv.line(indiv, p1, p2, [255, 255, 255, 255], 1)
    cv.line(indiv, p2, p3, [255, 255, 255, 255], 1)
    cv.line(indiv, p3, p4, [255, 0, 0, 255], 2)
    cv.line(indiv, p4, p5, [255, 255, 0, 255], 3)
    
    

    // Mostrar la imagen
    cv.imshow('canvasOutput', indiv);
  };
  */