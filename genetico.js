var sliders = document.querySelectorAll(".slider");
var startButton = document.getElementById("startButton");
var outputs = document.querySelectorAll("span[id^='sliderValue']");
var inputs = document.querySelectorAll("#maxGenerations, #unitXGeneration");

//Estos valores se asignan al iniciar el programa
var maxGenerationsValue = 0
var indivXGenerationValue = 0

//Valores de los slidebars, estos son los datos por defecto 
var percentTop = 0   //variable que tendrá el porcentaje de individuos que se seleccionarán
var percentMutate = 0 //variable que tendrá el porcentaje de individuos que se mutarán
var percentCombine = 0  //variable que tendrá el porcentaje de individuos que se combinarán

var receiveImg = false  //Flag para validar que se haya recibido una imagen

//Variables globales que manejan las dimensiones de las imagenes
var width = 0;
var height = 0;

var asignId = 0;  //Variable que maneja los ids de los Individuos

//Inicialización del OpenCV
var Module = {
  // https://emscripten.org/docs/api_reference/module.html#Module.onRuntimeInitialized
  onRuntimeInitialized() {
    document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
  }

};


/**
 * Función que actualiza el estado del botón de inicio
 * Validación para proceder con el algoritmo genetico
 */
function updateBtnStatus() {
    maxGenerationsValue = parseInt(document.getElementById("maxGenerations").value);
    indivXGenerationValue = parseInt(document.getElementById("unitXGeneration").value);

    maxGenerationsValue = isNaN(maxGenerationsValue) ? 0 : maxGenerationsValue;
    indivXGenerationValue = isNaN(indivXGenerationValue) ? 0 : indivXGenerationValue;

    percentTop = parseInt(document.getElementById("sliderValue1").textContent);
    percentMutate = parseInt(document.getElementById("sliderValue2").textContent);
    percentCombine = parseInt(document.getElementById("sliderValue3").textContent);

    total = percentTop + percentMutate + percentCombine;

    // Validaciones del botón de inicio, generaciones, individuos por generación 
    // y que se haya recibido una imagen
    startButton.disabled = total !== 100 || maxGenerationsValue === 0 || 
    indivXGenerationValue === 0 || !receiveImg;

}

//------------------ Event Listeners ----------------------
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
    initDataChart();
    changeScene('idScene2');
    setTimeout(initGeneticArt, 0);
    document.getElementById("divTiempos").style.display = "block";
});
//------------------ Event Listeners ----------------------

/**
 * Función que actualiza la pantalla por dibujo
 */
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

  document.getElementById("divTiempos").style.display = "none";
}

/**
 * Clase que representa un triángulo
 */
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
    triangle.data32S.set([this.p1.x, 
                          this.p1.y, 
                          this.p2.x, 
                          this.p2.y, 
                          this.p3.x, 
                          this.p3.y]);

    // rellena el triangulo de color
    cv.fillConvexPoly(src, triangle, this.color);

    cv.addWeighted(src, 1.0 - this.alpha, src, this.alpha, 0.0, src);
    triangle.delete();
  }

  clone() {
    return new Triangulo(this.p1, 
                        this.p2, 
                        this.p3, 
                        this.color, 
                        this.alpha);
  }

}
/**
 * Clase que representa un individuo que contiene una cantidad de triangulos
 */
