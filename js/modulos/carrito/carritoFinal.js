

function editarHeaderFinalizar(){
    lista = ""
    lista = `
        <h1>¡Gracias por preferirnos!</h1>
        <div class="bs-wizard row">
            <div class="col-3 bs-wizard-step complete">
                <div class="text-center bs-wizard-stepnum">Tu carrito</div>
                <div class="progress">
                    <div class="progress-bar"></div>
                </div>
                <div class="bs-wizard-dot"></div>
                
            </div>

            <div class="col-3 bs-wizard-step complete">
                <div class="text-center bs-wizard-stepnum">Tus detalles</div>
                <div class="progress">
                    <div class="progress-bar"></div>
                </div>
                <div class="bs-wizard-dot"></div>
            </div>

            <div class="col-3 bs-wizard-step complete">
                <div class="text-center bs-wizard-stepnum">Resumen</div>
                <div class="progress">
                    <div class="progress-bar"></div>
                </div>
                <div class="bs-wizard-dot"></div> 
            </div>

            <div class="col-3 bs-wizard-step active">
                <div class="text-center bs-wizard-stepnum">¡Finalizado!</div>
                <div class="progress">
                    <div class="progress-bar"></div>
                </div>
                <div class="bs-wizard-dot"></div> 
            </div>
        </div>
        <div class="animated fadeInDown" style="position: absolute; bottom: 0; right: 20px; padding: 20px; color: white;">
            <button class="btn_1 green" style="background-color: #99c21c;" onclick="goHome()">
                FINALIZAR
            </button>	
        </div>
    `
    $("#estiloHeader").html(lista)
}





function habilitarInputs() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.disabled = false
        input.style.backgroundColor = "white"
    });
}



function irDetalle(){
    editarHeaderDetalles()
    habilitarInputs()
}



function reservarTodo(){
    abrirSpinner("Realizando su reserva, por favor espere...")
    reservarHotelesFinal(arrayReservaHoteles)
}




async function reservarHotelesFinal(hoteles){
    for (const [index, item] of hoteles.entries()) {
        await llamarReservarApi(item, index);
    }
    console.log("Todas las llamadas a la API se completaron.");
    if(resumenGlobal.length>0){
        mensajeUsuario('success', 'Listo',"Se ha reservado "+resumenGlobal.length+" hotel(es), verifica tus reservas en el modulo: Hoteles -> Mis Reservas")
        localStorage.removeItem("carritoHoteles")
        verificarCarritosIndex()
        avanzarFinal()
        cerrarSpinner()
    }
    else{
        mensajeUsuario('info', 'Información',"Algunos items no se pudieron reservar, intentalo nuevamente. Si el problema persiste intenta quitar el item y añadirlo nuevamente.")
        cerrarSpinner()
    }
    return true
}




var resumenGlobal = []
function llamarReservarApi(element, index){
    return new Promise((resolve) => {
        Enviar_API_Vuelos(JSON.stringify(element),'/api/hotelbeds/booking/confirmacion', datos => {
            if (datos.estado){
                resumenGlobal.push(datos.consulta.booking)
                console.log("Se reservó el hotel "+(index+1))
                // eliminarHotelReservado("hotel_"+index,index)
            }else{
                console.log("No se reservó el hotel "+(index+1))
            }
            resolve(); 
        })
    });
}



function eliminarHotelReservado(idContenedor, itemId){
    arrayReservaHoteles.splice(itemId,1)
    const contenedor = document.getElementById(idContenedor);
    contenedor.remove(); 
}



function avanzarFinal(){
    scrollTop()
    editarHeaderFinalizar()
    editarPropiedades()
}



function editarPropiedades(){
    llenarAgradecimiento()
    $("#listaActividaes").hide()
    $("#costosCarrito").hide()
    $("#datosFactura").hide()
    $("#listaTransfers").hide()
    $("#listaHoteles").hide()
    $("#agradecimiento").show()
    $("#graciasLado").show()
    localStorage.removeItem("carritoCivitatis")
    localStorage.removeItem("carritoHoteles")
    localStorage.removeItem("numItems")
}


function llenarAgradecimiento(){
    console.log(resumenGlobal)
    if(resumenGlobal.length>0){
        let lista = ""
        lista = `
                <div class="form_title">
                    <h3><strong><i class="icon-ok"></i></strong>¡Gracias!</h3>
                    <p>
                        ¡Reserva(s) completada(s) con éxito!
                    </p>
                </div>
                <div class="step">
                    <p>
                    Nos complace informarle que su reserva de actividades y alojamiento ha sido procesada correctamente. En breve, recibirá un correo electrónico con todos los detalles de su reserva, incluyendo la información del hotel, las actividades seleccionadas y las fechas correspondientes.
                    Estamos comprometidos en ofrecerle una experiencia excepcional, y nuestro equipo está disponible para ayudarle en cualquier momento. ¡Gracias por confiar en nosotros para planificar su viaje!
                    </p>
                </div>
                <!--End step -->

                <div class="form_title">
                    <h3><strong><i class="icon-tag-1"></i></strong>Resumen de reserva</h3>
                    <p>
                        Información del voucher de su reserva
                    </p>
                </div>`
                resumenGlobal.forEach(element => {
                    lista += `
                        <div class="step">
                            <table class="table table-striped confirm">
                                <tbody>
                                    <tr>
                                        <td>
                                            <strong>Número de Reserva</strong>
                                        </td>
                                        <td>`+element.reference+`</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Nombre reserva</strong>
                                        </td>
                                        <td>`+element.holder.name+` `+element.holder.surname+`</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Nombre hotel</strong>
                                        </td>
                                        <td>`+element.hotel.name+`</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Fecha creación</strong>
                                        </td>
                                        <td>
                                            `+element.creationDate+`</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Check-in</strong>
                                        </td>
                                        <td>
                                            `+element.hotel.checkIn+`</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Check-out</strong>
                                        </td>
                                        <td>
                                            `+element.hotel.checkOut+`</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Estado</strong>
                                        </td>
                                        <td>`+element.status+`</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Costo</strong>
                                        </td>
                                        <td>$`+(parseFloat(element.totalNet)+100).toFixed(2)+` USD</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Detalles</strong></td>
                                        <td><a href="/reservasHoteles?check_in=`+element.hotel.checkIn+`&ckeck_out=`+element.hotel.checkOut+`">Ver detalles aquí</a></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div style="text-align:center;">
                            <button class="btn_1 green" style="background-color: #99c21c;" onclick="descargarInfoReservaUnica('`+element.reference+`')">
                                Descargar voucher
                            </button>
                        </div>
                    `
                });
                
            $("#agradecimiento").html(lista)
    }
}




function goHome(){
    mensajeUsuario('success', 'Bien', 'Todo salio bien, gracias por reservan con nosotros')
    setTimeout(function(){
        const url = window.location.origin + "/home"
        window.location.href = url; 
    },1000)
     
}