

function armarId(tipo,habitaciones, adultos, ninos, edades_ninos){
    let id = ""
    if(tipo == 0){
        id = habitaciones+"_"+adultos
        if(parseInt(ninos)>0){
            id += "_"+ninos
            edades_ninos.forEach(element => {
                if(element.type == "CH"){
                    id += "_"+element.age
                }
            });
        }
    }
    else if(tipo == 1){
        id = habitaciones+"_"+adultos
        if(parseInt(ninos)>0){
            id += "_"+ninos+"_"+edades_ninos.replaceAll(",", "_")
        }
    }else{
        console.log("no se puede armar el id")
    }
    return id
}


function dividirPorIdRate(rooms) {
    const result = {};
    rooms.forEach(room => {
        room.rates.forEach(rate => {
            const rateId = armarId(1, rate.rooms, rate.adults, rate.children, rate.childrenAges);
            if (!result[rateId]) {
                result[rateId] = [];
            }
            const existingRoom = result[rateId].find(r => r.code === room.code);
            if (!existingRoom) {
                const filteredRoom = {
                    code: room.code,
                    name: room.name,
                    rates: room.rates.filter(r => {
                        const currentRateId = armarId(1, r.rooms, r.adults, r.children, r.childrenAges);
                        return currentRateId === rateId;
                    }),
                };
                result[rateId].push(filteredRoom);
            }
        });
    });
    return Object.entries(result).map(([key, value]) => ({
        id: key,
        rooms: value
    }));
}


function obtenerRooms(tipo, rooms_, id, codigoHotel, nombreHotel){
    let lista = ""
    rooms_.forEach(rooms => {
        if(rooms.rates.length>0){
            lista += `
            <hr style="margin:0 0 10px 0; height: 2px;">
            <h7 style="color: blue; margin-left:15px;"><strong>`+rooms.name.toUpperCase()+`</strong></h7>
            <small style="margin-left:8px;">(`+traducirTipoHabitacion(rooms.code)+`)</small>
            `
            rooms.rates.forEach(rates => {
                lista += `
                    <div class="row mb-2">
                        <div class="col-4 d-flex align-items-center">
                            <small style="margin-left:15px;">`+rates.boardName+`</small>
                        </div>
                        <div class="col-5" style="text-align:center;" >
                            `+cancelacion(rates)+`
                        </div>
                        <div class="col-2 justify-content-center" style="display: flex; flex-direction: column; align-items: end;">
                            <span style="font-size: 14px"><strong>$`
                            if(rates.sellingRate){
                                const precio = parseFloat(rates.sellingRate)+100
                                lista += precio.toFixed(2)
                            }else{
                                const precio = parseFloat(rates.net)+100
                                lista += precio.toFixed(2)
                            }
                            lista +=` USD</strong></span>
                        </div>`
                        if(tipo){
                            lista += `
                                <div class="col-1 d-flex align-items-center justify-content-center">
                                    <input class="form-check-input" type="radio" name="radio`+id+`" id="customradio2" style="transform: scale(1.4);" value='`+JSON.stringify(informacionResumen(id,rates.adults,rates.children,rates.childrenAges,rates,codigoHotel,nombreHotel,rooms.name))+`' onclick="escogerHotel(this.value)">
                                </div>
                            `
                        }
                        lista += `
                    </div> `
                    if(!tipo){
                        lista += `
                            <div class="col-12 mt-2" style="display: flex; flex-direction: column;">
                                <p style="margin-right: 15px; margin-left: 15px; text-align: justify;">
                                    <strong>Comentarios</strong><br>
                                    `+rates.rateComments+`
                                </p>
                            </div>
                        `
                    }
            }); 
        } 
    });
    return lista
}

// function dividirPorTipo(tarifa,nombre, hotel, ocupantes){
//     var listas = []
//     ocupantes.forEach((element,index) => {
//         let nuevo ={
//             rooms: armarId(index, ocupantes),
//             lista: []
//         }
//         listas.push(nuevo)
//     });
//     let tarifaNueva = anadirIdTarifas(tarifa)
//     let nuevo = agruparPorIdYBoardCode(tarifaNueva,nombre,hotel)
//     return nuevo
// }




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






function informacionResumen(id_cuarto,adultos,ninos,edad_ninos, rate,codigoHotel,nombreHotel,nombreHabitacion){
    let datosResumen = {
        id: id_cuarto,
        adultos: adultos,
        ninos: ninos,
        edadesNinos: edad_ninos,
        numeroHabitacion: rate.rooms,
        idHotel: codigoHotel,
        nombreHotel: nombreHotel,
        rateKey: rate.rateKey,
        nombreHabitacion: nombreHabitacion,
        precio: parseFloat(rate.net) + 100
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
        detalle += `
                    <div class="tooltip_styled tooltip-effect-4">
                        <span class="tooltip-item"  style="font-size:12px;"> 
                            <strong><span style="font-size:12px; color: #99c21c;">Cancelación gratuita hasta: `+formatoAmigable2(tarifas.cancellationPolicies[0].from)+`</span></strong>
                        </span>
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