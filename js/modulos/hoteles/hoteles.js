async function recibirInformacion() {

    const urlParams = new URLSearchParams(window.location.search);
    const datosString = urlParams.get('datos');

        if (datosString) {
            const datos = JSON.parse(decodeURIComponent(datosString));
            armarInformacion(datos)
            setearInformacion(datos)
            consultarHoteles(datos)
        } else {
            console.log("El parámetro 'datos' no está presente, revisando cache...");
            let datos = await recuperarDatosCache("cacheHoteles");
            const hotelesCache = datos.datos
            if(hotelesCache){
                armarInformacion(hotelesCache.datos)
                setearInformacion(hotelesCache.datos)
                hotelesGlobal = hotelesCache.hoteles
                armarHoteles(hotelesCache.hoteles)
                armarfiltros(hotelesCache.hoteles)
            }
            else{
                console.log("No hay datos en la cache")
            }
        }

}





var cuartos = []
var ocupantes = []
function armarInformacion(datos){
    ocupantes = datos.occupancies
    ocupantes.forEach((element,index) => {
        let edades = ""
        if(element.paxes){
            element.paxes.forEach((edad,i) => {
                if(element.paxes[i+1]){
                    edades += edad.age+", "
                }else{
                    edades += edad.age
                }
                
            });
        }
        let nuevoCuarto = {
            id: armarId(index, datos.occupancies),
            numero: element.rooms,
            idHabitacion: "",
            nombreHabitacion:"",
            nombreHotel: "",
            idHotel: "",
            precio:"",
            adultos: element.adults,
            ninos: element.children,
            edadesNinos: edades
        }
        cuartos.push(nuevoCuarto)
    });
}





var hotelesGlobal = []
var noches = 0
function consultarHoteles(info){
    abrirSpinner("Cargando hoteles, por favor espere")
    console.log(info)
    Enviar_API_Vuelos(JSON.stringify(info), '/api/hotelbeds/booking/disponibilidad', datos => {
        if (datos.estado){
            noches = calcularNoches(datos.consulta.checkIn, datos.consulta.checkOut)
            guardarDatosCache(info, datos.consulta.hotels)
            hotelesGlobal = datos.consulta.hotels
            armarHoteles(datos.consulta.hotels)
            armarfiltros(datos.consulta.hotels)
            cerrarSpinner()
        }else{
            cerrarSpinner()
            mensajeUsuario('error','Oops...',datos.error)     
        }

    })

}



function guardarDatosCache(info, hoteles){
    const datos = {datos: info, hoteles: hoteles}
    guardarCache(datos, "cacheHoteles")
}







function filtrarNombre(input) {
    const valorInput = input.value.toLowerCase();
    if(valorInput.length > 3){
        const hotelesFiltrados = hotelesGlobal.filter(hotel =>
            hotel.name.toLowerCase().includes(valorInput)
        );
        setTimeout(function() {
            armarHoteles(hotelesFiltrados);    
        }, 500);
    }
    else if(valorInput.length == 0){
        armarHoteles(hotelesGlobal)
    }
}



var hotelesFiltradosGlobalCat = []
var preciosGlobalHoteles = {min:0, max:0}
function armarfiltros(hoteles){
    var hotelesPuntos = {}
    var hotelesPrecios = {min:10000000, max:0}
    hoteles.forEach(element => {
        //Precios
        if(parseFloat(element.minRate)<hotelesPrecios.min){
            hotelesPrecios.min = element.minRate
        }
        if(parseFloat(element.minRate)>hotelesPrecios.max){
            hotelesPrecios.max = element.minRate
        }


        //Estrellas
        let puntos = element.categoryName.match(/\d+/)
        if(puntos){ puntos = obtenerPuntacion(parseInt(puntos[0])).puntos}
        else{ puntos = element.categoryName }
        if (!hotelesPuntos[puntos]) {
            hotelesPuntos[puntos] = [];
        }
        hotelesPuntos[puntos].push(element);
    });
    hotelesFiltradosGlobalCat = hotelesPuntos
    preciosGlobalHoteles.min = hotelesPrecios.min
    preciosGlobalHoteles.max = hotelesPrecios.max
    armarFiltroCategorias(hotelesPuntos)
    armarFiltroPrecios(parseFloat(hotelesPrecios.min),parseFloat(hotelesPrecios.max))
}



