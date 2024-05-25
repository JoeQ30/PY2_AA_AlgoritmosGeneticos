var sliders = document.querySelectorAll(".slider");
var startButton = document.getElementById("startButton");
var outputs = document.querySelectorAll("span[id^='sliderValue']");
var inputs = document.querySelectorAll("#maxGenerations, #unitXGeneration");

//Estos valores se asignan al iniciar el programa
var maxGenerationsValue = 0
var unitXGenerationValue = 0

//Valores de los slidebars, estos son los datos por defecto 
var sliderValue1 = 0  
var sliderValue2 = 0
var sliderValue3 = 0

function updateBtnStatus() {
    maxGenerationsValue = parseInt(document.getElementById("maxGenerations").value);
    unitXGenerationValue = parseInt(document.getElementById("unitXGeneration").value);

    maxGenerationsValue = isNaN(maxGenerationsValue) ? 0 : maxGenerationsValue;
    unitXGenerationValue = isNaN(unitXGenerationValue) ? 0 : unitXGenerationValue;

    sliderValue1 = parseInt(document.getElementById("sliderValue1").textContent);
    sliderValue2 = parseInt(document.getElementById("sliderValue2").textContent);
    sliderValue3 = parseInt(document.getElementById("sliderValue3").textContent);

    total = sliderValue1 + sliderValue2 + sliderValue3;

    startButton.disabled = total !== 100 || maxGenerationsValue === 0 || unitXGenerationValue === 0;
    //console.log(total);
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
    document.getElementById('inputoutput').style.display = 'block';
    document.getElementById('outputImgObj').style.display = 'block';
});

