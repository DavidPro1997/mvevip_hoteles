var ocupantes = []
function recibirInformacion() {
    const urlParams = new URLSearchParams(window.location.search);
    const datosString = urlParams.get('datos');
    if (datosString) {
        const datos = JSON.parse(decodeURIComponent(datosString));
        ocupantes = datos.ocupantes
        verHotel(datos)
    } else {
        console.log('ID de hotel no especificado');
    }
}


var codigoHotelGlobal = ""
var nombreHotelGlobal = ""
function verHotel(info){
    abrirSpinner("Cargando hotel...")
    Obtener_API_Vuelos(null, '/api/hotelbeds/booking/hotel-info/'+info.idHotel, datos => {
        if (datos.estado) {
            codigoHotelGlobal = info.idHotel
            nombreHotelGlobal = datos.consulta.name
            construirHeader(datos.consulta)
            construirImagenes(datos.consulta.images)
            construirDescripcion(datos.consulta.description)
            contruirUbicacion(datos.consulta.location)
            contruirTelefono(datos.consulta.phones)
            construirHabitaciones(info)
            contruirFacilities(datos.consulta.facilities)
            cerrarSpinner()
        }
        else{
            cerrarSpinner()
        }
    })
}


function contruirFacilities(facilidades){
    let lista1 = ""
    let lista = ""
    lista += `
        <h4>Servicios del hotel</h4>
        <ul class="list_ok">`
    facilidades.forEach(element => {
        lista += `<li style="white-space: nowrap;">`+element.name
        lista1  += `<li `
        if(element.ind_yes_or_not){
            lista += ` <p style="color: #99c21c;">(<i class="icon-money-2" style="font-size:18px;"></i> Se debe pagar un monto extra en el hotel por este servicio.)</p>`
            lista1  += `style="color: #99c21c;"`
        }
        lista1  += `><i class="`+obtenerEmogi(element.facility_group_code)+`"></i>`+palabraMasLarga(element.name)+`</li>`
        lista += `</li>`
    });
    lista += `</ul>`
    $("#listaFacilities").html(lista1)
    $("#serviciosHotel").html(lista)
}


function palabraMasLarga(facility) {
    const palabras = facility.split(" ");
    let masLarga = palabras.reduce((larga, actual) => {
        return actual.length > larga.length ? actual : larga;
    }, "");
    return masLarga;
}



function scrollHabitaciones(){
    const elemento = document.getElementById("listaTipoHabitacion");
    elemento.scrollIntoView({
        behavior: "smooth", // Desplazamiento suave
        block: "start"      // Coloca el elemento en la parte superior del contenedor
    });
}



function obtenerEmogi(codigo){
    //casa
    if(codigo == "10"){
        return `icon_set_1_icon-23`
    }
    //cocina
    else if(codigo == "10"){
        return `icon_set_1_icon-58`
    }
    //hostal
    else if(codigo == "20"){
        return `icon_set_1_icon-6`
    }
    //prevencion
    else if(codigo == "70"){
        return `icon_set_1_icon-100`
    }
    //snacks
    else if(codigo == "80"){
        return `icon_set_3_restaurant-1`
    }
    //entretenimiento
    else if(codigo == "40"){
        return `icon_set_1_icon-32`
    }
    //cama extra
    else if(codigo == "61"){
        return `icon_set_2_icon-112`
    }
    //vip
    else if(codigo == "10"){
        return `icon_set_1_icon-15`
    }
    //salud
    else if(codigo == "91"){
        return `icon_set_1_icon-87`
    }
    //añadir extra
    else if(codigo == "60"){
        return `icon_set_1_icon-11`
    }
    //tv, multimedia, piscina
    else if(codigo == "73"){
        return `icon_set_2_icon-109`
    }
    //nudista, agua
    else if(codigo == "85"){
        return `icon_set_2_icon-110`
    }
    //aolo adultos
    else if(codigo == "85"){
        return `icon_set_1_icon-82`
    }
    //smook
    else if(codigo == "71"){
        return `icon_set_1_icon-76`
    }
    //tomar sol
    else if(codigo == "74"){
        return `icon_set_2_icon-108`
    }
    //negocios
    else if(codigo == "72"){
        return `icon_set_1_icon-95`
    }
    //medio ambiente
    else if(codigo == "75"){
        return `icon_set_1_icon-24`
    }
    //documentos
    else if(codigo == "76" || codigo == "77" || codigo == "78"){
        return `icon_set_1_icon-92`
    }
    //Check
    else{
        return `icon_set_1_icon-18`
    }
}




