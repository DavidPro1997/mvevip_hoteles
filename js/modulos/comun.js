function abrirSpinner(mensaje){
    $("#mensajeSpinner").html(mensaje)
    $("#centermodal").modal({
        backdrop: 'static',
        keyboard: false
    }).modal('show')
}


function cerrarSpinner(){
    $("#centermodal").modal('hide');
}


function mensajeUsuario(icono,titulo,mensaje){
    setTimeout(function() {
        cerrarSpinner()    
    }, 1000);
    Swal.fire({
        title: titulo,
        text: mensaje,
        icon: icono,
        confirmButtonText: 'Entendido'
    });
}


function scrollTop() {
    window.scrollTo(0, 0);
}

function transformArrayToObject(array) {
    let result = {};
    array.forEach(item => {
        const key = item[0];         // Nombre (tipo, clase, etc.)
        const value = item[1];       // Dejar el valor como string
        result[key] = value;         // Asignar al objeto
    });
    return result;
}


function validarRango(input) {
    const min = parseInt(input.min);
    const max = parseInt(input.max);
    let value = input.value;

    // Si el valor es vacío, asignar el mínimo
    if (value === "") {
        input.value = min;
        return;
    }

    // Convertir el valor a número y eliminar ceros a la izquierda
    value = parseInt(value, 10); // Esto elimina los ceros a la izquierda

    // Si el valor es menor que el mínimo, asignar el mínimo
    if (value < min) {
        input.value = min;
    } 
    // Si el valor es mayor que el máximo, asignar el máximo
    else if (value > max) {
        input.value = max;
    } 
    // Asignar el valor ajustado sin ceros a la izquierda
    else {
        input.value = value;
    }
}


function guardarCache(datos, nombre) {
    const request = indexedDB.open("miBaseDeDatos", 1);

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("cache")) {
            // Crear el objectStore sin keyPath (clave primaria)
            db.createObjectStore("cache");
        }
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction("cache", "readwrite");
        const objectStore = transaction.objectStore("cache");

        // Verificar si existe "cacheHoteles"
        const getRequest = objectStore.get(nombre);

        getRequest.onsuccess = function(event) {
            if (event.target.result) {
                // Si existe, sobrescribir los datos usando una clave explícita
                const dataToUpdate = {
                    datos: datos // Los nuevos datos
                };
                const updateRequest = objectStore.put(dataToUpdate, nombre);

                updateRequest.onsuccess = function() {
                    console.log("Datos sobrescritos con éxito:", dataToUpdate);
                };

                updateRequest.onerror = function() {
                    console.error("Error al sobrescribir los datos");
                };
            } else {
                // Si no existe, agregar los nuevos datos usando una clave explícita
                const dataToAdd = {
                    datos: datos // Los nuevos datos
                };
                const addRequest = objectStore.put(dataToAdd, nombre);

                addRequest.onsuccess = function() {
                    console.log("Datos guardados con éxito en la cache", dataToAdd);
                };

                addRequest.onerror = function() {
                    console.error("Error al guardar los datos");
                };
            }
        };

        getRequest.onerror = function() {
            console.error("Error al obtener datos de "+nombre);
        };
    };

    request.onerror = function() {
        console.error("Error al abrir la base de datos");
    };
}



function recuperarDatosCache(nombre) {
    return new Promise((resolve, reject) => {
        // Abrimos la base de datos
        let request = indexedDB.open("miBaseDeDatos", 1);

        request.onsuccess = function (event) {
            let db = event.target.result;
            let transaction = db.transaction(["cache"], "readonly");
            let objectStore = transaction.objectStore("cache");

            // Intentamos obtener el valor de "cacheHoteles"
            let getRequest = objectStore.get(nombre);

            getRequest.onsuccess = function (event) {
                if (getRequest.result) {
                    resolve(getRequest.result);  // Devolvemos el resultado
                } else {
                    resolve(null);  // No se encontraron datos
                }
            };

            getRequest.onerror = function () {
                reject("Error al recuperar los datos de "+nombre);
            };
        };

        request.onerror = function (event) {
            reject("Error al abrir la base de datos: " + event.target.errorCode);
        };
    });
}