function armarFiltroCategorias(cat){
    let lista = ""
    Object.keys(cat).forEach(element => {
        lista += `
            <li>
                <label class="container_check">
                    <span class="rating">
                        `
                        if(!isNaN(element)){
                            lista += obtenerPuntacion(element).icono
                        }else{
                            lista+= `<span class="voted" style="margin-right: 20px;">`+element+`</span>`
                        }
                        lista +=
                        `
                    </span>(`+cat[element].length+`)
                    <input type="checkbox" value="`+element+`" class="checkbox-item">
                    <span class="checkmark"></span>
                </label>
            </li>
        `
    });
    $("#listaEstrellas").html(lista)
}



function filtrarHoteles(){
    abrirSpinner("Filtrando...")
    setTimeout(function() {
        var hotelesFiltrados = {}
        hotelesFiltrados = validarCategoria()
        hotelesFiltrados = validarPrecios(hotelesFiltrados)
        hotelesFiltrados = validarOrdenPrecio(hotelesFiltrados)
        armarHoteles(hotelesFiltrados)   
    }, 500);
}



function validarOrdenPrecio(hoteles){
    const ordenSelec = document.querySelector('input[name="ordenarPrecio"]:checked');
    if(ordenSelec){
        if(ordenSelec.value == 0){
            hoteles.sort((a, b) => parseFloat(a.minRate) - parseFloat(b.minRate));
        }
        else if(ordenSelec.value == 1){
            hoteles.sort((a, b) => parseFloat(b.minRate) - parseFloat(a.minRate));
        }
        
    }
    return hoteles
    
}



function validarPrecios(hotelesFiltrados){
    var hotelesFiltradosPrecios = []
    var sliderData = $("#range").data("ionRangeSlider");
    var fromValue = sliderData.result.from; // Valor 'from'
    var toValue = sliderData.result.to;     // Valor 'to
    if(preciosGlobalHoteles.min != fromValue || preciosGlobalHoteles.max != toValue){
        hotelesFiltrados.forEach(element => {
            if(parseFloat(element.minRate)>=fromValue && parseFloat(element.minRate)<=toValue){
                hotelesFiltradosPrecios.push(element)
            }
        });
        return hotelesFiltradosPrecios
    }else{
        return hotelesFiltrados
    }
}




function validarCategoria(){
    var hotelesFiltrados = []
    var catEscogidas = [];
    $(".checkbox-item:checked").each(function() {
        catEscogidas.push($(this).val()); // Agrega el valor al array
    });
    if(catEscogidas.length>0){
        Object.keys(hotelesFiltradosGlobalCat).forEach(element => {
            catEscogidas.forEach(puntos => {
                if(puntos == element){
                    hotelesFiltrados.push(...hotelesFiltradosGlobalCat[element])
                }
            });
            
        });
        return hotelesFiltrados
    }
    else{
        return hotelesGlobal
    }
    
}



function armarFiltroPrecios(newMin, newMax) {
    let pasos = parseInt((newMax-newMin)/100)
    if(pasos == 0){
        pasos = 1
    }
    $("#range").data("ionRangeSlider").update({
        min: newMin.toFixed(2),
		max: newMax.toFixed(2),
		from: newMin,
		to: newMax,
		type: 'double',
		step: pasos
    });
}





function setearInformacion(datos){
    document.getElementById("destinoHotel").value = datos.destinationId
    document.getElementById("chekInHotel").value = datos.stay.checkIn
    document.getElementById("chekOutHotel").value = datos.stay.checkOut
    let personas = 0
    let habitaciones = 0
    datos.occupancies.forEach(element => {
        personas = element.adults + element.children
        habitaciones = element.rooms
    });
    document.getElementById("personasHoteles").value = "👤 "+personas+" PERSONAS Y 🏠 "+habitaciones+" HABITACIONES"
    $("#tituloHotelDestino").html(datos.destinationId+" - 👤 "+personas+" PERSONA(S) Y 🏠 "+habitaciones+" HABITACION(ES)")
}



function verificarIdHotel(array) {
    if (array.length === 0) {
        return false; // Si el array está vacío, retornamos false
    }
    const idHotelReferencia = array[0].idHotel;
    for (let i = 1; i < array.length; i++) {
        // Verificamos si el idHotel es diferente o si está vacío
        if (array[i].idHotel !== idHotelReferencia || array[i].idHotel === '') {
            return false; // Si encontramos un idHotel diferente o vacío, retornamos false
        }
    }
    if (idHotelReferencia === '') {
        return false;
    }
    return true; 
}



