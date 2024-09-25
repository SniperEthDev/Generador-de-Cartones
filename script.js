const NUM_CARTONES = 200; // Número total de cartones únicos a generar
const CARTONES_GENERADOS = new Set(); // Usamos un Set para almacenar cartones únicos
let contadorGlobal = 1; // Inicializamos el contador global fuera de cualquier función

function generarCartones() {
    const contenedor = document.getElementById('bingo-container');
    contenedor.innerHTML = ''; // Limpiar contenedor

    let cartonesPorGenerar = 10; // Cantidad de cartones que se generarán por página

    while (cartonesPorGenerar > 0 && CARTONES_GENERADOS.size < NUM_CARTONES) {
        const carton = generarCarton();
        const cartonJSON = JSON.stringify(carton); // Convertir el cartón a un string para almacenarlo

        if (!CARTONES_GENERADOS.has(cartonJSON)) {
            CARTONES_GENERADOS.add(cartonJSON);
            mostrarCarton(carton, contenedor, contadorGlobal);

            // Incrementar el contador global para el próximo
            contadorGlobal++;

            // Decrementar el contador de cartones por generar
            cartonesPorGenerar--;
        }
    }
}

function generarCarton() {
    const carton = {
        B: generarNumeros(1, 15),
        I: generarNumeros(16, 30),
        N: generarNumeros(31, 45, true), // Pasar true para columna N
        G: generarNumeros(46, 60),
        O: generarNumeros(61, 75)
    };

    // Insertar el "Free" espacio en el centro de la columna N
    carton.N.splice(2, 0, 'FREE');
    return carton;
}

function mostrarCarton(carton, contenedor, numeroCarton) {
    const divCarton = document.createElement('div');
    divCarton.classList.add('bingo-card');

    for (const letra in carton) {
        const columna = document.createElement('div');
        columna.classList.add('bingo-header');
        columna.textContent = letra;
        divCarton.appendChild(columna);
    }

    for (let fila = 0; fila < 5; fila++) {
        for (const letra in carton) {
            const celda = document.createElement('div');
            celda.textContent = carton[letra][fila] !== undefined ? carton[letra][fila] : '';
            if (carton[letra][fila] === 'FREE') {
                celda.classList.add('free');
            }
            divCarton.appendChild(celda);
        }
    }

    // Crear un contenedor para el nombre del bingo y el número del cartón
    const footer = document.createElement('div');
    footer.classList.add('bingo-footer');

    const nombreBingo = document.createElement('div');
    nombreBingo.classList.add('bingo-name');
    nombreBingo.textContent = "BINGO ONLINE MI GORDA"; // Puedes personalizar este nombre

    const serialCarton = document.createElement('div');
    serialCarton.classList.add('serial');
    serialCarton.textContent = `Cartón #${numeroCarton}`; // Número del cartón único

    // Añadir el nombre y el número al pie del cartón
    footer.appendChild(nombreBingo);
    footer.appendChild(serialCarton);
    divCarton.appendChild(footer);

    contenedor.appendChild(divCarton);
}

function generarNumeros(min, max, esColumnaN = false) {
    const numeros = [];
    const cantidad = esColumnaN ? 4 : 5; // 4 números para la columna N, 5 para otras columnas

    while (numeros.length < cantidad) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!numeros.includes(num)) {
            numeros.push(num);
        }
    }
    return numeros;
}

function generarZip() {
    const zip = new JSZip();
    const contenedor = document.getElementById('bingo-container');

    const cartones = contenedor.querySelectorAll('.bingo-card');
    let contadorLocal = contadorGlobal - cartones.length; // Comenzar el conteo local desde el último número generado

    const promises = Array.from(cartones).map(carton => {
        const nombreArchivo = `carton_${contadorLocal}.png`;
        contadorLocal++; // Incrementar el contador local

        // Aumentamos la escala a 3 para mejorar la calidad de las imágenes generadas
        return html2canvas(carton, { scale: 3 }).then(canvas => {
            return new Promise((resolve) => {
                canvas.toBlob(blob => {
                    zip.file(nombreArchivo, blob);
                    resolve();
                });
            });
        });
    });

    Promise.all(promises).then(() => {
        zip.generateAsync({ type: 'blob' }).then(content => {
            saveAs(content, 'cartones_bingo.zip');
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    generarCartones();
});
