function mostrarValoresDefaultHoteles(){
    var lista = `
        <div class="col-12">
            <a class="dropdown-item text-wrap" href="#" onclick="escogerSalida('UIO - Quito - Ecuador');return false;" style="white-space: normal;">
                <strong>UIO - Quito</strong> 
                <span class="text-muted" style="font-size: small;">Ecuador</span>
            </a>
        </div>
         <div class="col-12">
            <a class="dropdown-item text-wrap" href="#" onclick="escogerSalida('NYC - New York - USA');return false;" style="white-space: normal;">
                <strong>NYC - New York</strong> 
                <span class="text-muted" style="font-size: small;">USA</span>
            </a>
        </div>
        <div class="col-12">
            <a class="dropdown-item text-wrap" href="#" onclick="escogerSalida('MIA - Miami, Florida - USA');return false;" style="white-space: normal;">
                <strong>MIA - Miami, Florida</strong> 
                <span class="text-muted" style="font-size: small;">USA</span>
            </a>
        </div>
        <div class="col-12">
            <a class="dropdown-item text-wrap" href="#" onclick="escogerSalida('PUJ - Punta Cana - Republica Dominicana');return false;" style="white-space: normal;">
                <strong>PUJ - Punta Cana</strong> 
                <span class="text-muted" style="font-size: small;">Republica Dominicana</span>
            </a>
        </div>
        <div class="col-12">
            <a class="dropdown-item text-wrap" href="#" onclick="escogerSalida('CUN - Cancún - México');return false;" style="white-space: normal;">
                <strong>CUN - Cancún </strong> 
                <span class="text-muted" style="font-size: small;">México</span>
            </a>
        </div>
        <div class="col-12">
            <a class="dropdown-item text-wrap" href="#" onclick="escogerSalida('MCO - Orlando - USA');return false;" style="white-space: normal;">
                <strong>MCO - Orlando</strong> 
                <span class="text-muted" style="font-size: small;">USA</span>
            </a>
        </div>
        <div class="col-12">
            <a class="dropdown-item text-wrap" href="#" onclick="escogerSalida('CTG - Cartagena - Colombia');return false;" style="white-space: normal;">
                <strong>CTG - Cartagena</strong> 
                <span class="text-muted" style="font-size: small;">Colombia</span>
            </a>
        </div>
    `
    $("#listaDestinosHoteles").html(lista)
}




var proteccionHoteles = true
function buscadorDestinosHotel(event){
    $("#spinnerContenidoHotel").show()
    $("#buscadorContenidoHotel").hide()
    
    setTimeout(function() {
        let textoIngresado = document.getElementById("destinoHotel").value;
        let numero = parseInt(textoIngresado.length)
        if(numero > 3 && proteccionHoteles){
            proteccionHoteles = false
            mostrarDestinosHoteles(textoIngresado)
        }else if(numero < 3){
            $("#spinnerContenidoHotel").hide()
            $("#buscadorContenidoHotel").show() 
            mostrarValoresDefaultHoteles()
        }       
    }, 2000);
    
}


function mostrarDestinosHoteles(buscador){
    proteccionHoteles = false
    Obtener_API_Vuelos(null, '/api/hotelbeds/destinos?buscador='+buscador, datos => {
        var destinos = []
        if (datos.estado) {
            proteccionHoteles = true
            datos.consulta.forEach((element, index) => {
                let existe = destinos.some(aux => aux.id === element.destinationId)
                if(!existe){
                        let nuevoDestino = {
                            id: element.code,
                            ciudad: element.destino,
                            pais: element.pais
                        }
                        destinos.push(nuevoDestino)
                }
            });
            armarDestinosHoteles(destinos)
            $("#spinnerContenidoHotel").hide()
            $("#buscadorContenidoHotel").show()  
        }
        else{
            mensajeUsuario("error","Ooops...",datos.error)

        }

    })
}


function armarDestinosHoteles(destinos){
    var lista = ""
    destinos.forEach((element, index) => {
        lista += `
                <div class="col-lg-12 col-sm-12">
                    <a class="dropdown-item text-wrap" href="#" onclick="escogerSalida('`+element.id+` - `+element.ciudad+` - `+element.pais+`');return false;" style="white-space: normal;">
                        <strong>`+element.id+` - `+element.ciudad+`</strong> 
                        <span class="text-muted" style="font-size: small;">`+element.pais+`</span>
                    </a>
                </div>
        `
        $("#listaDestinosHoteles").html(lista)
        return
    });
}



