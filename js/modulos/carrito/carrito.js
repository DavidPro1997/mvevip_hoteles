var numeroItems = {civitatis: 0, hoteles: 0}
var precioTotalCarrito = {tranfer: 0, hoteles: 0, actividades: 0}
function verificarCarritos(){
    setTimeout(function() {
        abrirSpinner("Cargando su carrito, por favor espere...")
    }, 200);
    setTimeout(function() {
        verificarCarritoCivitatis()
        verificarCarritoHoteles()    
    }, 8000);
    
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




function actualizarPrecioActividades(total){
    precioTotalCarrito.actividades = total
    actualizarTabla()
}

function actualizarPrecioTranfers(total){
    precioTotalCarrito.tranfer = total
    actualizarTabla()
}



function actualizarPrecioHoteles(carritoHoteles){
    let total = 0
    carritoHoteles.forEach(element => {
        total = total+parseFloat(element.hotel.totalNet)+100
    });
    precioTotalCarrito.hoteles= total
    actualizarTabla()
}



var protHotel=false
async function verificarCarritoHoteles(){
    const carritoHoteles = JSON.parse(localStorage.getItem("carritoHoteles"))
    console.log(carritoHoteles)
    if (carritoHoteles && carritoHoteles.length>0) {
        const carrito = await confirmarTarifasHoteles(carritoHoteles)
        if(carrito && carrito.length>0){
            console.log(carrito)
            actualizarNumero(carrito.length,1)
            actualizarPrecioHoteles(carrito)
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


function actualizarTabla(){
    let total = precioTotalCarrito.tranfer+precioTotalCarrito.actividades+precioTotalCarrito.hoteles
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



var protCivitatis=false
function verificarCarritoCivitatis(datos){
    const carritoId = localStorage.getItem('carritoCivitatis');  
    if(carritoId){
        mostrarCarritoCivitatis(carritoId,datos)
    }
    else{
        actualizarNumero(0,0)
        console.log("No hay actividades")
        protCivitatis = true
        cargadoCivitatis = true
        cerrarModal()
        enviarHome()
        
    }
}



function enviarHome(){
    if(protCivitatis && protHotel){
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
                                    <span style="font-size:12px;"><strong>Ubicacion: </strong>`+element.hotel.destinationName+` / `+element.hotel.address+`</span>
                                    <a href="https://www.google.com/maps?q=${element.hotel.latitude},${element.hotel.longitude}" target="_blank" style="font-size:12px;">
                                        Ver ubicación en el Mapa
                                    </a>
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
                                <sup>$</sup>`
                                if(element.hotel.sellingRate){
                                    const precio = parseFloat(element.hotel.sellingRate)+100
                                    lista += precio.toFixed(2)
                                }else{
                                    const precio = parseFloat(element.hotel.totalNet)+100
                                    lista += precio.toFixed(2)
                                }
                                lista +=`
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



function plasmarHabitaciones(habitacionesDivididas, codigoHotel, index){
    let lista = ""
    habitacionesDivididas.forEach(element => {
        lista = ""
        lista += obtenerRooms(0,element.rooms)
        $("#rooms_"+codigoHotel+"_"+element.id+"_"+index).html(lista)        
    });
}



function traducirTipoHabitacion(room){
    // const tipo = room.split('.')[0];
    // const resultado = tiposGlobal.find(item => item.type == tipo)
    // if (resultado) {
    //     return resultado.typeDescription.toUpperCase()
    // } else {
    //     return tipo.toUpperCase()
    // }
    return room
}


   

contadorErrorCivitatis= 0
var datosCivitatis = []
function mostrarCarritoCivitatis(idCarrito, data){
    if(data){
        distribuirCarritoCivitatis(data)
        actualizarNumero(data.length,0)
    }
    else{
        Obtener_API_Vuelos(null, '/api/civitatis/carrito/'+idCarrito, datos => {
            if (datos.estado) {
                let numCivitatis = localStorage.getItem("numCivitatis")
                if(numCivitatis >= datos.consulta.items.length){
                    datosCivitatis = datos.consulta.items
                    actualizarNumero(datosCivitatis.length,0)
                    distribuirCarritoCivitatis(datos.consulta.items)
                    cargadoCivitatis = true
                    cerrarModal()
                }else{
                    console.log("Aun no se actualiza, volviendo a consultar")
                    numCivitatis = numCivitatis+1
                    localStorage.setItem("numCivitatis", numCivitatis)
                    setTimeout(function(){
                        mostrarCarritoCivitatis(idCarrito)
                    },3000)
                    
                }
                
            }
            else{
                if(contadorErrorCivitatis > 1){
                    localStorage.removeItem("carritoCivitatis")
                    cargadoCivitatis = true
                    cerrarModal()
                }else{
                    contadorErrorCivitatis = contadorErrorCivitatis +1
                    setTimeout(function(){
                        mostrarCarritoCivitatis(idCarrito)
                    },3000)
                }
                
            }
        })
    }
    
}




function distribuirCarritoCivitatis(items){
    let tranfers = []
    let activiadades = []
    items.forEach(element => {
        if(element.transfer){
            tranfers.push(element)
        }else if(element.activity){
            activiadades.push(element)
        }
    });
    armarTranfersCarrito(tranfers)
    armarActividadesCarrito(activiadades)
}




function armarActividadesCarrito(datos){
    let lista = ""
    let precioTotalActividades = 0
    datos.forEach((element,index) => {
        lista += `
            <div class="strip_all_tour_list wow fadeIn" data-wow-delay="0.1s" id="act_`+index+`">
                <div class="row mb-3">
                    <div class="col-lg-4 col-md-4 position-relative"> `
                        if(parseFloat(element.details.minimumPrice) < parseFloat(element.details.originalPrice)){
                            lista += `<div class="ribbon_3"><span>Descuento</span> </div>`
                        }
                        lista +=`
                        <div class="img_list" style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%">
                            <img src="`+element.details.photos.header[0].paths.grid+`" alt="Image" style="max-width: 100%; object-fit: cover; left:0;">
                            <div class="short_info">
                                `+tipoActividad(element.details.subcategory)+`
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6 col-md-6" style="overflow-y: auto; max-height: max-content; position: relative; z-index: 1;">
                        <div class="tour_list_desc">
                            `+sacarScore(element.details.score).icono+`
                            <div class="rating">
                                <small class="voted" style="font-size:15px;">ACTIVIDAD</small>
                            </div>
                            <h3><strong>`+element.details.title+`</strong></h3>
                            <p>
                            <div class="row">
                                <div class="col-lg-12">
                                    <span style="font-size: 12px;"><strong>Fecha:</strong></span> 
                                    <span style="font-size: 12px;">`+element.date+`</span>
                                </div>`
                                if(element.time){
                                    lista += `
                                        <div class="col-lg-12">
                                            <span style="font-size: 12px;"><strong>Hora:</strong></span> 
                                            <span style="font-size: 12px;">`+element.time+`</span>
                                        </div>
                                    `
                                }
                                lista +=`
                                <div class="col-lg-12">
                                    <span style="font-size: 12px;"><strong>Tipo:</strong></span> 
                                    <span style="font-size: 12px;">`+element.rate.rate+`</span>
                                </div>`
                                var precioItem = 0
                                element.rate.categories.forEach(cat => {
                                    lista += `
                                    <div class="col-lg-12">
                                        <span style="font-size: 12px;"><strong>`+cat.quantity+` `+cat.category+`:</strong></span> 
                                        <span style="font-size: 12px;">$`+parseFloat((cat.totalPrice),10).toFixed(2)+`</span>
                                    </div> `
                                    precioItem = precioItem + parseFloat((cat.totalPrice),10)
                                });
                                lista += `<br><br>`
                                element.details.cancelPolicies.forEach(cancelacion => {
                                    
                                    if(cancelacion.penalty == 0 && cancelacion.hours == 0){
                                        lista +=`
                                            <div class="col-12">
                                                <span style="font-size: 12px;" class="text-success d-flex justify-content-center">Cancelación gratuita</span>
                                            </div>
                                            `
                                    }else if(cancelacion.penalty == 100 && cancelacion.hours == 0){
                                        lista +=`
                                            <div class="col-12">
                                                <span style="font-size: 12px;" class="text-danger d-flex justify-content-center">No reembolsable</span>
                                            </div>
                                            `
                                    }else if(cancelacion.penalty == 0 && cancelacion.hours != 0){
                                        lista +=`
                                            <div class="col-12">
                                                <span style="font-size: 12px;" class="text-success d-flex justify-content-center">Cancelación gratuita hasta `+cancelacion.hours+` antes de la actividad</span>
                                            </div>
                                            `
                                    }
                                    else{
                                        lista +=`
                                            <div class="col-12">
                                                <span style="font-size: 12px;" class="d-flex justify-content-center">Si se cancela despues de `+cancelacion.hours+` horas, tendra una penalidad del `+cancelacion.penalty+`% del total de la actividad</span>
                                            </div>
                                            `
                                    }
                                });
                                
                                lista +=`
                            </div>
                            </p>
                            <div style="display: flex; justify-content: center; align-items: center;">
                            <ul class="add_info">
                                <li>
                                    <div class="tooltip_styled tooltip-effect-4" style="position: relative;  z-index: 10;">
                                        <span class="tooltip-item"><i class="icon_set_1_icon-83"></i></span>
                                        <div class="tooltip-content" style="position: absolute;  z-index: 1000;">
                                            <h4>Tiempo de actividad</h4>
                                            <strong>`+formatoEnteros((element.details.duration.duration)/60)+`</strong> Hora(s) aproximadamente
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="tooltip_styled tooltip-effect-4">
                                        <span class="tooltip-item"><i class="icon_set_1_icon-41"></i></span>
                                        <div class="tooltip-content">
                                            <h4>Ubicación de recogida</h4> `
                                            if(element.details.address.shortAddress){
                                                lista += `
                                                   `+element.details.address.shortAddress+` <br>
                                                    <a href="https://www.google.com/maps?q=`+element.details.address.latitude+`,`+element.details.address.longitude+`" target="_blank" style="writing-mode: horizontal-tb; display: inline; line-height: normal; color: inherit; ">Ver ubicación en el mapa</a>

                                                `
                                            }else{
                                                lista += `No disponible por el momento`
                                            }
                                            lista += `
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="tooltip_styled tooltip-effect-4">
                                        <span class="tooltip-item"><i class="icon_set_1_icon-97"></i></span>
                                        <div class="tooltip-content">
                                            <h4>Idioma de los guías</h4> 
                                            `+obtenerIdiomas(element.details.guideLanguages)+`
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            </div>
                            
                            <br>
                        </div>
                    </div>
                    <div class="col-lg-2 col-md-2" style="position: relative;">
                        <a href="#" onclick="eliminarItem('act_`+index+`','`+removerPuntos(element.itemId)+`',0); return false;" style="position: absolute; top: 10px; right: 10px; cursor: pointer;" id="basureroAct`+index+`">
                               <i class="icon-trash" style="font-size: 24px;"></i>
                        </a>
                        <div class="price_list">
                            <div><sup>$</sup>`+precioItem.toFixed(2)+`
                                <small>*Por actividad</small>
                                <small>
                                    <a href="#" onclick="irMasActividades(`+element.details.destinationId+`); return false;" style="display:flex; align-items:center; text-align:center; font-size: 13px; color: red;" id="sugerenciaAct`+index+`">
                                        Ver mas actividades de este destino
                                    </a>
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="formularioActividades`+index+`" style="display: none">
                    <div class="row mb-3" style="margin-left: 20px; margin-right: 20px;" id="booking`+removerPuntos(element.itemId)+`">
                    </div>
                    <div class="row" style="margin-left: 20px; margin-right: 20px;" id="pasajeros`+removerPuntos(element.itemId)+`">
                    </div>
                </div>
            </div>`
            precioTotalActividades = precioTotalActividades + precioItem
    });
    actualizarPrecioActividades(precioTotalActividades)
    $("#listaActividaes").html(lista)
}



function irMasActividades(id) {
    var destinoString = JSON.stringify(id)
    var destinoEncode = encodeURIComponent(destinoString)
    var url = window.location.origin +  "/listaActividades?idDestino=" + encodeURIComponent(destinoEncode);
    window.location.href = url;
}






function armarTranfersCarrito(datos){
    let lista =""
    let precioTotalTranfers = 0
    datos.forEach((element,index) => {
        lista += `
                <div class="strip_all_tour_list wow fadeIn" data-wow-delay="0.1s" id="transf_`+index+`">
                    <div class="row">
                        <div class="col-lg-4 col-md-4 position-relative">
                            <div class="ribbon_3 popular"><span>`+element.vehiculo.type+`</span>
                            </div>
                            <div class="img_list" style="display: flex; justify-content: center; align-items: center; width: 100%;">
                                <img src="`+element.vehiculo.image+`" alt="Image" style="max-width: 100%; object-fit: contain; left:0;">
                            </div>
                        </div>
                        <div class="col-lg-6 col-md-6" style="overflow-y: auto; max-height: max-content;">
                            <div class="tour_list_desc">
                                <div class="rating">
                                    <small class="voted" style="font-size:15px;">TRANSFER</small>
                                </div>
                                <h3>`+element.vehiculo.label+`</h3>
                                <p>Traslado desde `+element.transfer.fromZoneName+` hacia `+element.transfer.toZoneName+`</p>
                                <div class="row">
                                    <div class="col-6">
                                        <div class="row">
                                            <div class="col-12">
                                                <span style="font-size: 12px;"><strong>Fecha:</strong></span> 
                                                <span style="font-size: 12px; margin-left:10px;">`+element.date+`</span>
                                            </div>
                                            <div class="col-12">
                                                <span style="font-size: 12px;"><strong>Hora:</strong></span> 
                                                <span style="font-size: 12px; margin-left:10px;">`+element.time+`</span>
                                            </div>
                                            <div class="col-12">
                                                <span style="font-size: 12px;"><strong>Pasajeros:</strong></span> 
                                                <span style="font-size: 12px; margin-left:10px;">`+element.rate.categories[0].quantity+`</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="col-12">
                                            <span><i class="mdi mdi-seatbelt" style="font-size:20px; color:#99c21c;"></i></span>
                                            <span style="margin-left:10px; font-size:12px;">`+element.vehiculo.places+` Asientos</span>
                                        </div> 
                                        <div class="col-12">
                                            <span><i class="mdi mdi-bag-checked" style="font-size:20px; color:#99c21c;"></i></span>
                                            <span style="margin-left:10px; font-size:12px;">`+element.vehiculo.large_suitcase+` Equipajes facturado</span>
                                        </div>
                                        <div class="col-12">
                                            <span><i class="mdi mdi-bag-carry-on" style="font-size:20px; color:#99c21c;"></i></span>
                                            <span style="margin-left:10px; font-size:12px;">`+element.vehiculo.hand_suitcase+` Equipajes de mano</span>
                                        </div>
                                    </div>
                                </div>
                                <br>
                                <div class="row text-success" style="text-align: center;">
                                    <span style="font-size:12px; class="text-success">Cancelación gratuita hasta `+element.vehiculo.cancellation+` horas antes del inicio del servicio.</span>
                                </div>
                                <br>
                            </div>
                        </div>
                        <div class="col-lg-2 col-md-2" style="position: relative;">
                            <a href="#" onclick="eliminarItem('transf_`+index+`','`+removerPuntos(element.itemId)+`',0); return false;" style="position: absolute; top: 10px; right: 10px; cursor: pointer;" id="basureroTranf`+index+`">
                                <i class="icon-trash" style="font-size: 24px;"></i>
                            </a>
                            <div class="price_list">
                                <div>
                                    <sup>$</sup>`+(element.vehiculo.prices.USD).toFixed(2)+`
                                    <small>*Por vehículo</small>
                                    <small>
                                        <a href="#" onclick="irMasTraslado(
                                            `+parseInt(element.transfer.cityId)+`,
                                            '`+element.transfer.toZone+`',
                                            '`+element.transfer.toZoneName+`',
                                            '`+element.date+`',
                                            '`+element.time+`',
                                            '`+element.transfer.fromZone+`',
                                            '`+element.transfer.fromZoneName+`',
                                            '`+element.rate.categories[0].quantity+`',
                                            ); return false;" style="display:flex; align-items:center; text-align:center; font-size: 13px; color: red;" id="sugerenciaAct`+index+`">
                                            Ver mas traslados en este destino
                                        </a>
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="formularioTransfers`+index+`" style="display: none">
                        <div class="row mb-3" style="margin-left: 20px; margin-right: 20px;" id="booking`+removerPuntos(element.itemId)+`">
                        </div>
                        <div class="row" style="margin-left: 20px; margin-right: 20px;" id="pasajeros`+removerPuntos(element.itemId)+`">
                        </div>
                    </div>
                </div>
                `
                precioTotalTranfers = precioTotalTranfers + element.vehiculo.prices.USD
    });
    actualizarPrecioTranfers(precioTotalTranfers)
    $("#listaTransfers").html(lista)


}




function irMasTraslado(ciudad,idDestino,destino,date,time,idOrigen,origen,personas){
    let datos ={
        ciudad: ciudad,
        origen : idOrigen,
        origenName: origen,
        destino : idDestino,
        destinoName: destino,
        fecha: date,
        hora: time,
        personas : personas
    }
    var datosString = JSON.stringify(datos)
    var datosEncode = encodeURIComponent(datosString)
    var url = window.location.origin + "/listaTraslados?datos=" + datosEncode
    window.location.href = url
}




function eliminarItem(idContenedor, itemId, tipo){
    if(tipo == 0){
        eliminarCivitatis(idContenedor, itemId)
    }
    else if(tipo == 1){
        eliminarHotel(idContenedor, itemId)
    }

}






function eliminarCivitatis(idContenedor, itemId){
    const carritoId = localStorage.getItem("carritoCivitatis")
    const id = revertirDobleGuionBajo(itemId)
    if(carritoId && id){
        abrirSpinner("Eliminando item del carrito...")
        Eliminar_API('/api/civitatis/items/'+carritoId+'/'+encodeURIComponent(id), datos => {
            if (datos.estado) {
                const contenedor = document.getElementById(idContenedor);
                contenedor.remove();  
                datosCivitatis = datosCivitatis.filter(item => item.itemId !== id); 
                if(!datosCivitatis || datosCivitatis.length<=0){
                    localStorage.removeItem("carritoCivitatis")
                    actualizarNumero(0,0)
                } 
                verificarCarritoCivitatis(datosCivitatis) 
                cerrarSpinner()      
            } else {
                cerrarSpinner()
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: datos.error
                })
            }
        })

    }
    else{
        console.log("Variables indefinidas: ")
        console.log(carritoId+' '+ itemId)
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


