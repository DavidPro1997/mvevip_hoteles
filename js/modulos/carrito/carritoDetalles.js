function editarHeaderDetalles(){
    lista = ""
    lista = `
        <h1>Ingresa los datos</h1>
        <div class="bs-wizard row">
            <div class="col-3 bs-wizard-step complete">
                <div class="text-center bs-wizard-stepnum">Tu carrito</div>
                <div class="progress">
                    <div class="progress-bar"></div>
                </div>
                <div class="bs-wizard-dot"></div>
                
            </div>

            <div class="col-3 bs-wizard-step active">
                <div class="text-center bs-wizard-stepnum">Tus detalles</div>
                <div class="progress">
                    <div class="progress-bar"></div>
                </div>
                <div class="bs-wizard-dot"></div>
            </div>

            <div class="col-3 bs-wizard-step disabled">
                <div class="text-center bs-wizard-stepnum">Resumen</div>
                <div class="progress">
                    <div class="progress-bar"></div>
                </div>
                <div class="bs-wizard-dot"></div> 
            </div>

            <div class="col-3 bs-wizard-step disabled">
                <div class="text-center bs-wizard-stepnum">¡Finalizado!</div>
                <div class="progress">
                    <div class="progress-bar"></div>
                </div>
                <div class="bs-wizard-dot"></div> 
            </div>
        </div>
        <!-- End bs-wizard -->
        <div class="animated fadeInDown" style="position: absolute; bottom: 0; left: 20px; padding: 20px; color: white;">
            <button class="btn_1 green" style="background-color: #99c21c;" onclick="irCarrito()">
                <i class="icon-right" style="font-size: 20px;"></i>
                Regresar
            </button>	
        </div>
        <div class="animated fadeInDown" style="position: absolute; bottom: 0; right: 20px; padding: 20px; color: white;">
            <button class="btn_1 green" style="background-color: #99c21c;" onclick="validarReserva()">
                Continuar
                <i class="icon-left" style="font-size: 20px;"></i>
            </button>	
        </div>
    `
    $("#estiloHeader").html(lista)
}




var datosReservaCivitatis = {customer: "", items: ""}
function anadirFormularioCivitatis(){
    const carritoId = localStorage.getItem("carritoCivitatis")
    if(carritoId && carritoId.length>0){
        Obtener_API_Vuelos(null, '/api/civitatis/checkout/'+carritoId, datos => {
            if (datos.estado) {
                if(datos.consulta.items.length == datosCivitatis.length){
                    datosReservaCivitatis.customer = datos.consulta.customer
                    datosReservaCivitatis.items = datos.consulta.items
                    construirDatosFactura(datos.consulta.customer)
                    construirDatosPasajeros(datos.consulta.items)
                    cargadoCivitatis = true 
                    cerrarModal()
                }
                else{
                    console.log("aun no se actualiza")
                    setTimeout(function(){
                        anadirFormularioCivitatis()
                    },3000)
                }
                
            }
            else{
                cargadoCivitatis = true 
                cerrarModal()
            }
        })
    }
    else{
        setTimeout(function() {
            cargadoCivitatis = true 
            cerrarModal()

        }, 1000);
        
    }
}




function anadirFormularioHoteles(){
    const carritoHoteles = JSON.parse(localStorage.getItem("carritoHoteles"))
    if(carritoHoteles && carritoHoteles.length>0){
        carritoHoteles.forEach((element,index) => {
            $("#basureroHotel"+index).hide()
            element.ocupantes.forEach((element, auxIndex) => {
                $("#id_"+index+"_"+auxIndex).show()
            });
        });
    }
    cargadoHotel = true
    cerrarModal()
}


function quitarDetallesHoteles(){
    const carritoHoteles = JSON.parse(localStorage.getItem("carritoHoteles"))
    if(carritoHoteles && carritoHoteles.length>0){
        carritoHoteles.forEach((element,index) => {
            $("#basureroHotel"+index).show()
            element.ocupantes.forEach((element, auxIndex) => {
                $("#id_"+index+"_"+auxIndex).hide()
            });
        });
    }
}



