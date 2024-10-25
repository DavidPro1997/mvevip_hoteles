
// function reservarHoteles(){
//     Enviar_API_Vuelos(JSON.stringify(arrayReservaHoteles),'/api/hotelbeds/booking/confirmacion', datos => {
//         if (datos.estado){
//             cerrarModal()
//             exitoReserva()
//         }else{
//             cerrarModal()
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Oops...',
//                 text: datos.error,
//                 confirmButtonText: 'Entendido'
//             })                        
//         }
//     })
// }



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



async function reservarTodo(){
    abrirSpinner("Realizando su reserva, por favor espere...")
    const estado = await reservarHotelesFinal(arrayReservaHoteles)
    if(estado){
        mensajeUsuario('success', 'Listo',"Se ha reservado los hoteles, verifica tus reservas en el modulo: Hoteles -> Mis Reservas")
        avanzarFinal()
        localStorage.removeItem("carritoHoteles")
        verificarCarritosIndex()
    }
    else{
        mensajeUsuario('info', 'Información',"Algunos items no se pudieron reservar, intentalo nuevamente. Si el problema persiste intenta quitar el item y añadirlo nuevamente.")
    }
}


async function reservarHotelesFinal(hoteles){
    let aux = true

    const promesas = hoteles.map(async (element,index) => {
        return new Promise((resolve, reject) => {
            Enviar_API_Vuelos(JSON.stringify(element),'/api/hotelbeds/booking/confirmacion', datos => {
                if (datos.estado){
                    console.log("Se reservó "+(index+1)+" hotel")
                    eliminarHotelReservado("hotel_"+index,index)
                    resolve(); // Resuelve la promesa cuando la respuesta es exitosa
                }else{
                    aux = false
                    cerrarSpinner()
                    mensajeUsuario('error', 'Ooops...',"El hotel "+index+" de "+hoteles.length+ " no se pudo reservar")
                    reject(new Error(datos.error)); // Rechaza la promesa en caso de error
                }
            })
        });
    });

    try {
        // Espera a que todas las promesas se resuelvan
        await Promise.all(promesas);
        return aux; // Devuelve el carrito de hoteles completo
    } catch (error) {
        console.error("Error al confirmar tarifas:", error);
        return false; // Devuelve false en caso de error
    }



    // hoteles.forEach((element,index) => {
    //     Enviar_API_Vuelos(JSON.stringify(element),'/api/hotelbeds/booking/confirmacion', datos => {
    //         if (datos.estado){
    //             console.log("Se reservó "+(index+1)+" de "+hoteles.length)
    //             eliminarHotelReservado("hotel_"+index,index)
    //         }else{
    //             aux = false
    //             cerrarSpinner()
    //             mensajeUsuario('error', 'Ooops...',"El hotel "+index+" de "+hoteles.length+ " no se pudo reservar")
    //         }
    //     })
    // });
    // return aux
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
    const fechaActual = new Date(); 
    const fecha = fechaActual.toISOString().split('T')[0]; 
    const hora = fechaActual.toTimeString().split(' ')[0]; 
    const total = precioTotalCarrito.actividades + precioTotalCarrito.tranfer + precioTotalCarrito.hoteles
    let lista = ""
    lista = `
                <div class="form_title">
                    <h3><strong><i class="icon-ok"></i></strong>¡Gracias!</h3>
                    <p>
                        ¡Reserva completada con éxito!
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
                        Información de la factura de su reserva
                    </p>
                </div>
                <div class="step">
                    <table class="table table-striped confirm">
                        <tbody>
                            <tr>
                                <td>
                                    <strong>Nombre</strong>
                                </td>
                                <td>`
                                    if(arrayReservaHoteles.length>0){
                                        lista +=  arrayReservaHoteles[0].holder.name+` `+arrayReservaHoteles[0].holder.surname
                                    }else{
                                        lista += datosReservaCivitatis.customer.firstName+` `+datosReservaCivitatis.customer.lastName
                                    }
                                    lista += `
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Día de la reserva</strong>
                                </td>
                                <td>
                                    `+fecha+`</td>
                            </tr>
                            <tr>
                                <td><strong>Hora de la reserva</strong>
                                </td>
                                <td>
                                    `+hora+`
                                    <br>
                                </td>
                            </tr>
                            <tr>
                                <td><strong>Costo</strong>
                                </td>
                                <td>$`+total.toFixed(2)+` USD</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
    `
    $("#agradecimiento").html(lista)

}


function goHome(){
    mensajeUsuario('success', 'Bien', 'Todo salio bien, gracias por reservan con nosotros')
    setTimeout(function(){
        const url = window.location.origin + "/home"
        window.location.href = url; 
    },1000)
     
}