function escogerSalida(ciudadEscogida){
    document.getElementById("destinoHotel").value = ciudadEscogida.toUpperCase()
    var dropdown = document.getElementById("dropdownHoteles");
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}

function establecerSalidaHoteles(){
    flatpickr("#chekInHotel", {
        minDate: "today", // Bloquear fechas anteriores a hoy
        dateFormat: "Y-m-d",
        disableMobile: true // Opcional: evita que el selector se convierta en un selector móvil
    }) 
}

function establecerRegresoHotel(){
    var fechaSalida = document.getElementById("chekInHotel").value
    
    let fechaMaximaAux = new Date(fechaSalida);
    fechaMaximaAux.setDate(fechaMaximaAux.getDate() + 30); 
    let fechaMaxima = fechaMaximaAux.toISOString().split('T')[0];

    let fechaSalidaDate = new Date(fechaSalida);
    fechaSalidaDate.setDate(fechaSalidaDate.getDate() + 1); 
    let fechaMinima = fechaSalidaDate.toISOString().split('T')[0];
    flatpickr("#chekOutHotel", {
        minDate: fechaMinima, 
        maxDate: fechaMaxima,
        dateFormat: "Y-m-d",
        disableMobile: true,
        defaultDate: fechaMinima,
        onReady: function(selectedDates, dateStr, instance) {
            instance.open(); 
    }
    });
}


var occupancies = [
    {
        rooms: 1,
        adults: 2,
        children: 0,
        paxes: []
    }
]
function agregarHabitacion(){
    let nuevahabitacion = {
        rooms: 1,
        adults: 2,
        children: 0,
        paxes: []
    }
    occupancies.push(nuevahabitacion)  
    mostrarHabitaciones()
}




function mostrarHabitaciones(){
    var lista =""
    occupancies.forEach((element,index) => {
        if(index > 0){
            lista += `
            <hr>
                <div id="habitacion`+index+`" class="mt-2">
                    <div  class="d-flex justify-content-between align-items-center">
                        <h6 class="dropdown-header" style="font-size: 16px; color: black;">
                            <i class="fas fa-building"></i>
                            Habitación `+(index+1)+`
                        </h6>
                        <button type="button" class="btn" style="background-color: red; margin-right:10px" onclick="eliminarHabitacion();  event.stopPropagation();">
                            <i class="fas fa-plus" style="transform: rotate(45deg); color: white;"></i>
                        </button>
                    </div>
                    <div class="row" style="margin-left: 15px; margin-right: 5px; align-items: center;">
                        <div class="col-lg-6 col-sm-12">
                            <span>Adultos</span>
                            <input type="number" value="`+(element.adults)+`" min="1" id="numeroAdulto`+(index)+`" class="form-control" style="font-size: 18px; text-align: center; width: 50%;" onchange="actualizarPersonas(0,`+(index)+`);">
                        </div>
                        <div class="col-lg-6 col-sm-12">
                            <span>Niños <span style="font-size: 10px;">2-11 años</span></span>
                            <input type="number" value="`+(element.children)+`" min="0" max="4" id="numeroNino`+(index)+`" class="form-control" style="font-size: 18px; text-align: center; width: 50%;"  onchange="actualizarPersonas(1,`+(index)+`);">
                        </div>
                        <div class="col-lg-12 col-sm-12" `
                        if(element.children <0){
                            lista += `style="display: none;"`
                        }
                        lista +=` id="edadesNinos_`+(index)+`">
                            <span>Edad niños</span>
                            <div class="row">`
                                let contador = 0
                                element.paxes.forEach(edades => {
                                    lista += `
                                        <div class="col-3" style="display: flex; align-items: center; display: block;" id="ninoC_`+(index)+`_`+(contador)+`">
                                            <input type="number" value="`+(edades.age)+`" min="2" max="11" id="nino_`+(index)+`_`+(contador)+`" class="form-control" style="font-size: 18px; text-align: center;" onchange="actualizarEdad(`+(index)+`,`+(contador)+`)">
                                            <small style="margin-left: 15px; font-size: 12px;">años</small>
                                        </div>
                                    `
                                    contador = contador+1
                                })
                                for(let i=contador; i<4; i++){
                                    lista += `
                                        <div class="col-3" style="display: flex; align-items: center; display: none;" id="ninoC_`+(index)+`_`+i+`">
                                            <input type="number" value="2" min="2" max="11" id="nino_`+(index)+`_`+i+`" class="form-control" style="font-size: 18px; text-align: center;" onchange="actualizarEdad(`+(index)+`,`+i+`)">
                                            <small style="margin-left: 15px; font-size: 12px;">años</small>
                                        </div>
                                    `
                                }
                                lista +=
                                `
                               
                            </div>
                        </div>
                    </div>
                </div> 
                `
        }
    });
    
    $("#habitaciones").html(lista)
    
}