class Individuo {
  constructor(){
    this.CANTIDAD_TRIANGULOS = 25;
    this.triangulos = [];
    this.fitness = 1;
    this.imagenIndividuo = null;
    this.id = asignId;
    asignId++;
  }
  /**
   * Metodo que genera triangulos de forma aleatoria
   */
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
    this.fitness = 0;
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
    if(this.imagenIndividuo != null){
      this.imagenIndividuo.delete();
    }
    this.imagenIndividuo = src;
    this.dibujarIndividuo(this.imagenIndividuo);
      }
  dibujarIndividuo(src){
    for(let triangule of this.triangulos){
      triangule.dibujar(src);
    }
  }

  mutar(){
    let randNumMutate = Math.random();
    let randDesicion = Math.floor(randNumMutate * 10) + 1;
    
    // Probabilidad de 50% que se aplique una mutacion u otra
    if (randDesicion <= 5){
      this.#mutarColor();
    }else{
      this.#mutarAddOrRem();
    }
  }

  #mutarColor(){
    console.log("Se muta el color de las figuras...");
    for (let triangulo of this.triangulos) {
      let randNumMutate = Math.random();
      let randNumDecision = Math.floor(randNumMutate * 100) + 1;
      // Si se cumple la probabilidad de mutación, mutar el color del triángulo
      if (randNumDecision < percentMutate) {
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
    let cantTriangulosMutar = Math.floor(Math.random() * this.CANTIDAD_TRIANGULOS) - 1;
    if (cantTriangulosMutar < 0){
      cantTriangulosMutar = 1;
    }
    for (let i = 0; i < cantTriangulosMutar; i++){
      let randNum = Math.round(Math.random());
      if (randNum === 0){
        let indice = Math.floor(Math.random() * this.triangulos.length);
        this.triangulos.splice(indice, 1);
        console.log("Se quita una figura...");
      }else {
        let p1 = generarPuntoAleatorio(width, height);
        let p2 = generarPuntoAleatorio(width, height);
        let p3 = generarPuntoAleatorio(width, height);
        let color = randomColor();
        let alpha = 0.1 + Math.random() * 0.9;
        this.triangulos.push(new Triangulo(p1, p2, p3, color, alpha));
        console.log("Se agrega una figura...");
      }
    }
  }

  imprimirIndividuo(){
    console.log("{Individuo: " + this.id + ", Fitness: " + this.fitness + "}");
  }

  //Metodo que crea una copia de esta instancia cuyos cambios en la copia no afectan al original
  clone() {
    const newIndividuo = new Individuo(this.imagenIndividuo);
    newIndividuo.triangulos = this.triangulos.map(triangulo => triangulo.clone());
    newIndividuo.fitness = this.fitness;
    newIndividuo.initiateImagenIndividuo();
    this.id = asignId;
    asignId++;
    return newIndividuo;
  }
}

/**
 * Clase que representa una población de individuos
 */
class Poblacion {

  constructor(cantidad_individuos, imagenObjetivo){
    this.cantidad_individuos = cantidad_individuos;
    this.individuos = [];
    this.imagenObjetivo = imagenObjetivo;

  }


  calcularFitness(){
    console.log("Calculando fitness de la población...");
    for(let individuo of this.individuos){
      individuo.initiateImagenIndividuo();
      individuo.calcThisfitness(this.imagenObjetivo);
    }
    this.individuos.sort((a, b) => a.fitness - b.fitness);
  }

  
  
  combinar(individuo1, individuo2){
    let puntoCruce = Math.floor(Math.random() * individuo1.triangulos.length);
    
    // Crea los nuevos arreglos de triángulos
    let triangulosOriginales1 = individuo1.triangulos.slice(0, puntoCruce).
    concat(individuo2.triangulos.slice(puntoCruce));
    
    let triangulosOriginales2 = individuo2.triangulos.slice(0, puntoCruce).
    concat(individuo1.triangulos.slice(puntoCruce));

    // Clona los arreglos de triángulos
    let triangulos1 = triangulosOriginales1.map(triangulo => triangulo.clone());
    let triangulos2 = triangulosOriginales2.map(triangulo => triangulo.clone());

    // Crea los nuevos individuos
    let nuevoIndividuo1 = new Individuo();
    nuevoIndividuo1.triangulos = triangulos1;
    nuevoIndividuo1.initiateImagenIndividuo();
    nuevoIndividuo1.calcThisfitness(this.imagenObjetivo);

    let nuevoIndividuo2 = new Individuo();
    nuevoIndividuo2.triangulos = triangulos2;
    nuevoIndividuo2.initiateImagenIndividuo();
    nuevoIndividuo2.calcThisfitness(this.imagenObjetivo);
    if (nuevoIndividuo1 > nuevoIndividuo2){
      return nuevoIndividuo1;
    } else {
      return nuevoIndividuo2;
    }
  }