function reservarHotel(){
    let informacion={
        rooms: []
    }
    if(verificarIdHotel){
        cuartos.forEach(element => {
            let nuevoRoom ={
                rateKey : element.idHabitacion    
            }
            informacion.rooms.push(nuevoRoom)

            ocupantes.forEach((ocu,index) => {
                if(armarId(index, ocupantes) == element.id){
                    ocu.rateKey = element.idHabitacion
                }
            });


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




function actualizarResumen(){
    let lista = ""
    lista +=`

            <div class="col-md-4" style="padding-left:30px;">
                <h4 class="header-title mb-3">`+cuartos[0].nombreHotel+`</h4>
            </div>

            <div class="col-md-6" style="display: flex; flex-direction: column;">`
                let precioTotal = 0
                cuartos.forEach(element => {
                    $("#reservar"+element.idHotel).show()
                    lista +=`
                        <p>
                            <strong>`+element.numero+` Habitación(es)</strong> `+element.nombreHabitacion+`
                            Por `+element.adultos+` adultos`
                            if(element.ninos){
                                lista += `y `+element.ninos+` niños de `+element.edadesNinos+` años`
                            }
                            precioTotal = precioTotal + parseFloat(element.precio)
                            lista += ` $`+element.precio+`
                        </p>`
                });
                lista +=`
            </div>
            <div class="col-md-2" style="display: flex; flex-direction: column; align-items: center;">
                <strong style="margin: 0;" font-size:22px;>TOTAL: $`+(precioTotal).toFixed(2)+`</strong>
                <button type="submit" class="btn_full" onclick="reservarHotel();" style="background-color: #99c21c; color: white;">
                    RESERVAR
                </button>
            </div>

            `

    $("#resumenHoteles").html(lista)
    $("#resumenContenedor").show()
}




function escogerHotel(datos){
    var informacion = JSON.parse(datos);
    let idHotel= ""
    cuartos.forEach(element => {
        if(element.id == informacion.id){
            element.idHabitacion = informacion.idHabitacion
            element.idHotel = informacion.idHotel
            element.nombreHabitacion = informacion.nombreHabitacion
            element.precio = informacion.precio
            element.nombreHotel = informacion.nombreHotel
            
        }
        idHotel = informacion.idHotel
    });
    if(verificarIdHotel(cuartos)){
        $("#reservar"+idHotel).show()
        actualizarResumen()
    }else{
        $("#resumenHoteles").html("")
        $("#resumenContenedor").hide()
        $("#reservar"+idHotel).hide()
        
    }
}



function goToSlide(slideIndex) {
    var carousel = new bootstrap.Carousel(document.getElementById('carouselExampleFade'));
    carousel.to(slideIndex);
}




function armarHoteles(datos){
    $("#listaHoteles").html("")
    var lista = ""
    datos.forEach(element => {
        lista = ""
        lista += `
            <div class="strip_all_tour_list wow fadeIn" data-wow-delay="0.1s">
                <div class="row">
                    <div class="col-lg-4 col-md-4 position-relative">
                        <div class="ribbon_3 popular"><span>Popular</span>
                        </div>
                        <div class="wishlist">
                            <a class="tooltip_flip tooltip-effect-1" href="javascript:void(0);">+<span class="tooltip-content-flip"><span class="tooltip-back">Add to wishlist</span></span></a>
                        </div>
                        <div class="img_list">
                            <a href="#"  data-bs-toggle="modal" data-bs-target="#centermodal2"><img src="https://visionglobal.com.mx/wp-content/uploads/2015/08/HOTELES.COM-MUESTRA-SU-NUEVA-CAMPA%C3%91A1.jpg" alt="Image">
                                <div class="short_info">
                                    <i class="pe-7s-camera" style="margin-right: 10px;"></i>Ver fotografías completas
                                </div>
                            </a>
                        </div>
                    </div>
                    <div class="col-lg-5 col-md-5">
                        <div class="tour_list_desc">
                            <div class="rating">`
                                let puntos = element.categoryName.match(/\d+/)
                                if(puntos){
                                    lista += obtenerPuntacion(parseInt(puntos[0])).icono
                                }else{
                                    lista += `<span class="voted">`+element.categoryName+`</span>`
                                }
                                lista += `
                            </div>
                            <h3><strong>`+element.name+`</strong></h3>
                            <p>`+element.rooms.length+` tipos de habitaciones se adaptan a tu busqueda:</p>
                            <div clas="row" style="display: flex;">
                                <div class="col-2">
                                    <i class="icon_set_1_icon-41" style="font-size:35px; color:#99c21c;"></i>
                                </div>
                                <div class="col-9" style="display: flex; flex-direction: column;">
                                    <span>Ubicacion: `+element.zoneName+` / `+element.destinationName+`</span>
                                    <a href="https://www.google.com/maps?q=${element.latitude},${element.longitude}" target="_blank">
                                        Ver ubicación en el Mapa
                                    </a>
                                </div>
                            </div> 
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-3">
                        <div class="price_list">
                            <div>
                                <small>Desde</small>
                                <sup>$</sup>`+(parseFloat(element.minRate)).toFixed(2)+`
                                <small>*Por `+noches+` noche(s)</small>
                                <p>
                                    <a href="#habitaciones`+element.code+`" class="btn_1" data-bs-toggle="collapse" style ="background-color: #99c21c;">Habitaciones</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <br>
                <div class="collapse" id="habitaciones`+element.code+`">`
                    ocupantes.forEach((aux,index) => {
                        lista += `
                        <a href="#habitacion`+element.code+`_`+index+`" data-bs-toggle="collapse" class="d-flex justify-content-between align-items-center">
                            <h6><strong>`+aux.rooms+` HABITACIÓN(ES) </strong> POR `+aux.adults+` ADULTO(S)`
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
                            <span>Ocultar <i class="icon-up-open" style="font-size: 22px; margin-right:10px;"></i></span>
                        </a>
                        <div class="collapse show" id="habitacion`+element.code+`_`+index+`">
                            <div id="rooms_`+element.code+`_`+armarId(index, ocupantes)+`">
                            </div>
                        </div> 
                        <br>`

                    });
                    lista += `
                    <div class="row mt-3 mb-3" id="reservar`+element.code+`" style="display:none;">
                        <div class="text-center">
                            <button type="submit" class="btn" onclick="reservarHotel();" style="background-color: #99c21c; color: white; align-items: center;">
                                    RESERVAR
                            </button>
                        </div>
                    </div>
                    <br>
                </div>
            </div>
        `
        $("#listaHoteles").append(lista)
        construirHabitaciones2(element.rooms,element.code,element.name)
    });
    cerrarSpinner()
}


function calcularNoches(fechaInicio, fechaFin) {
    // Crear objetos Date asegurando que se interpreten correctamente
    const inicio = new Date(`${fechaInicio}T00:00:00`);
    const fin = new Date(`${fechaFin}T00:00:00`);
    
    // Calcular la diferencia en milisegundos
    const diferenciaTiempo = fin - inicio;
    
    // Convertir la diferencia de tiempo en noches (milisegundos en un día)
    const noches = diferenciaTiempo / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.floor(noches)); // Asegura que no sea negativo
}


function construirHabitaciones2(habitaciones,codigoHotel,nombreHotel){
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
                    </div>
                    <div class="col-1 d-flex align-items-end justify-content-end">
                        <div style="width: 1px; height: 100%; background-color: #ddd;"></div>
                    </div>
                    <div class="col-9" style="display: flex; flex-direction: column;" >`
                        regimen.valores.forEach((valores,index) => {
                            if(index > 0){
                                lista += `<hr style="margin:0 0 10px 0;">`
                            }
                            lista += `
                            <div class="row mb-2">
                                <div class="col-7" style="display: flex; flex-direction: column;" >
                                    `+cancelacion(valores)+`
                                </div>
                                <div class="col-3 justify-content-center" style="display: flex; flex-direction: column; align-items: end;">
                                    <span style="font-size: 14px"><strong>$`+valores.net+` USD</strong></span>
                                    <a href="" class="dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="display: none;">Detalles de precio</a>
                                    <div class="dropdown-menu p-3 text-muted" style="width: 700px;" style="display: none;">
                                        
                                    </div>
                                </div>
                                <div class="col-2 d-flex align-items-center justify-content-center">
                                    <input class="form-check-input" type="radio" name="radio`+data.id+`" id="customradio2" style="transform: scale(1.5);" value='`+JSON.stringify(informacionResumen(data.id, valores,codigoHotel,nombreHotel,data.habitacion))+`' onclick="escogerHotel(this.value)">
                                </div>
                            </div>
                            
                            `
                        }); 
                        lista += `
                    </div>
                    `
                });
                lista += `
            </div>
            `
            $("#rooms_"+codigoHotel+"_"+data.id).append(lista)
            lista = ""
        });
    });

}

function goBack() {
    var url = window.location.origin + "/home"
    window.location.href = url;
}