function editarHeaderCarrito(){
    lista = ""
    lista = `
        <h1>Revisa tu pedido</h1>
        <div class="bs-wizard row">
            <div class="col-3 bs-wizard-step active">
                <div class="text-center bs-wizard-stepnum">Tu carrito</div>
                <div class="progress">
                    <div class="progress-bar"></div>
                </div>
                <div class="bs-wizard-dot"></div>
                
            </div>

            <div class="col-3 bs-wizard-step disabled">
                <div class="text-center bs-wizard-stepnum">Tus detalles</div>
                <div class="progress">
                    <div class="progress-bar"></div>
                </div>
                <div class="bs-wizard-dot"></div>
            </div>

            <div class="col-3 bs-wizard-step disabled">
                <div class="text-center bs-wizard-stepnum">Resumen</div>
                <div class="progress">
                    <div class="progress-bar"></div>
                </div>
                <div class="bs-wizard-dot"></div> 
            </div>

            <div class="col-3 bs-wizard-step disabled">
                <div class="text-center bs-wizard-stepnum">¡Finalizado!</div>
                <div class="progress">
                    <div class="progress-bar"></div>
                </div>
                <div class="bs-wizard-dot"></div> 
            </div>
        </div>
        <!-- End bs-wizard -->
        <div class="animated fadeInDown" style="position: absolute; bottom: 0; right: 20px; padding: 20px; color: white;">
            <button class="btn_1 green" style="background-color: #99c21c;" onclick="irDetallesCarrito()">
                Continuar
                <i class="icon-left" style="font-size: 20px;"></i>
            </button>	
        </div>
    `
    $("#estiloHeader").html(lista)
}



function traducirPalabra(palabra) {
    const diccionario = {
        "email":"Correo Electrónico",
        "phone": "Teléfono",
        "prefix": "Prefijo",
        "firstName":"Nombre",
        "lastName":"Apellido",
        "Pickup point":"Punto de recogida",
        "Hotel or accommodation name":"Nombre del hotel o alojamiento",
        "Hotel or accommodation address":"Dirección del hotel o alojamiento",
        "City of departure":"Ciudad de salida",
        "Airline and flight number":"Aerolínea y número de vuelo",
        "kid_weight":"Peso del niño",
        "kid_age":"Edad del niño",
        "Only hand bags?":"¿Trae solo bolsos de mano?",
        "Airline and return flight number":"Número de aerolínea y vuelo de regreso"
    };
    return diccionario[palabra] || palabra;
}



function construirDatosFactura(cliente){
    let lista = ""
    lista = `
        <div class="row mb-3">
                <div class="box_style_2 d-none d-sm-block">
                    <span class="tape"></span>
                    <div class="border p-3 mt-4 mt-lg-0 rounded mb-3">
                        <h4 class="header-title mb-3">Datos de Facturación</h4>`
                        Object.entries(cliente).forEach(([key, value]) => {
                            lista += `
                            <div class="mb-3" style="text-align: left;">
                                <label>`+traducirPalabra(key)+`</label>
                                <input type="text" class="form-control" id="id`+traducirPalabra(key)+`" placeholder="Ingrese el `+traducirPalabra(key)+`" required />
                            </div>
                            `
                        });
                        lista += 
                        `
                        <div class="mb-3" style="text-align: left;">
                            <label>Observaciones</label>
                            <input type="text" class="form-control" id="observaciones" placeholder="Ingrese sus observaciones" required />
                        </div>
                    </div>
                </div>
            </div>
    `
    $("#datosFactura").html(lista)

}




