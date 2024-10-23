

function armarId(numero, ocupantes){
    let id = ""
    if(ocupantes[numero]){
        id = ocupantes[numero].adults+"_"+ocupantes[numero].children
        ocupantes[numero].paxes.forEach(element => {
            id += "_"+element.age
        });
    }else{
        console.log("No existe el indice para armar habitaciones")
    }
    return id        
}




function dividirPorTipo(tarifa,nombre, hotel, ocupantes){
    var listas = []
    ocupantes.forEach((element,index) => {
        let nuevo ={
            rooms: armarId(index, ocupantes),
            lista: []
        }
        listas.push(nuevo)
    });
    let tarifaNueva = anadirIdTarifas(tarifa)
    let nuevo = agruparPorIdYBoardCode(tarifaNueva,nombre,hotel)
    return nuevo
}




function agruparPorIdYBoardCode(array, nombre, hotel) {
    const resultado = {};

  array.forEach(item => {
    // Si el id no existe, inicializamos el array para ese id
    if (!resultado[item.id]) {
      resultado[item.id] = {
        id: item.id,
        habitacion: nombre,
        hotel: hotel,
        regimen: []
      };
    }

    // Buscar si ya existe un grupo para este boardCode
    let boardGroup = resultado[item.id].regimen.find(group => group.boardCode === item.boardCode);
    
    // Si no existe el grupo, lo creamos
    if (!boardGroup) {
      boardGroup = { boardCode: item.boardCode,boardName: item.boardName ,valores: [] };
      resultado[item.id].regimen.push(boardGroup);
    }

    // Añadir el objeto actual al array de valores correspondiente
    boardGroup.valores.push(item);
  });

  return Object.values(resultado); // Devolver en formato de array
}






function informacionResumen(id, tarifas,codigoHotel,nombreHotel,nombreHabitacion){
    let datosResumen = {
        id: id,
        numeroHabitacion: tarifas.rooms,
        idHotel: codigoHotel,
        nombreHotel: nombreHotel,
        idHabitacion: tarifas.rateKey,
        nombreHabitacion: nombreHabitacion,
        precio: tarifas.net
    } 
    return datosResumen
}






function anadirIdTarifas(tarifa){
    tarifa.forEach(element => {
        let id = ""
        if(element.children>0){
            id = element.adults+"_"+element.children+"_"+element.childrenAges.replace(/,/g, "_")
        }else{
            id = element.adults+"_"+element.children
        }
        element.id = id
    });
    return tarifa
}





function cancelacion(tarifas){
    let detalle =""
    if(tarifas.rateClass == "NRF" || !tarifas.cancellationPolicies){
        detalle += `<span style="font-size:12px; color: red;">No reembolsable</span>`
    }else if(tarifas.cancellationPolicies && tarifas.cancellationPolicies[0]){
        detalle += `<strong><span style="font-size:12px; color: #99c21c;">Cancelación gratuita hasta:</span></strong>
                    <strong><span style="font-size:12px; color: #99c21c;">`+formatoAmigable2(tarifas.cancellationPolicies[0].from)+`</span></strong>
                    <div class="tooltip_styled tooltip-effect-4">
                        <span class="tooltip-item"  style="font-size:12px;"> Ver políticas de cancelación</span>
                        <div class="tooltip-content">`
                            tarifas.cancellationPolicies.forEach(politicas => {
                                detalle += `Se cobrará $`+politicas.amount+` si cancela despues de `+formatoAmigable(politicas.from)+`<br>`
                                
                            });
                            detalle += `
                        </div>
                    </div>
                    `
    }
    return detalle
}



function formatoAmigable(fechaISO) {
    const opciones = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true, // Usa formato de 12 horas
        timeZoneName: 'short' // Agrega el nombre de la zona horaria si es necesario
    };
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', opciones);
}


function formatoAmigable2(fechaISO){
    const opcionesFecha = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    };
    
    const opcionesHora = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true, // Usa formato de 12 horas
    };

    const fecha = new Date(fechaISO);
    const fechaFormateada = fecha.toLocaleDateString('es-ES', opcionesFecha).replace(/\//g, '/');
    const horaFormateada = fecha.toLocaleTimeString('es-ES', opcionesHora).toLowerCase(); // Convierte a minúsculas

    return `${fechaFormateada}, ${horaFormateada}`;
}


function obtenerPuntacion(puntuacion){
    let estrellas = puntuacion;
    let puntos = Math.floor(estrellas)
    let lista = {icono: "", puntos: puntos};
    for (let i = 1; i <= puntos; i++) {
        lista.icono += '<i class="icon-star-5 voted"></i>';
    }
    if (estrellas % 1 >= 0.5) {
        puntos = puntos+1
        lista.icono += '<i class="icon-star-half voted"></i>';
    }
    for (let i = puntos; i < 5; i++) {
        lista.icono += '<i class="icon-star-empty-2  voted"></i>';
    }
    return lista;
}