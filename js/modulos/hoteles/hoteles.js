async function recibirInformacion() {
    const urlParams = new URLSearchParams(window.location.search);
    const datosString = urlParams.get('datos');

        if (datosString) {
            const datos = JSON.parse(decodeURIComponent(datosString));
            armarOcupantes(datos)
            setearInformacion(datos)
            consultarHoteles(datos)
        } else {
            console.log("El parámetro 'datos' no está presente, revisando cache...");
            let datos = await recuperarDatosCache("cacheHoteles");
            const hotelesCache = datos.datos
            if(hotelesCache){
                console.log(hotelesCache)
                noches = calcularNoches(hotelesCache.datos.stay.checkIn, hotelesCache.datos.stay.checkOut)
                armarOcupantes(hotelesCache.datos)
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





var ocupantes = []
function armarOcupantes(datos){
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







function obtenerExclusiveDeal(id){
    if(id == 1){
        return "PREFERENCIALES"
    }else if(id == 2){
        return "TOP HOTELES"
    }else if(id == 3){
        return "REGULARES"
    }else{
        return id
    }
}


function armarHoteles(datos){
    $("#listaHoteles").html("")
    var lista = ""
    datos.forEach(element => {
        lista = ""
        lista += `
            <div class="strip_all_tour_list wow fadeIn" data-wow-delay="0.1s">
                <div class="row">
                    <div class="col-lg-4 col-md-4 position-relative">`
                        if(element.exclusiveDeal){
                            lista += `
                            <div class="ribbon_3"><span style="font-size:7px;">`+obtenerExclusiveDeal(element.exclusiveDeal)+`</span></div>
                            `
                        }
                        lista += `
                        <div class="img_list">
                            <a href="#"  onclick="verHotel('`+element.code+`'); return false;">`
                                if(element.images.length>0){
                                    lista+= `<img src="`+element.images[0][element.images[0].length-1]+`" alt="Image">`
                                }else{
                                    lista+= `<img src="img/hoteles/mkv.png" alt="Image">`
                                }
                                lista +=`
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
                                    <i class="icon-location" style ="color:#99c21c;"></i>
                                </div>
                                <div class="col-9" style="display: flex; flex-direction: column;">
                                    <span>`+element.destinationName+` / `+element.address+` / <a href="https://www.google.com/maps?q=${element.latitude},${element.longitude}" target="_blank">
                                        Ver ubicación en el Mapa
                                    </a></span>
                                </div>
                            </div> 
                            <div clas="row" style="display: flex;">
                                <div class="col-2">
                                    <i class="icon-phone" style ="color:#99c21c;"></i>
                                </div>
                                <div class="col-9" style="display: flex; flex-direction: column;">
                                    <span>`+element.phones[0].phone_number+`</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-3">
                        <div class="price_list">
                            <div>
                                <small>Desde</small>
                                <sup>$</sup>`
                                const precio = parseFloat(element.minRate)+100
                                lista += precio.toFixed(2)+`
                                <small>*Por `+noches+` noche(s)</small>
                                <p>
                                    <a href="#" onclick="verHotel('`+element.code+`'); return false;" class="btn_1" style ="background-color: #99c21c;">Ver Hotel</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
        $("#listaHoteles").append(lista)
        // construirHabitaciones2(element.rooms,element.code,element.name)
    });
    cerrarSpinner()
}


function verHotel(id){
    datos = {
        idHotel: id,
        ocupantes: ocupantes
    }
    let datosString = encodeURIComponent(JSON.stringify(datos));
    let url = window.location.origin + "/hotelDetalle?datos=" + datosString;
    window.location.href = url;
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


function goBack() {
    var url = window.location.origin + "/home"
    window.location.href = url;
}