function contruirUbicacion(location){
    let lista = `
        <ul style="list-style: none;">
            <li><i class="icon_set_1_icon-41" style="font-size:35px;"></i> País: `+location.country.name+`</li>
            <li><i class="icon_set_1_icon-23" style="font-size:35px;"></i> Ciudad: `+location.city+`</li>
            <li><i class="icon_set_1_icon-1" style="font-size:35px;"></i> Estado: `+location.state.name+`</li>
            <li><i class="icon_set_1_icon-37" style="font-size:35px;"></i> Dirección: `+location.address+`</li>
            <li><i class="icon_set_1_icon-63" style="font-size:35px;"></i> <a href="https://www.google.com/maps?q=${location.latitude},${location.longitude}" target="_blank"> Ver ubicación en el mapa</a></li>
        </ul>
    `
    $("#ubicacion_hotel").html(lista)
}

function contruirTelefono(telefono){
    let lista = `
        <ul style="list-style: none;">`
            let aux = 89 
            telefono.forEach(element => {
                lista += `<li><i class="icon_set_1_icon-`+aux+`" style="font-size:35px;"></i>`+element.phone_number+`</li>`
                aux = aux + 1
            });
            lista +=`
        </ul>
    `
    $("#telefono_hotel").html(lista)
}






function construirImagenes(fotos){
    let lista = ""
    if(fotos){
        aux= true
        let globalIndex = 0
        lista +=`
        <div id="carouselExampleIndicators" class="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="5000">
            <ol class="carousel-indicators">`
                fotos.forEach((images,indice) => {
                        if(globalIndex == 0){
                            lista += `<li data-bs-target="#carouselExampleIndicators" data-bs-slide-to="`+globalIndex+`" class="active"></li>`
                        }
                        else{
                            lista += `<li data-bs-target="#carouselExampleIndicators" data-bs-slide-to="`+globalIndex+`"></li>`
                        }
                        globalIndex ++
                });
                lista += 
                `
            </ol>
            <div class="carousel-inner"  role="listbox">`
            globalIndex = 0
                fotos.forEach((images,indice) => {
                        if(globalIndex == 0){
                            
                            lista += `
                            <div class="carousel-item active">
                                <img class="d-block img-fluid" src="`+images[images.length-1]+`" alt="Cargando foto..." style="width: 100%; height: 400px; object-fit: cover;">
                            </div>
                            `
                        }
                        else{
                            lista += `
                            <div class="carousel-item">
                                <img class="d-block img-fluid" src="`+images[images.length-1]+`" alt="Cargando foto..." style="width: 100%; height: 400px; object-fit: cover;">
                            </div>
                            `
                        }  
                        globalIndex ++                      
                });
                lista += 
                `
            </div>
            <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </a>
            <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </a>
        </div>
            `
    }
    $("#imagenes_hotel").html(lista)
}



function construirHeader(datos){
    let lista = ""
    lista += `
            <section class="parallax-window" data-parallax="scroll" data-image-src="img/single_tour_bg_1.jpg" data-natural-width="1400" data-natural-height="470" style="background-image: url('`+datos.images[0][datos.images[0].length-1]+`'); background-position: center; background-repeat: no-repeat; background-size: cover;">
                <div class="parallax-content-2">
                    <div class="container">
                        <div class="row">
                            <div class="col-md-3">
                                <button class="btn_1 green" style="background-color: white; color:black; display: flex; align-items: center; justify-content: center;" onclick="goBack()">
                                    <i class="icon-right" style="font-size: 20px;"></i>
                                    Regresar
                                </button>
                            </div>
                            <div class="col-md-9" style="text-align:right;">
                               <h1>`+datos.name+`</h1>
                                <span>`+datos.location.country.name+`</span>
                                <span class="rating">
                                `
                                let puntos = datos.category_code.name.match(/\d+/)
                                if(puntos){
                                    lista += obtenerPuntacion(parseInt(puntos[0])).icono
                                }else{
                                    lista += `<span class="voted">`+datos.category_code.name+`</span>`
                                }
                                lista += `
                            </div>
                        </div>
                    </div>
                </div>
            </section>
    `
    $("#heaederActividad").html(lista)
}




function construirDescripcion(descripcion){
    let lista =""
    lista += `<p style="text-align: justify;">`+descripcion+`</p> `
    $("#descripcion").html(lista)
}