function eliminarHabitacion(){
    // let ultimoValor = occupancies[occupancies.length - 1];
    if(occupancies.length > 1){
        occupancies.pop()
        mostrarHabitaciones()

    }
    
}

function actualizarPersonas(tipo,numero){
    let valor=""
    if(tipo == 0){
        valor = document.getElementById("numeroAdulto"+numero).value
        occupancies[numero].adults = parseInt(valor)
    }else if(tipo == 1){
        valor = document.getElementById("numeroNino"+numero).value
        editarEdades(parseInt(valor),numero)
        if(parseInt(valor)>0){
            $("#edadesNinos_"+numero).show()
            for(let i=0;i<4;i++){                                        
                if(parseInt(valor)>i){
                    $("#ninoC_"+numero+"_"+i).show()
                }else{
                    $("#ninoC_"+numero+"_"+i).hide()

                }
            }
        }
        else{
            $("#edadesNinos_"+numero).hide()
        }
        occupancies[numero].children = parseInt(valor)
    }
}




function editarEdades(valor,numero){
    if(occupancies[numero].paxes.length > valor){
        occupancies[numero].paxes.pop()
    }else if(occupancies[numero].paxes.length < valor){
        let nuevaEdad = {
                type: "CH",
                age: 2
            }
        occupancies[numero].paxes.push(nuevaEdad) 
    }
}

function actualizarEdad(numeroItem,numeroEdad){
    let valor = document.getElementById("nino_"+numeroItem+"_"+numeroEdad).value
    occupancies[numeroItem].paxes[numeroEdad].age = parseInt(valor)        
}

function cargarPersonasHoteles() {
    let personas = 0
    let habitaciones = occupancies.length
    occupancies.forEach(element => {
        personas= personas+element.adults+element.children
    });
    document.getElementById("personasHoteles").value = "👤 "+personas+" PERSONAS Y 🏠 "+habitaciones+" HABITACIONES"
    var dropdown = document.getElementById("dropdownPersonasHoteles");
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}



function buscarHoteles(){
    let destino = ""
    let fechaLlegada = ""
    let fechaSalida = ""
    let datos = {}
    if(validarDatos()){
        let result = mergeUniqueRooms(occupancies);
        destino = (document.getElementById("destinoHotel").value).substring(0, 3);
        fechaLlegada = document.getElementById("chekInHotel").value
        fechaSalida = document.getElementById("chekOutHotel").value
        datos = 
        {
            destinationId: destino,
            stay: {
                checkIn: fechaLlegada,
                checkOut: fechaSalida
            },
            occupancies: result
        }
        let datosString = encodeURIComponent(JSON.stringify(datos));
        var url = window.location.origin + "/listaHoteles?datos=" + datosString
        window.location.href = url;
    }
    else{
        mensajeUsuario('info','Oops...','Debe llenar todos los campos')
    }
    
}

function validarDatos(){
    if(
        document.getElementById("destinoHotel").value &&
        document.getElementById("chekInHotel").value &&
        document.getElementById("chekOutHotel").value
    ){
        return true
    }
    return false
}

function mergeUniqueRooms(arr) {
    const uniqueArray = [];
    arr.forEach(item => {
        const found = uniqueArray.find(el =>
            el.adults === item.adults &&
            el.children === item.children &&
            JSON.stringify(el.paxes) === JSON.stringify(item.paxes)
        );
        if (found) {
            found.rooms += item.rooms;
        } else {
            uniqueArray.push({ ...item });
        }
    });
    return uniqueArray;
}