  imprimirPoblacion(){
    for(let individuo of this.individuos){
      individuo.imprimirIndividuo();
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
  console.log("Inicializando primera población de forma aleatoria...");
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
 * Funcion que revisa si un arreglo contiene otro arreglo
 * @param {array} arr primero arreglo
 * @param {array} subArr segundo arreglo
 */
function arrayContainsArray(arr, subArr) {
  return arr.some(a => a.length === 
    subArr.length && a.every((v, i) => v === 
    subArr[i]));
}


/**
 * Funcion que recibe un fitness y una población y revisa si ya hay algun individuo con este fitness
 * retorna false si hay un fitness igual true si no hay ninguno igual
 */
function fitnessRepetido(fitness, poblacion) {
  return !poblacion.individuos.some(individuo => Math.abs(individuo.fitness - fitness) < 1e-6);
}




/**
 * Funcion que inicia el algoritmo genético
 */
function initGeneticArt() {
  const inicio = performance.now();

  console.log("Se inicia el algoritmo genético...");
  
  let lblBestFitness = document.getElementById("ValueFitness");
  
  let contador = 0;
  let listaTiempos = [];
  let listaFitnessMejores = [];
  let sumaFitnessPromedio;

  let imgElement = document.getElementById("imageSrc");
  let mat = cv.imread(imgElement);
  
  width = imgElement.naturalWidth;
  height = imgElement.naturalHeight;

  // Crear matriz del tamaño de la imagen
  let src = new cv.Mat(height, width, cv.CV_8UC4);
  src.setTo(new cv.Scalar(255, 255, 255, 255));
  
  console.log("Generación número: " + (contador));
  
  // Inicializar población padre
  let poblacionPadre = initPoblacion(mat);
  poblacionPadre.calcularFitness(mat);
  let mejorIndividuo = poblacionPadre.individuos[0];
  
  src.setTo(new cv.Scalar(255, 255, 255, 255));
  mejorIndividuo.dibujarIndividuo(src);
  cv.imshow('canvasOutput', src);

  lblBestFitness.textContent = mejorIndividuo.fitness;
  
  sumaFitnessPromedio = poblacionPadre.individuos.reduce((acc, individuo) => acc 
  + individuo.fitness, 0) / poblacionPadre.individuos.length;
  
  addDataToChart(contador, sumaFitnessPromedio, mejorIndividuo.fitness);

  /**
   * Funcion interna que se encarga de iterar sobre las generaciones
   */
  function iterar() {
    console.log("Generación número: " + (contador+1));
    
    const tiempoInicial = performance.now();
    if (contador >= maxGenerationsValue) {
      const fin = performance.now(); // Tiempo final
      document.getElementById("timerTotal").innerHTML = formatTime(fin - inicio);
      const promedioTiempos = listaTiempos.reduce((total, numero) => 
      total + numero, 0) / listaTiempos.length;
      document.getElementById("timerPromedio").innerHTML = formatTime(promedioTiempos);

      return;
    }
    
    let thisPoblacion = new Poblacion(indivXGenerationValue, mat);
    let mejoresIndividuos = [];

    // Parte seleccionar
    let porcentajeSeleccionados = percentTop * 0.01;
    let cantidadSeleccionados = Math.round(porcentajeSeleccionados * indivXGenerationValue);
    
    //Clonamos los mejores individuos de poblacion padre a mejoresIndividuos
    //Para trabajar con ellos las mutaciones y las combinaciones
    for (let i = 0; i < cantidadSeleccionados; i++) {
      mejoresIndividuos.push(poblacionPadre.individuos[i].clone());
    }

    //Clonamos los mejoresIndividuos a la población actual
    for (let i = 0; i < mejoresIndividuos.length; i++) {
      thisPoblacion.individuos.push(mejoresIndividuos[i].clone());
    }

    console.log("cantidad de individuos seleccionados: " + cantidadSeleccionados);

    // Parte combinar
    let porcentajeCombinar = percentCombine * 0.01;
    let cantidadCombinar = Math.round(porcentajeCombinar * indivXGenerationValue);
    let countCombinaciones = 0;
    
    //Se llevan a cabo las combinaciones solicitadas
    while (countCombinaciones < cantidadCombinar) {
      let indice1 = Math.floor(Math.random() * cantidadSeleccionados);
      let indice2 = Math.floor(Math.random() * cantidadSeleccionados);
      //Valida que no se combine un mismo individuo consigo mismo
      if (indice1 !== indice2){
        let individuo1 = mejoresIndividuos[indice1].clone();
        let individuo2 = mejoresIndividuos[indice2].clone();
        let nuevoIndividuo = thisPoblacion.combinar(individuo1, individuo2);
        thisPoblacion.individuos.push(nuevoIndividuo);
        console.log("La combinación se llevó a cabo con exito...")
        countCombinaciones++;
      }
    }
    console.log("cantidad de individuos combinados: " + cantidadCombinar);

    // Parte mutar
    let porcentajeMutar = percentMutate * 0.01;
    let cantidadMutar = Math.round(porcentajeMutar * indivXGenerationValue);
    let countMutaciones = 0;

    // Se llevan a cabo las mutaciones solicitadas
    while (countMutaciones < cantidadMutar) {
      let indice = Math.floor(Math.random() * cantidadSeleccionados);
      let individuo = mejoresIndividuos[indice].clone();
      individuo.mutar();
      individuo.calcThisfitness(mat);
      let validaFitness = fitnessRepetido(individuo.fitness, thisPoblacion);
      if (validaFitness){
        thisPoblacion.individuos.push(individuo);
        countMutaciones++;
      }
    }
    console.log("cantidad de individuos mutados: " + cantidadMutar);

    // Calcular fitness
    thisPoblacion.calcularFitness();

    // Dibujar el mejor individuo de esta generación
    let mejorIndividuo = thisPoblacion.individuos[0];
    src.setTo(new cv.Scalar(255, 255, 255, 255));
    mejorIndividuo.dibujarIndividuo(src);
    cv.imshow('canvasOutput', src);

    //Mostramos el fitness del mejor individuo de esta generación
    lblBestFitness.textContent = mejorIndividuo.fitness;

    listaFitnessMejores.push(mejorIndividuo.fitness);
    sumaFitnessPromedio = thisPoblacion.individuos.reduce((acc, individuo) => acc 
    + individuo.fitness, 0) / thisPoblacion.individuos.length;

    
    // Asignar nueva población
    poblacionPadre = thisPoblacion;

    // Incrementar el contador y programar la siguiente iteración
    contador++;
    // Usar setTimeout para ceder el control al navegador y se actualice el DOM
    addDataToChart(contador, sumaFitnessPromedio, mejorIndividuo.fitness);

    const tiempoFinal = performance.now();
    listaTiempos.push(tiempoFinal - tiempoInicial);// Iniciar las iteraciones

    setTimeout(iterar,0);
  }
  
  setTimeout(iterar,0);
  
  
}




/**
 * Función que se encarga de cargar la imagen y de mostrarla en el canvas
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

let chart;
/**
 * Función que inicializa el gráfico de datos
 */
function initDataChart() {
  const ctx = document.getElementById('myChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [], // Etiquetas iniciales vacías
      datasets: [{
        label: 'Fitness promedio por generacion',
        data: [], // Datos iniciales vacíos
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },{
        label: 'Mejor Fitness por generacion',
        data: [], // Datos iniciales vacíos
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 6, 10, 1)',
        borderWidth: 1


      }]
    },
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Generaciones'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Fitness'
                }
            }
        }
    }
  });
}

