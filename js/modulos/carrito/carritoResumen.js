

function editarHeaderResumen(){
    lista = ""
    lista = `
        <h1>Tu resumen</h1>
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

            <div class="col-3 bs-wizard-step active">
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
        <p>Verifica tu pedido por ultima vez</p>
        <!-- End bs-wizard -->
        <div class="animated fadeInDown" style="position: absolute; bottom: 0; left: 20px; padding: 20px; color: white;">
            <button class="btn_1 green" style="background-color: #99c21c;" onclick="irDetalle()">
                <i class="icon-right" style="font-size: 20px;"></i>
                Regresar
            </button>	
        </div>
        <div class="animated fadeInDown" style="position: absolute; bottom: 0; right: 20px; padding: 20px; color: white;">
            <button class="btn_1 green" style="background-color: #99c21c;" onclick="reservarTodo()">
                RESERVAR
                <i class="icon-up" style="font-size: 20px;"></i>
            </button>	
        </div>
    `
    $("#estiloHeader").html(lista)
}





var arrayReservaHoteles = []
function validarDatosHoteles(){
    arrayReservaHoteles = []
    const carritoHoteles = JSON.parse(localStorage.getItem("carritoHoteles"))
    if(carritoHoteles && carritoHoteles.length>0){
        let aux = true
        carritoHoteles.forEach((data,auxIndex) => {
            if(
                document.getElementById("idNombre").value && document.getElementById("idApellido").value && document.getElementById("observaciones").value
            ){
                let arrayReservaHotelesInterno = {
                    holder: {
                        name: document.getElementById("idNombre").value,
                        surname: document.getElementById("idApellido").value
                    },
                    rooms: [],
                    clientReference: "IntegrationAgency",
                    remark: document.getElementById("observaciones").value,
                    tolerance: 2
                }
                data.ocupantes.forEach((element,index) => {
                    let id= armarId(0,element.rooms,element.adults, element.children, element.paxes)
                    let habitacion = {
                        rateKey: element.ratekey,
                        paxes: []
                    }
                    for(let k=0; k<element.rooms;k++){
                        for(let i=0; i<element.adults;i++){
                            if(
                                document.getElementById("nombreAdulto"+(k+1)+(i+1)+"_"+id+"_"+auxIndex).value &&
                                document.getElementById("apellidoAdulto"+(k+1)+(i+1)+"_"+id+"_"+auxIndex).value
                            ){
                                let nuevoPaxes = {
                                    roomId: k+1,
                                    type: "AD",
                                    name: document.getElementById("nombreAdulto"+(k+1)+(i+1)+"_"+id+"_"+auxIndex).value,
                                    surname: document.getElementById("apellidoAdulto"+(k+1)+(i+1)+"_"+id+"_"+auxIndex).value
                                }
                                habitacion.paxes.push(nuevoPaxes)
                            }else{
                                aux=  false
                            }
                            
                        }
                        if(element.children){
                            for(let j=0; j<element.children;j++){
                                if(
                                    document.getElementById("nombreNino"+(k+1)+(j+1)+"_"+id+"_"+auxIndex).value&&
                                    document.getElementById("apellidoNino"+(k+1)+(j+1)+"_"+id+"_"+auxIndex).value&&
                                    parseInt(document.getElementById("edadNino"+(k+1)+(j+1)+"_"+id+"_"+auxIndex).value)
                                ){
                                    let nuevoPaxes = {
                                        roomId: k+1,
                                        type: "CH",
                                        name: document.getElementById("nombreNino"+(k+1)+(j+1)+"_"+id+"_"+auxIndex).value,
                                        surname: document.getElementById("apellidoNino"+(k+1)+(j+1)+"_"+id+"_"+auxIndex).value,
                                        age: parseInt(document.getElementById("edadNino"+(k+1)+(j+1)+"_"+id+"_"+auxIndex).value),
                                    }
                                    habitacion.paxes.push(nuevoPaxes)
                                }else{
                                    aux = false
                                }
                                
                            }
                        }
                    }
                    arrayReservaHotelesInterno.rooms.push(habitacion)
                });
                arrayReservaHoteles.push(arrayReservaHotelesInterno)
            }
            else{
                aux = false
            }
        });
        return aux
    }
    return true
}




function confirmarTarifaHoteles(){
    cargadoHotel = true
    confirmarResumen()
}



function confirmarTarifaCivitatis(carritoId){
    Modificar_API((datosReservaCivitatis),'/api/civitatis/checkout/'+carritoId, datos => {
        if (datos.estado){
            cargadoCivitatis = true
            confirmarResumen()
        }else{
            mensajeUsuario('error', 'Oooops...',  datos.error)
        }
    })
}



function validarDatosFacturacion(){
    let aux = true
    let cliente = datosReservaCivitatis.customer
    if(cliente){
        Object.entries(cliente).forEach(([key, value]) => {
            let valor = document.getElementById("id"+traducirPalabra(key)).value
            cliente[key] = valor
            if(!valor){
                aux = false
            }
        });
    }
    return aux
}




function validarDatosCivitatis(){
    let aux={book:true, pasajeros:true}
    if(datosReservaCivitatis && datosReservaCivitatis.items.length>0){
        datosReservaCivitatis.items.forEach(element => {
            if(element.details.booking){
                aux.book = validarDatosBooking(element.details.booking)
            }
            if(element.details.passengers){
                aux.pasajeros = validarDatosPasajeros(element.details.passengers)
            }
        });
    }
    return aux
}



function validarDatosBooking(reserva){
    let aux = true
    reserva.forEach(element => {
        let id = removerPuntos(element.id)
        element.value = document.getElementById(id).value
        if(!element.value){
            aux = false
        }
    });
    return aux
}


function validarDatosPasajeros(pasajeros){
    let aux = true
    pasajeros.forEach(element => {
        let id = removerPuntos(element.id)
        element.value = document.getElementById(id).value
        if(!element.value){
            aux = false
        }
    });
    return aux
}



function confirmarResumen(){
    if(cargadoCivitatis && cargadoHotel){
        scrollTop()
        editarHeaderResumen()
        bloquearInputs()
        cargadoCivitatis = false
        cargadoHotel = false
        setTimeout(cerrarSpinner,3000)
    }
}


function bloquearInputs() {
    // Selecciona todos los elementos <input> en el DOM
    const inputs = document.querySelectorAll('input');
    
    // Itera sobre todos los <input> y los deshabilita
    inputs.forEach(input => {
        input.disabled = true
        input.style.backgroundColor = "#ddd"
    });
  }
