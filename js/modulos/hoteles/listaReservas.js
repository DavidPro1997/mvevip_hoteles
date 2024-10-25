function iniciarListaReservas(){
    establecerFechaDesde()
}



function buscarReservas(){
    const fechaDesde = document.getElementById("fechaDesde").value
    const fechaHasta = document.getElementById("fechaHasta").value
    Obtener_API_Vuelos(null, '/api/hotelbeds/booking/reservas?from='+fechaDesde+'&to='+fechaHasta, datos => {
        if (datos.estado) {
            armarReservas(datos.consulta.bookings.bookings)
        }
        else{
            mensajeUsuario("error","Ooops...",datos.error)
        }
    })
}


function armarReservas(reservas){
    if(reservas.lenght > 0){
        const lista = "<h4>No hay <span>reservas</span> que coincidan con tu <span>busqueda</span>.</h4>"
        $("#listaReservasHoteles").html(lista)
    }else{
        contruirItemsHoteles(reservas)
    }
    
}



function contruirItemsHoteles(reservas){
    $("#listaReservasHoteles").html("")
    let lista = ""
    reservas.forEach((element,index) => {
        lista = ""
        lista += `
            <div class="strip_all_tour_list wow fadeIn" data-wow-delay="0.`+index+`s" id="hotel_`+index+`">
                <div class="row">
                    <div class="col-lg-4 col-md-4 position-relative">`
                        if(element.status == "CONFIRMED"){
                            lista += `<div class="ribbon_3"><span>CONFIRMADA</span></div>`
                        }else if(element.status == "CANCELLED"){
                            lista += `<div class="ribbon_3 popular"><span>CANCELADA</span></div>`
                        }
                        lista += `
                        <div class="img_list" style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%">
                            <img src="https://visionglobal.com.mx/wp-content/uploads/2015/08/HOTELES.COM-MUESTRA-SU-NUEVA-CAMPA%C3%91A1.jpg" alt="Image" style="max-width: 100%; object-fit: cover; left:0;">
                        </div>
                    </div>
                    <div class="col-lg-6 col-md-6" style="position: relative;">
                        <div class="tour_list_desc">
                            <div class="rating">
                                <small class="voted" style="font-size:15px;">Ref: `+element.reference+`</small>
                            </div>
                            <h3><strong>`+element.hotel.destinationCode+` - `+element.hotel.name+`</strong></h3>
                            
                            <div clas="row" style="display: flex;">
                                <div class="col-1">
                                    <i class="icon-user" style="font-size:15px; color:#99c21c;"></i>
                                </div>
                                <div class="col-11">
                                    <span style="font-size: 12px;"><strong>Viajero:</strong></span> 
                                    <span style="font-size: 12px;">`+element.holder.name+` `+element.holder.surname+`</span>
                                </div>
                            </div>
                            <div class="row" style="display: flex;">
                                <div class="col-1">
                                    <i class="icon-calendar" style="font-size:13px; color:#99c21c;"></i>
                                </div>
                                <div class="col-11">
                                    <span style="font-size: 12px;"><strong>Creación:</strong></span> 
                                    <span style="font-size: 12px;">`+element.creationDate+`</span>
                                </div>
                            </div>
                            <div class="row" style="display: flex;">
                                <div class="col-1">
                                    <i class="icon-login" style="font-size:13px; color:#99c21c;"></i>
                                </div>
                                <div class="col-11">
                                    <span style="font-size: 12px;"><strong>Check-in:</strong></span> 
                                    <span style="font-size: 12px;">`+element.hotel.checkIn+`</span>
                                </div>
                            </div>
                            <div class="row" style="display: flex;">
                                <div class="col-1">
                                    <i class="icon-logout" style="font-size:13px; color:#99c21c;"></i>
                                </div>
                                <div class="col-11">
                                    <span style="font-size: 12px;"><strong>Check-out:</strong></span> 
                                    <span style="font-size: 12px;">`+element.hotel.checkOut+`</span>
                                </div>
                            </div> 
                            `+sacarHabitaciones(element.hotel.rooms)+`
                        </div>
                    </div>
                    <div class="col-lg-2 col-md-2" style="position: relative;">
                        <div class="price_list">
                            <div>
                                <sup>$</sup>`+(parseFloat(element.totalNet)).toFixed(2)+`
                                <small>*Pendiente: $`+(parseFloat(element.pendingAmount)).toFixed(2)+`</small>`
                                if(element.status == "CONFIRMED"){
                                    lista += `
                                    <p>
                                        <a href="#" onclick="cancelarReserva('`+element.reference+`'); return false;" style="background-color:#e74c3c;" class="btn_1">Cancelar</a>
									</p>
                                    ` 
                                }
                                lista += `
                                
                            </div>
                        </div>
                    </div>
                </div>                
            </div>
        `
        $("#listaReservasHoteles").append(lista)
    });
    
}



