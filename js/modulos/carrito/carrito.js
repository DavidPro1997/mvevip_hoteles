var numeroItems = {civitatis: 0, hoteles: 0}
var precioTotalCarrito = {tranfer: 0, hoteles: 0, actividades: 0}
function verificarCarritos(){
    abrirSpinner("Cargando su carrito, por favor espere...")
    verificarCarritoHoteles()    
}


function actualizarNumero(cantitad, tipo){
    if(tipo == 0){
        localStorage.setItem("numCivitatis",cantitad)
        numeroItems.civitatis = cantitad
    }else if(tipo == 1){
        localStorage.setItem("numHoteles",cantitad)
        numeroItems.hoteles = cantitad
    }
    let total = numeroItems.civitatis + numeroItems.hoteles
    localStorage.setItem("numItems",total)
    setTimeout(() => {
        verificarCarritosIndex()      
    }, 500);
}







var protHotel=false
async function verificarCarritoHoteles(){
    const carritoHoteles = JSON.parse(localStorage.getItem("carritoHoteles"))
    if (carritoHoteles && carritoHoteles.length>0) {
        const carrito = await confirmarTarifasHoteles(carritoHoteles)
        if(carrito && carrito.length>0){
            console.log(carrito)
            actualizarNumero(carrito.length,1)
            contruirItemsHoteles(carrito)
            cargadoHotel = true
            cerrarModal()
        }else{
            console.log("Error al confirmar tarifas")
        }
       
    } else {
        localStorage.removeItem("carritoHoteles")
        actualizarNumero(0,1)
        console.log("No hay hoteles")
        protHotel = true
        cargadoHotel = true
        cerrarModal()
        enviarHome()
    }
}


async function confirmarTarifasHoteles(carritoHotelesInfo) {
    let carritoHoteles = [];

    // Mapea el carritoHotelesInfo en un array de promesas
    const promesas = carritoHotelesInfo.map(async (element) => {
        let datosHoteles = { hotel: {}, ocupantes: element.ocupantes };

        // Devuelve una promesa que se resuelve cuando la API responde
        return new Promise((resolve, reject) => {
            Enviar_API_Vuelos(JSON.stringify(element.hotel), '/api/hotelbeds/booking/confirmarTarifas', (datos) => {
                if (datos.estado) {
                    datosHoteles.hotel = datos.consulta.hotel;
                    carritoHoteles.push(datosHoteles);
                    resolve(); // Resuelve la promesa cuando la respuesta es exitosa
                } else {
                    cerrarSpinner();
                    mensajeUsuario('info', 'Ooops...', datos.error);
                    reject(new Error(datos.error)); // Rechaza la promesa en caso de error
                }
            });
        });
    });

    try {
        // Espera a que todas las promesas se resuelvan
        await Promise.all(promesas);
        cerrarSpinner();
        return carritoHoteles; // Devuelve el carrito de hoteles completo
    } catch (error) {
        console.error("Error al confirmar tarifas:", error);
        localStorage.removeItem("carritoHoteles")
        enviarHome()
        return false; // Devuelve false en caso de error
    }
}


function actualizarTabla(precioHotel){
    const total = parseFloat(precioHotel)
    lista = ""
    lista = `
            <div class="row mb-3">
                <div class="box_style_2 d-none d-sm-block">
                    <span class="tape"></span>
                    <div class="border p-3 mt-4 mt-lg-0 rounded mb-3">
                        <h4 class="header-title mb-3">Resumen Costos</h4>
                        <div class="table-responsive">
                            <table class="table">
                                <tbody>
                                    <tr>
                                        <td>Subtotal</td>
                                        <td style="text-align: end;">$`+(total-(total*0.15)).toFixed(2)+` USD</td>
                                    </tr>
                                    <tr>
                                        <td style="color: red;">Total</td>
                                        <td style="text-align: end; color: red;">$`+total.toFixed(2)+` USD</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <!-- end table-responsive -->
                    </div>
                </div>
            </div>
    `
    $("#costosCarrito").html(lista)  
}




function enviarHome(){
    if(protHotel){
        mensajeUsuario('info','Aviso','Agregue items a su carrito')
        setTimeout(function() {
            const url = window.location.origin +  "/home"
            window.location.href = url;      
        }, 2000);
    }
}



