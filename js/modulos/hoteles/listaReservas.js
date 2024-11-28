function recibirInformacion() {
    const urlParams = new URLSearchParams(window.location.search);
    const check_In = urlParams.get('check_in');
    const check_Out = urlParams.get('ckeck_out');
    if (check_In && check_Out) {
        abrirSpinner("Verificando sus reservas")
        listarReservas(check_In, check_Out)
        document.getElementById("fechaDesde").value = check_In
        document.getElementById("fechaHasta").value = check_Out

    }
}


function iniciarListaReservas(){
    establecerFechaDesde()
}



function buscarReservas(){
    abrirSpinner("Verificando sus reservas")
    const fechaDesde = document.getElementById("fechaDesde").value
    const fechaHasta = document.getElementById("fechaHasta").value
    listarReservas(fechaDesde, fechaHasta)
}




function listarReservas(fecha1, fecha2){
    Obtener_API_Vuelos(null, '/api/hotelbeds/booking/reservas?from='+fecha1+'&to='+fecha2, datos => {
        if (datos.estado) {
            if(datos.consulta.bookings.bookings.length>0){
                armarReservas(datos.consulta.bookings.bookings)
                cerrarSpinner()
            }else{
                mensajeUsuario("info","Ooops...","No hay reservas en las fechas seleccionadas")
                cerrarSpinner()
            }
            
        }
        else{
            mensajeUsuario("error","Ooops...",datos.error)
        }
    })

}


function armarReservas(reservas){
    contruirItemsHoteles(reservas)
}



function contruirItemsHoteles(reservas){
    $("#listaReservasHoteles").html("")
    let lista = ""
    reservas.forEach((element,index) => {
        lista = ""
        lista += `
            <div class="strip_all_tour_list wow fadeIn" data-wow-delay="0.`+index+`s" id="hotel_`+index+`" style="height:100%;">
                <div class="row">
                    <div class="col-lg-4 col-md-4 position-relative" style ="height: 100%;">`
                        if(element.status == "CONFIRMED"){
                            lista += `<div class="ribbon_3"><span>CONFIRMADA</span></div>`
                        }else if(element.status == "CANCELLED"){
                            lista += `<div class="ribbon_3 popular"><span>CANCELADA</span></div>`
                        }
                        lista += `
                        <div class="img_list" style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%">`
                                if(element.hotel.images.length>0){
                                    lista+= `<img src="`+element.hotel.images[0][element.hotel.images[0].length-1]+`" alt="Image" style="max-width: 100%; object-fit: cover; left:0;">`
                                }else{
                                    lista+= `<img src="img/hoteles/mkv.png" alt="Image" style="max-width: 100%; object-fit: cover; left:0;">`
                                }
                                lista +=`
                        </div>
                    </div>
                    <div class="col-lg-6 col-md-6" style="position: relative;">
                        <div class="tour_list_desc" style="overflow-y: auto; margin-bottom: 15px;">
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
                            <div class="row" style="display: flex;">
                                <div class="col-1">
                                    <i class="icon-phone" style="font-size:13px; color:#99c21c;"></i>
                                </div>
                                <div class="col-11">
                                    <span style="font-size: 12px;"><strong>Teléfonos: </strong></span> 
                                    <span style="font-size: 12px;">`
                                    element.hotel.phones.forEach(telefono => {
                                        lista += telefono.phone_number+` `
                                    });
                                    lista += `</span>
                                </div>
                            </div>
                            `+sacarHabitaciones(element.hotel.rooms)+`
                            <div class="row" style="display: flex;">
                                <div class="col-1">
                                    <i class="icon-download-2" style="font-size:13px; color:#99c21c;"></i>
                                </div>
                                <div class="col-11">
                                    <a href="#" onclick="descargarInfoReservaUnica('`+element.reference+`'); return false;">Descargar voucher</a>
                                </div>
                            </div> 
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
    habitaciones.forEach(rooms => {
        rooms.rates.forEach(element => {
            lista += `
            <div class="row" style="display: flex;">
                <div class="col-1">
                    <i class="icon-drive" style="font-size:13px; color:#99c21c;"></i>
                </div>
                <div class="col-11">
                    <span style="font-size: 12px;"><strong>`+element.rooms+` Habitación(es) `+rooms.typeDescription+`:</strong></span> 
                    <span style="font-size: 12px;"> para `+rooms.paxes.length+` person(as) con `+element.description+`</span>
                </div>
            </div> 
        `
        });
        
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
        disableMobile: true 
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