function sacarHabitaciones(habitaciones){
    let lista = ""
    habitaciones.forEach(element => {
        lista += `
            <div class="row" style="display: flex;">
                <div class="col-1">
                    <i class="icon-drive" style="font-size:13px; color:#99c21c;"></i>
                </div>
                <div class="col-11">
                    <span style="font-size: 12px;"><strong>`+element.rates[0].rooms+` Habitación(es) `+element.code+`:</strong></span> 
                    <span style="font-size: 12px;"> para `+element.paxes.length+` person(as) con `+element.rates[0].boardCode+`</span>
                </div>
            </div> 
        `
    });
    return lista
}




function cancelarReserva(id){
    abrirSpinner("Cancelando su reserva, por favor espere...")
    Eliminar_API('/api/hotelbeds/booking/reservas/'+id, datos => {
        if (datos.estado) {
            buscarReservas()
            cerrarSpinner()
        } else {
            cerrarSpinner()
            mensajeUsuario("error","Ooops...",datos.error)            
        }
    })
}




function construirHabitaciones2(habitaciones,codigoHotel,nombreHotel, ocupantes, ayudanteIndice){
    let lista = ""
    habitaciones.forEach(element => {
        let datos =   dividirPorTipo(element.rates,element.name, nombreHotel, ocupantes)
        datos.forEach(data => {
            lista  += `
            <hr style="margin:0 0 10px 0; height: 2px;">
            <h7 style="color: blue; margin-left:15px;"><strong>`+data.habitacion.toUpperCase()+`</strong></h7>
            <br><br>
            <div class="row">`
                data.regimen.forEach((regimen, indice) => {
                    if(indice > 0){
                        lista += `<hr style="margin:0 0 10px 0;">`
                    }
                    lista +=`
                    <div class="col-2 d-flex align-items-center">
                        <small style="margin-left:15px;">`+regimen.boardName+`</small>
                    </div>`
                    regimen.valores.forEach((valores,index) => {
                        if(index > 0){
                            lista += `<hr style="margin:0 0 10px 0;">`
                        }
                        lista += `
                            <div class="col-7 justify-content-center" style="display: flex; font-size:12px; align-items: center;" >
                                `+cancelacion(valores)+`
                            </div>
                            <div class="col-3 justify-content-center" style="display: flex; flex-direction: column; align-items: center;">
                                <span style="font-size: 14px"><strong>$`+valores.net+` USD</strong></span>
                                <a href="" class="dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="display: none;">Detalles de precio</a>
                                <div class="dropdown-menu p-3 text-muted" style="width: 700px;" style="display: none;">
                                </div>
                            </div>
                        `
                    }); 
                });
                lista += `
            </div>
            `
            $("#rooms_"+codigoHotel+"_"+data.id+"_"+ayudanteIndice).append(lista)
            lista = ""
        });
    });

}






function establecerFechaDesde(){
    flatpickr("#fechaDesde", {
        dateFormat: "Y-m-d",
        disableMobile: true // Opcional: evita que el selector se convierta en un selector móvil
    }) 
}

function establecerFechaHasta(){
    const fechaSalida = document.getElementById("fechaDesde").value
    flatpickr("#fechaHasta", {
        minDate: fechaSalida, 
        dateFormat: "Y-m-d",
        disableMobile: true,
        defaultDate: fechaSalida,
        onReady: function(selectedDates, dateStr, instance) {
            instance.open(); 
    }
    });
}