async function sacarCache(idHotel){
    const auxiliar = await recuperarDatosCache("cacheHoteles");
    const hotelesCache = auxiliar.datos
    if(hotelesCache){
        const rooms =  hotelesCache.hoteles.filter(item => item.code == idHotel);
        if(rooms.length>0){
            return rooms
        }
        else{
            mensajeUsuario('error','Oops...',"No se pudo obtener hoteles, vuelva a consultar") 
            goBack()
        }
    }
    else{
        console.log("No se pudo obtener hoteles, vuelva a consultar")
        goBack()
    }
}



async function construirHabitaciones(info){
    const hotel = await sacarCache(info.idHotel) 
    let lista = ""
    info.ocupantes.forEach((aux,index) => {
        lista += `
        <a href="#habitacion_`+index+`" data-bs-toggle="collapse" class="d-flex justify-content-between align-items-center">
            <h6><strong style="color: #99c21c;">`+aux.rooms+` HABITACIÓN(ES) </strong> POR `+aux.adults+` ADULTO(S)`
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
            <span>
                <i class="icon-angle-up"></i>
            </span>
        </a>
        <div class="collapse show" id="habitacion_`+index+`">`
            const id = armarId(0,aux.rooms,aux.adults, aux.children, aux.paxes)
            lista +=  `
            <div id="pasajero_`+id+`">
            </div>
        </div>`
    });
    $("#habitaciones_detalle").html(lista)
    console.log(hotel[0].rooms)
    roomsGlobal = hotel[0].rooms
    sacarTipoHabitacion(hotel[0].rooms)
}


function dividirHabitaciones(rooms){
    const datos_por_habitacion = dividirPorIdRate(rooms)
    plasmarHabitaciones(datos_por_habitacion)
}



function plasmarHabitaciones(habitacionesDivididas){
    let lista = ""
    habitacionesDivididas.forEach(element => {
        lista = ""
        lista += lista += obtenerRooms(1,element.rooms, element.id, codigoHotelGlobal, nombreHotelGlobal).lista
        lista += `<br><br><br><br>`
        $("#pasajero_"+element.id).html(lista)        
    });
}



function reservarHotel(){
    let informacion={
        rooms: []
    }
    if(resumenCompra.length>0){
        resumenCompra.forEach(element => {
            let nuevoRoom ={
                rateKey : element.rateKey    
            }
            ocupantes.forEach((aux,index) => {
                const id = armarId(0,aux.rooms,aux.adults, aux.children, aux.paxes)
                if(id == element.id){
                    ocupantes[index].ratekey = element.rateKey
                }
            });
            informacion.rooms.push(nuevoRoom)
        });
        hacerReserva(informacion)
    }        
}



function hacerReserva(informacion){
    abrirSpinner("Añadiendo hotel a su carrito...")
    agregarItemHoteles(informacion)
}




function agregarItemHoteles(informacion){
    let datosHoteles= {hotel: informacion,ocupantes: ocupantes}
    let carritoHoteles = JSON.parse(localStorage.getItem("carritoHoteles"))
    if(carritoHoteles){
        carritoHoteles.push(datosHoteles)
        localStorage.setItem("carritoHoteles", JSON.stringify(carritoHoteles))
    }else{
        let hoteles = []
        hoteles.push(datosHoteles)
        localStorage.setItem("carritoHoteles", JSON.stringify(hoteles))
    }
    setTimeout(function(){
        cerrarSpinner()
        const url = window.location.origin + "/carrito"
        window.location.href = url;   
    },1000)
}




var resumenCompra = []
function escogerHotel(datos){
    console.log(ocupantes)
    let informacion = JSON.parse(datos);
    const index = resumenCompra.findIndex(item => item.id === informacion.id);
    if (index === -1) {
        resumenCompra.push(informacion);
    } else {
        resumenCompra[index] = informacion;
    }


    if(resumenCompra.length==ocupantes.length){
        plasmarResumenCompra(resumenCompra)
    }
    else{
        plasmarResumenCompra(resumenCompra)
        const myButton = document.getElementById('boton_resumen');
        myButton.disabled = true; // Deshabilitar el botón
        myButton.style.opacity = '0.5'; // Opacar el botón
        myButton.style.cursor = 'not-allowed'; // Cambiar el cursor
    }
}


function plasmarResumenCompra(cuartos){
    let lista = ""
    lista +=`

            <div class="col-md-4" style="padding-left:30px;">
                <h4 class="header-title mb-3">`+cuartos[0].nombreHotel+`</h4>
            </div>

            <div class="col-md-6" style="display: flex; flex-direction: column;">`
                let precioTotal = 0
                cuartos.forEach(element => {
                    lista +=`
                        <p>
                            <strong>`+element.numeroHabitacion+` Habitación(es)</strong> `+element.nombreHabitacion+`
                            Por `+element.adultos+` adultos`
                            if(element.ninos){
                                lista += `y `+element.ninos+` niños de `+element.edadesNinos+` años`
                            }
                            precioTotal = precioTotal + parseFloat(element.precio)
                            lista += ` $`+element.precio.toFixed(2)+`
                        </p>`
                });
                lista +=`
            </div>
            <div class="col-md-2" style="display: flex; flex-direction: column; align-items: center;">
                <strong style="margin: 0;" font-size:22px;>TOTAL: $`+(precioTotal).toFixed(2)+`</strong>
                <button type="submit" class="btn_full" onclick="reservarHotel();" style="background-color: #99c21c; color: white;" id = "boton_resumen">
                    RESERVAR
                </button>
            </div>

            `
    $("#resumenHoteles").html(lista)
    $("#resumenContenedor").show()
}
    





var tiposGlobal = []
var roomsGlobal = []
function sacarTipoHabitacion(rooms){
    let tipos = []
    rooms.forEach(element => {
        if(!tipos.includes(element.code)){
            tipos.push(element.code)
        }
    });
    Enviar_API_Vuelos(JSON.stringify(tipos), '/api/hotelbeds/booking/roomtypes', datos => {
        if (datos.estado){
            tiposGlobal = datos.consulta
            armarFiltroTipoHabitacion(datos.consulta)
            dividirHabitaciones(rooms)
        }else{
            mensajeUsuario('error','Oops...',datos.error)     
        }
    })
}



function armarFiltroTipoHabitacion(cat){
    let lista = ""
    cat.forEach(element => {
        lista += `
            <li>
                <label class="container_check">
                    <span class="rating">`+element.typeDescription.toUpperCase()+` </span>
                    <input type="checkbox" value="`+element.type+`" class="checkbox-item" checked>
                    <span class="checkmark"></span>
                </label>
            </li>
        `
    });
    $("#listaTipoHabitacion").html(lista)
}



function filtrarHabitaciones(){
    const checkboxes = document.querySelectorAll('.checkbox-item');
    const selected = [];
    const notSelected = [];
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selected.push(checkbox.value); // Almacenar el valor si está seleccionado
        } else {
            notSelected.push(checkbox.value); // Almacenar el valor si no está seleccionado
        }
    });
    const arrayFiltrado = armarHabitacionesFiltradas(roomsGlobal,selected)
    dividirHabitaciones(arrayFiltrado)
    

}


function armarHabitacionesFiltradas(rooms,seleccionados){
    return rooms.filter(item => 
        seleccionados.some(code => item.code.startsWith(code))
    );
}




function traducirTipoHabitacion(room){
    const tipo = room.split('.')[0];
    const resultado = tiposGlobal.find(item => item.type == tipo)
    if (resultado) {
        return resultado.typeDescription.toUpperCase()
    } else {
        return tipo.toUpperCase()
    }
}





function contruirEmojis(datos){
    let lista = ""
    lista += `
        <div id="single_tour_feat">
			<ul>
                <li>`+tipoActividad(datos.subcategory)+`</li>
                <li><i class="icon_set_1_icon-83"></i>`+formatoEnteros(datos.duration.duration/60)+` hora(s)</li>
                <li><i class="icon_set_1_icon-13"></i>`
                if(datos.accessibility.code != 0){lista+=`Si`}
                else{lista+= `No`}
                lista+=`</li>
                <li><i class="icon_set_1_icon-82"></i>`+datos.reviews+` Visitas</li>
                <li><i class="icon_set_1_icon-41"></i><a href="https://www.google.com/maps?q=`+datos.address.latitude+`,`+datos.address.longitude+`" target="_blank" style="writing-mode: horizontal-tb; display: inline; line-height: normal; color: inherit; ">Ver mapa</a></li>
                <li><i class="icon_set_1_icon-97"></i>`+obtenerLenguaje(datos.guideLanguages)+`</li>
                <li><i class="icon_set_1_icon-81"></i>`+datos.score+` puntos</li>
    
            </ul>		
		</div>
        
    `
    $("#emojis").html(lista)
}


    function goBack() {
        var url = window.location.origin + "/listaHoteles"
        window.location.href = url;
    }