/**
 * Función que agrega datos al gráfico
 * @param {string} label Etiqueta de las generaciones
 * @param {number} avgData Fitness promedio de la generacion
 * @param {number} bestData Mejor fitness de la generacion
 */
function addDataToChart(label, avgData, bestData ) {
  setTimeout(() => {
    chart.data.labels.push(label); // Agrega la nueva etiqueta

  if (chart.data.datasets[0]) {
    chart.data.datasets[0].data.push(avgData); // Agrega el nuevo dato promedio
  } else {
    console.error('No hay Datos para el promedio de fitness');
  }

  if (chart.data.datasets[1]) {
    chart.data.datasets[1].data.push(bestData); // Agrega el nuevo dato del mejor caso
  } else {
    console.error('No hay Datos para el mejor fitness');
  }
  chart.update(); // Actualiza el gráfico
  }, 0);
}

/**
 * Función que convierte milisegundos a formato de tiempo HH:mm:ss
 * @param {number} milliseconds Milisegundos a convertir
 * @returns {string} Tiempo en formato HH:mm:ss
 */
function formatTime(milliseconds) {
  let seconds = Math.floor(milliseconds / 1000);
  let hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  let minutes = Math.floor(seconds / 60);
  seconds %= 60;

  // Asegura que los valores sean de dos dígitos
  const pad = num => num.toString().padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