function irMasHoteles(element){
    const destino = element.getAttribute('data-destination');
    const fechaLlegada = element.getAttribute('data-checkin');
    const fechaSalida = element.getAttribute('data-checkout');
    const ocupantes = JSON.parse(element.getAttribute('data-occupancies'));
    const datos = 
    {
        destinationId: destino,
        stay: {
            checkIn: fechaLlegada,
            checkOut: fechaSalida
        },
        occupancies: ocupantes
    }
    let datosString = encodeURIComponent(JSON.stringify(datos));
    var url = window.location.origin +  "/listaHoteles?datos=" + datosString
    window.location.href = url;
    
}



function contruirItemsHoteles(carritoHoteles){
    $("#listaHoteles").html("")
    let lista = ""
    carritoHoteles.forEach((element,index) => {
        lista = ""
        lista += `
            <div class="strip_all_tour_list wow fadeIn" data-wow-delay="0.1s" id="hotel_`+index+`">
                <div class="row">
                    <div class="col-lg-4 col-md-4 position-relative">`
                        if(element.hotel.exclusiveDeal){
                            lista += `
                            <div class="ribbon_3"><span style="font-size:7px;">`+obtenerExclusiveDeal(element.hotel.exclusiveDeal)+`</span></div>
                            `
                        }
                        lista += `
                        <div class="img_list" style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%">
                        `
                            if(element.hotel.images){
                                lista+= `<img src="`+element.hotel.images[0][element.hotel.images[0].length-1]+`" alt="Image" style="max-width: 100%; object-fit: cover; left:0;">`
                            }else{
                                lista+= `<img src="img/hoteles/mkv.png" alt="Image" style="max-width: 100%; object-fit: cover; left:0;">`
                            }
                            lista +=`
                        </div>
                    </div>
                    <div class="col-lg-6 col-md-6" style="position: relative;">
                        <div class="tour_list_desc">
                            <div class="rating">
                                <small class="voted" style="font-size:15px;">HOTEL</small>
                            </div>
                            <h3><strong>`+element.hotel.name+`</strong></h3>
                            <br>
                            <div clas="row" style="display: flex;">
                                <div class="col-1">
                                    <i class="icon-location" style="font-size:15px; color:#99c21c;"></i>
                                </div>
                                <div class="col-11" style="display: flex; flex-direction: column;">
                                    <span style="font-size:12px;"><strong>Ubicacion: </strong>`+element.hotel.destinationName+` / `+element.hotel.address+` /
                                        <a href="https://www.google.com/maps?q=${element.hotel.latitude},${element.hotel.longitude}" target="_blank" style="font-size:12px;">
                                            Ver ubicación en el Mapa
                                        </a>
                                    </span>
                                </div>
                            </div>
                            <div class="row" style="display: flex;">
                                <div class="col-1">
                                    <i class="icon-calendar" style="font-size:13px; color:#99c21c;"></i>
                                </div>
                                <div class="col-11">
                                    <span style="font-size: 12px;"><strong>Check-in:</strong></span> 
                                    <span style="font-size: 12px;">`+element.hotel.checkIn+`</span>
                                </div>
                            </div>
                            <div class="row" style="display: flex;">
                                <div class="col-1">
                                    <i class="icon-calendar" style="font-size:13px; color:#99c21c;"></i>
                                </div>
                                <div class="col-11">
                                    <span style="font-size: 12px;"><strong>Check-out:</strong></span> 
                                    <span style="font-size: 12px;">`+element.hotel.checkOut+`</span>
                                </div>
                            </div> 
                            <div class="row" style="display: flex;">
                                <div class="col-1">
                                    <i class="icon-phone" style="font-size:13px; color:#99c21c;"></i>
                                </div>
                                <div class="col-11">
                                    <span style="font-size: 12px;"><strong>Teléfono:</strong></span> 
                                    <span style="font-size: 12px;">`+element.hotel.phones[0].phone_number+`</span>
                                </div>
                            </div> 
                            <p style="position: absolute; bottom: 0; right: 20px; margin: 0;">
                                <a href="#habitaciones`+element.hotel.code+`_`+index+`" data-bs-toggle="collapse">
                                    Ocultar/Mostrar <i class="icon-up-open-1" style="font-size:13px; color:#99c21c;"></i>
                                </a>
                            </p>
                        </div>
                    </div>
                    <div class="col-lg-2 col-md-2" style="position: relative;">
                        <div class="price_list">
                            <a href="#" onclick="eliminarItem('hotel_`+index+`',`+index+`,1); return false;" style="position: absolute; top: 10px; right: 10px; cursor: pointer;" id="basureroHotel`+index+`">
                                <i class="icon-trash" style="font-size: 24px;"></i>
                            </a>
                            <div>
                                <sup>$</sup><strong><sup id="precioHotel_`+element.hotel.code+`_`+index+`" style = "font-size:32px;"></sup></strong>
                                <small>*Total</small>
                                <small>
                                    <a href="#" 
                                    data-destination="`+element.hotel.destinationCode+`"
                                    data-checkin="`+element.hotel.checkIn+`"
                                    data-checkout="`+element.hotel.checkOut+`"
                                     data-occupancies='`+JSON.stringify(element.ocupantes)+`'
                                    onclick="irMasHoteles(this); return false;" style="display:flex; align-items:center; text-align:center; font-size: 13px; color: red;" id="sugerenciaAct`+index+`">
                                        Ver mas hoteles en este destino
                                    </a>
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
                <br>
                <div class="collapse show" id="habitaciones`+element.hotel.code+`_`+index+`">`
                    
                    element.ocupantes.forEach((aux,auxIndex) => {
                        lista += `
                            <h6 style="font-size:15px;"><strong>`+aux.rooms+` HABITACIÓN(ES) </strong> POR `+aux.adults+` ADULTO(S)`
                                if(aux.children){
                                    lista += ` + `+aux.children+` NIÑO(S) DE `
                                    aux.paxes.forEach(ninos => {
                                        if(ninos.type == "CH"){
                                            lista += ` `+ninos.age+` AÑOS `
                                        }

                                    });
                                }
                                lista += `
                            </h6>                       
                            <div id="rooms_`+element.hotel.code+`_`+armarId(0,aux.rooms,aux.adults, aux.children, aux.paxes)+`_`+index+`">
                            </div>
                            <br>
                            <div class="row" style="margin-left: 20px; margin-right: 20px; display:none;" id="id_`+index+`_`+auxIndex+`">`
                                let id = armarId(0,aux.rooms,aux.adults, aux.children, aux.paxes)
                                for(let j=0; j<aux.rooms; j++){
                                    if(aux.rooms>1){
                                        lista += `<span style="font-size: 12px;"><strong>HABITACIÓN `+(j+1)+`</strong></span><br><br>`
                                    }
                                    
                                    for(let i=0; i<aux.adults; i++){
                                        lista += `
                                        <label style="font-size: 12px;"><strong>Adulto `+(i+1)+`</strong></label>
                                        <div class="col-lg-6 col-sm-12 mb-3">
                                            <label style="font-size: 11px;">Nombre</label>
                                            <input type="text" class="form-control" id="nombreAdulto`+(j+1)+(i+1)+`_`+id+`_`+index+`" placeholder="Escriba el nombre del adulto"/>
                                        </div>
                                        <div class="col-lg-6 col-sm-12 mb-3">
                                            <label style="font-size: 11px;">Apellido</label>
                                            <input type="text" class="form-control" id="apellidoAdulto`+(j+1)+(i+1)+`_`+id+`_`+index+`" placeholder="Escriba el apellido del adulto"/>
                                        </div>
                                        `
                                    }
                                    if(aux.children && aux.paxes){
                                        aux.paxes.forEach((ninos, k) => {
                                            lista += `
                                            <label style="font-size: 12px;"><strong>Niño `+(k+1)+`</strong></label>
                                            <div class="col-lg-5 col-sm-12 mb-3">
                                                <label style="font-size: 11px;">Nombre</label>
                                                <input type="text" class="form-control" id="nombreNino`+(j+1)+(k+1)+`_`+id+`_`+index+`" placeholder="Escriba el nombre del niño"/>
                                            </div>
                                            <div class="col-lg-5 col-sm-12 mb-3">
                                                <label style="font-size: 11px;">Apellido</label>
                                                <input type="text" class="form-control" id="apellidoNino`+(j+1)+(k+1)+`_`+id+`_`+index+`" placeholder="Escriba el apellido del niño"/>
                                            </div>
                                            <div class="col-lg-2 col-sm-6 mb-3">
                                                <label style="font-size: 11px;">Edad</label>
                                                <input type="text" class="form-control" id="edadNino`+(j+1)+(k+1)+`_`+id+`_`+index+`" value="`+ninos.age+` años" readonly/>
                                            </div>
                                            `
                                        });
                                    }
                                }  
                                lista +=`
                            </div>
                        <br>`
                    });
                    lista += `
                    <br>
                </div>
            </div>
        `
        $("#listaHoteles").append(lista)
        dividirHabitaciones(element.hotel.rooms, element.hotel.code, index, element.hotel.name)
        // construirHabitaciones2(element.hotel.rooms,element.hotel.code,element.hotel.name, element.ocupantes, index)
    });
    
}



