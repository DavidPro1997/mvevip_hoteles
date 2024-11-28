function descargarInfoReservaUnica(id){
    abrirSpinner("Descargando su voucher...")
    Obtener_API_Vuelos(null,'/api/hotelbeds/booking/reservas/'+id, datos => {
        if (datos.estado) {
            const voucher = armarArrayVoucher(datos.consulta.booking)
            apiVoucher(voucher)
        } else {
            cerrarSpinner()
            mensajeUsuario("error","Ooops...",datos.error)            
        }
    })
}



function apiVoucher(datos){
    Enviar_API_Vuelos(JSON.stringify(datos), '/api/hotelbeds/booking/voucher', (datos) => {
        if (datos.estado) {
            descargarPDF(datos.base64)
            cerrarSpinner()
            
        } else {
            cerrarSpinner();
            mensajeUsuario('error', 'Ooops...', datos.error);
        }
    });
}


function descargarPDF(base64, nombreArchivo = 'voucher_reserva_hotel.pdf') {
    // Convertir Base64 a un blob
    const blob = base64ToBlob(base64, 'application/pdf');
    
    // Crear un enlace para descargar el archivo
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = nombreArchivo;
    
    // Simular el clic en el enlace
    document.body.appendChild(enlace);
    enlace.click();
    
    // Limpiar el DOM
    document.body.removeChild(enlace);
}

// Función auxiliar para convertir Base64 a Blob
function base64ToBlob(base64, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    
    return new Blob(byteArrays, { type: contentType });
}



function armarArrayVoucher(datos){
    let telefonos = ""
    datos.hotel.phones.forEach(element => {
        telefonos += element.phone_number+" "
    });
    aux = {
        tipo: "voucher_hotel",
        booking_id: datos.reference,
        holder_name: datos.holder.name+" "+datos.holder.surname,
        city: datos.hotel.destinationName,
        hotel_name: datos.hotel.name,
        hotel_address: datos.hotel.address,
        hotel_category: datos.hotel.categoryName,
        hotel_phone: telefonos,
        check_in: datos.hotel.checkIn,
        check_out: datos.hotel.checkOut,
        metodo_pago: datos.hotel.supplier.name,
        vat_numer: datos.hotel.supplier.vatNumber,
        reference: datos.clientReference,
        remark_cliente: datos.remark,
        rooms: []
    }
    datos.hotel.rooms.forEach((cuartos,index) => {
        let edadNinos= ""
        cuartos.paxes.forEach(pasajeros => {
            if(pasajeros.type == "CH"){
                edadNinos += pasajeros.age + " "
            }
        });
        cuartos.rates.forEach(element => {
            const lista = {
                room_number: element.rooms,
                room_name: cuartos.name,
                acomodation: cuartos.typeDescription, //si es habitacion o departamento esta mal
                name_pax: cuartos.paxes[0].name+" "+cuartos.paxes[0].surname,
                adults: element.adults.toString(),
                children: element.children.toString(),
                age_children: edadNinos,
                board_basis: element.boardName,
                rate_comments: element.rateComments,
            }
            aux.rooms.push(lista)
        });
    });
    return aux
}
