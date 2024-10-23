// Creación del módulo
var app = angular.module('mvevip', ['ngRoute']);

// Configuración de las rutas
app.config(['$routeProvider', '$locationProvider',function($routeProvider, $locationProvider) {

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false // Opcional, pero útil si no tienes una etiqueta <base> configurada correctamente
    });



    $routeProvider
        .when('/', {
            templateUrl : 'home.html',
            controller : 'HomeController'
        })
        .when('/home', {
            templateUrl : 'home.html',
            controller : 'HomeController'
        })
        .when('/contratos', {
            templateUrl : 'contratos.html',
            controller : 'ContratosController'
        })
        .when('/FAQ', {
            templateUrl : 'faq.html',
            controller : 'FAQController'
        })
        .when('/about', {
            templateUrl : 'about.html',
            controller : 'AboutController'
        })
        .when('/contact', {
            templateUrl : 'contactanos.html',
            controller : 'ContactController'
        })
        .when('/tips', {
            templateUrl : 'tips.html',
            controller : 'TipsController'
        })
        .when('/mantenimiento', {
            templateUrl : 'mantenimiento.html',
            controller : 'MantenimientoController'
        })
        .when('/moneda', {
            templateUrl : 'moneda.html',
            controller : 'MonedaController'
        })
        .when('/encuesta', {
            templateUrl : 'encuesta.html',
            controller : 'EncuestaController'
        })
        .when('/listaVuelos', {
            templateUrl : 'lista_vuelos.html',
            controller : 'ListaVuelosController'
        })
        .when('/formularioVuelos', {
            templateUrl : 'formulario_vuelos.html',
            controller : 'FormularioVuelosController'
        })
        .when('/resumenVuelos', {
            templateUrl : 'resumen_vuelo.html',
            controller : 'ResumenVuelosController'
        })
        .when('/listaActividades', {
            templateUrl : 'lista_actividades.html',
            controller : 'ListaActividadesController'
        })
        .when('/actividadDetalle', {
            templateUrl : 'actividad_detalle.html',
            controller : 'ActividadDetalleController'
        })
        .when('/carrito', {
            templateUrl : 'carrito.html',
            controller : 'CarritoController'
        })
        .when('/carritoDetalles', {
            templateUrl : 'carrito_detalles.html',
            controller : 'CarritoDetallesController'
        })
        .when('/listaTraslados', {
            templateUrl : 'lista_traslados.html',
            controller : 'ListaTrasladosController'
        })
        .when('/listaHoteles', {
            templateUrl : 'lista_hoteles.html',
            controller : 'ListaHotelesController'
        })
        .when('/listaCatalogos', {
            templateUrl : 'lista_catalogos.html',
            controller : 'ListaCatalogosController'
        })
        .when('/listaCatalogosTours', {
            templateUrl : 'lista_catalogos_tours.html',
            controller : 'ListaCatalogosToursController'
        })
        .when('/tourDetalle', {
            templateUrl : 'tour_detalle.html',
            controller : 'TourDetalleController'
        })
        .otherwise({
            redirectTo: '/home'
        });
    
    $locationProvider.html5Mode(true);

}]);

// Definir controladores (pueden estar en archivos separados)
app.controller('HomeController', ['$scope', function($scope) {
    $scope.message = 'Bienvenido al Home';
}]);

app.controller('ContratosController', ['$scope', function($scope) {
    $scope.message = 'Bienvenido a los contratos';
}]);

app.controller('FAQController', ['$scope', function($scope) {
    $scope.message = 'Bienvenido a los FAQ';
}]);

app.controller('AboutController', ['$scope', function($scope) {
    $scope.message = 'Bienvenido a sobre nosotros';
}]);

app.controller('ContactController', ['$scope', function($scope) {
    $scope.message = 'Bienvenido a contactanos';
}]);

app.controller('TipsController', ['$scope', function($scope) {
    $scope.message = 'Bienvenido a los tips para viajeros';
}]);

app.controller('MantenimientoController', ['$scope', function($scope) {
    $scope.message = 'Bienvenido al mantenimiento de la pagina';
}]);

app.controller('MonedaController', ['$scope', function($scope) {
    $scope.message = 'Bienvenido al cambio de moneda';
}]);

app.controller('EncuestaController', ['$scope', function($scope) {
    $scope.message = 'Bienvenido a la encuesta de satisfacción';
}]);

app.controller('ListaVuelosController', ['$scope', function($scope) {
    $scope.message = 'Bienvenido a la lista de vuelos';
}]);

app.controller('FormularioVuelosController', ['$scope', function($scope) {
    $scope.message = 'Bienvenido al formulario de vuelos';
}]);

app.controller('ResumenVuelosController', ['$scope', function($scope) {
    $scope.message = 'Bienvenido al resumen de vuelos';
}]);

app.controller('ListaActividadesController', ['$scope', function($scope) {
    $scope.message = 'Bienvenido a las actividades';
}]);

app.controller('ActividadDetalleController', ['$scope', function($scope) {
    $scope.message = 'Bienvenido al detalle de las actividades';
}]);

app.controller('CarritoController', ['$scope', function($scope) {
    $scope.message = 'Bienvenido al carrito';
}]);

app.controller('CarritoDetallesController', ['$scope', function($scope) {
    $scope.message = 'Bienvenido al detalle del carrito';
}]);

app.controller('ListaTrasladosController', ['$scope', function($scope) {
    $scope.message = 'Bienvenido a la lista de traslados';
}]);

app.controller('ListaHotelesController', ['$scope', function($scope) {
    $scope.message = 'Bienvenido a la lista de hoteles';
}]);

app.controller('ListaCatalogosController', ['$scope', function($scope) {
    $scope.message = 'Bienvenido a la lista de catalogos';
}]);

app.controller('ListaCatalogosToursController', ['$scope', function($scope) {
    $scope.message = 'Bienvenido a la lista de tours';
}]);

app.controller('ListaCatalogosToursController', ['$scope', function($scope) {
    $scope.message = 'Bienvenido a la lista de tours';
}]);

app.controller('TourDetalleController', ['$scope', function($scope) {
    $scope.message = 'Bienvenido al detalle del tour';
}]);