function dividirHabitaciones(rooms, codigoHotel, index){
    const datos_por_habitacion = dividirPorIdRate(rooms)
    plasmarHabitaciones(datos_por_habitacion, codigoHotel, index)
}


var precioHotelTotalCarrito = 0
function plasmarHabitaciones(habitacionesDivididas, codigoHotel, index){
    let lista = ""
    let precioHotel = 0
    habitacionesDivididas.forEach(element => {
        lista = ""
        const datos = obtenerRooms(0,element.rooms)
        lista += datos.lista
        precioHotel = precioHotel + parseFloat(datos.precio)
        $("#rooms_"+codigoHotel+"_"+element.id+"_"+index).html(lista)        
    });
    $("#precioHotel_"+codigoHotel+"_"+index).html(precioHotel)
    precioHotelTotalCarrito = precioHotelTotalCarrito + precioHotel
    actualizarTabla(precioHotelTotalCarrito)
}






function eliminarItem(idContenedor, itemId, tipo){
    if(tipo == 0){
        eliminarCivitatis(idContenedor, itemId)
    }
    else if(tipo == 1){
        eliminarHotel(idContenedor, itemId)
    }

}





function eliminarHotel(idContenedor, itemId){
    const carritoHoteles = JSON.parse(localStorage.getItem("carritoHoteles"))
    if(carritoHoteles[itemId]){
        carritoHoteles.splice(itemId,1)
        localStorage.setItem("carritoHoteles",JSON.stringify(carritoHoteles))
        const contenedor = document.getElementById(idContenedor);
        contenedor.remove(); 
        verificarCarritoHoteles()
    }else{
        console.log("No se encontro el item")
    }
}



