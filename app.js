let map;
let userLocation;
let directionsService;
let directionsRenderer;
let autocomplete;

function initMap() {
    // Inicializa el mapa centrado en San Pedro Sula
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 15.5, lng: -88.0333 }, // Coordenadas de San Pedro Sula
        zoom: 14
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // Inicializa el autocompletado de lugares
    const input = document.getElementById("destination");
    autocomplete = new google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: "hn" }, // Limita las sugerencias a Honduras
        fields: ["geometry", "name"],
        types: ["establishment", "geocode"] // Incluye sugerencias de lugares y direcciones
    });

    // Maneja la selección de una sugerencia de lugar
    autocomplete.addListener("place_changed", onPlaceChanged);

    // Intenta obtener la ubicación del usuario
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(userLocation);
            },
            () => {
                handleLocationError(true, map.getCenter());
            }
        );
    } else {
        // El navegador no soporta geolocalización
        handleLocationError(false, map.getCenter());
    }

    document.getElementById("find-route").addEventListener("click", findRoute);
}

function handleLocationError(browserHasGeolocation, pos) {
    const errorMessage = browserHasGeolocation
        ? "Error: No se pudo obtener la ubicación."
        : "Error: Tu navegador no soporta geolocalización.";
    alert(errorMessage);
    map.setCenter(pos);
}

function onPlaceChanged() {
    const place = autocomplete.getPlace();
    if (!place.geometry) {
        alert("No se pudo encontrar el lugar especificado.");
        return;
    }

    map.setCenter(place.geometry.location);
    calculateRoute(place.geometry.location);
}

function findRoute() {
    const destination = document.getElementById("destination").value;
    if (!destination) {
        alert("Por favor, ingresa un destino.");
        return;
    }

    const place = autocomplete.getPlace();
    if (place && place.geometry) {
        calculateRoute(place.geometry.location);
    } else {
        alert("Por favor, selecciona un destino de las sugerencias.");
    }
}

function calculateRoute(destination) {
    if (!userLocation) {
        alert("Ubicación del usuario no disponible.");
        return;
    }

    const request = {
        origin: userLocation,
        destination: destination,
        travelMode: google.maps.TravelMode.TRANSIT,
        transitOptions: {
            modes: ["BUS"],
        },
    };

    directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
            showRouteInfo(result);
        } else {
            alert("No se pudo calcular la ruta en autobús.");
        }
    });
}

function showRouteInfo(result) {
    const route = result.routes[0].legs[0];
    const info = `
        <h3>Información de la Ruta</h3>
        <p>Distancia: ${route.distance.text}</p>
        <p>Duración: ${route.duration.text}</p>
        <p>Desde: ${route.start_address}</p>
        <p>Hasta: ${route.end_address}</p>
    `;
    document.getElementById("route-info").innerHTML = info;
}

// Asegúrate de que initMap esté globalmente disponible
window.initMap = initMap;