function construirDatosPasajeros(items){
    let aux ={book: false, pasajeros: false}
    items.forEach((element, index) => {
        $("#formularioActividades"+index).show()
        $("#formularioTransfers"+index).show()
        $("#basureroAct"+index).hide()
        $("#basureroTranf"+index).hide()
        if(element.details.booking){
            aux.book = true
            armarbooking(element.details.booking, element.id)
        }
        if(element.details.passengers){
            aux.pasajeros = true
            armarPasajeros(element.details.passengers, element.id)
        }
        if(!aux.book && !aux.pasajeros){
            const lista = `<span>No debe llenar ningun formulario</span>`
            $("#booking"+removerPuntos(element.id)).html(lista)
            aux.book = false
            aux.pasajeros = false
        }
    });
}



function armarbooking(booking, id){
    let aux = removerPuntos(id)
    var lista = `
                <br>
                <label style="font-size: 14px;">
                    <strong>Detalles de reserva</strong>
                </label>
                <br>`
    booking.forEach(element => {
        let idLabel = removerPuntos(element.id)
        lista += `
        <div class="col-6 mb-3">
            <label style="font-size: 12px;">`+traducirPalabra(element.labelTranslated)+`</label>
            <input type="`+element.type+`" class="form-control" id="`+idLabel+`" placeholder="`+traducirPalabra(element.labelTranslated)+`"`
            if(element.required){
                lista += ` required />` 
            }
            else{
                lista += ` />`
            }
           lista += `
        </div>
        `
    });
    $("#booking"+aux).html(lista)

}



function armarPasajeros(pasajeros, id){
    let fechas = []
    let aux = removerPuntos(id)
    let contador = 0
    var lista = '<label style="font-size: 14px;"><strong>Detalles Pasajeros</strong></label><br>'
    pasajeros.forEach((element, index) => {
        let idLabel = removerPuntos(element.id)
        if(obtenerTerceraPosicion(idLabel) == contador){
            contador = contador +1 
            lista += `<label style="font-size: 12px;"><strong>Pasajero `+contador+`</strong></label>`
        }
        lista += `
        <div class="col-6 mb-3">
            <label style="font-size: 12px;">`+element.label+`</label>
            <input type="`+element.type+`" class="form-control" style="background-color: white;" id="`+idLabel+`" placeholder="`+element.label+`"`
            if(element.required){
                lista += ` required />` 
            }
            else{
                lista += ` />`
            }
           lista += `
        </div>
        `
        if(element.type == "date"){
            fechas.push(idLabel)
        }
    });
    $("#pasajeros"+aux).html(lista)
    establecerDatePicker(fechas)

}


function establecerDatePicker(fechas){
    fechas.forEach(element => {
            flatpickr("#"+element, {
            dateFormat: "Y-m-d",
            disableMobile: true // Opcional: evita que el selector se convierta en un selector móvil
        }) 
    });
    
}


function obtenerTerceraPosicion(cadena) {
    const partes = cadena.split('-');
    if (partes.length >= 3) {
        return partes[2];
    } else {
        return null; 
    }
}



function validarReserva(){
    abrirSpinner("Validando los datos, por favor espere...")
    const civitatis = validarDatosCivitatis()
    if(validarDatosHoteles() && validarDatosFacturacion() && civitatis.book && civitatis.pasajeros){
        const carritoCivitatis = localStorage.getItem('carritoCivitatis');
        if(carritoCivitatis){
            confirmarTarifaCivitatis(carritoCivitatis)
        }
        else{
            cargadoCivitatis = true
            confirmarResumen()
        }
        confirmarTarifaHoteles()

    }else{
        mensajeUsuario('info', 'Verificación', 'Hay algunos campos vacios, por favor verifica antes de continuar.')
        setTimeout(cerrarSpinner(),500)
    }
    
}


function irCarrito(){
    quitarDetallesHoteles()
    quitarDetallesCivitatis()
    editarHeaderCarrito()
    $("#datosFactura").hide()
}


function quitarDetallesCivitatis(){
    datosCivitatis.forEach((element,index) => {
        $("#formularioActividades"+index).hide()
        $("#formularioTransfers"+index).hide()
        $("#basureroAct"+index).show()
        $("#basureroTranf"+index).show()
    });
}
