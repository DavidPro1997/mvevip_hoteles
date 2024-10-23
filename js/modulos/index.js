var numeroItemsIndex = 0
function verificarCarritosIndex(){
    let total = localStorage.getItem("numItems")
    if(parseInt(total)>0){
        lista = `<i class="icon_cart"></i><strong>`+total+`</strong>`
        $("#numeroItemsIndexCarrito").html(lista)
    }else{
        $("#numeroItemsIndexCarrito").html("")
    }
}