function removerPuntos(cadena) {
    return cadena.replace(/\./g, '__');
}

function revertirDobleGuionBajo(cadena) {
    return cadena.replace(/__+/g, '.'); // Usar + para manejar más de dos guiones bajos si hay casos complejos
}





var cargadoHotel = false
var cargadoCivitatis = false
function cerrarModal(){
    if(cargadoHotel && cargadoCivitatis){
        setTimeout(function() {
            cerrarSpinner()
        }, 200);
        cargadoHotel= false
        cargadoCivitatis = false
    }
}



function irDetallesCarrito(){
    abrirSpinner("Cargando, espere porfavor...")
    const carritoCivitatis = localStorage.getItem("carritoCivitatis")
    const carritoHoteles = JSON.parse(localStorage.getItem("carritoHoteles"))
    if(carritoCivitatis){
        anadirFormularioCivitatis()
    }else{
        let customer={firstName: '', lastName: '', prefix: '', phone: '', email: ''}
        construirDatosFactura(customer)
        setTimeout(function() {
            cargadoCivitatis = true 
            cerrarModal()

        }, 1000);
    }
    if(carritoHoteles){
        anadirFormularioHoteles()
    }else{
        setTimeout(function() {
            cargadoHotel = true 
            cerrarModal()

        }, 1000);
    }
    $("#datosFactura").show()
    editarHeaderDetalles()
}


