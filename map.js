const map = L.map('map', {crs: L.CRS.Simple, minZoom: -1, maxZoom: 1, zoomControl: false, zoomSnap: 0.25 });
const markerLayer = L.layerGroup().addTo(map);
let overlay = null;
let kingdoms = [];
const cache = {};

const icons = {
    'subarea': L.icon({
        iconUrl: 'icons/subarea.png',
        iconSize: [32,32],
        iconAnchor: [16,16]
    }),
    'hintart': L.icon({
        iconUrl: 'icons/hintart.png',
        iconSize: [32,32],
        iconAnchor: [16,16]
    }),
    'moon': L.icon({
        iconUrl: 'icons/moon.png',
        iconSize: [32,32],
        iconAnchor: [16,16]
    })
}

async function init() {
    const res = await fetch('data/kingdoms.json');
    kingdoms = await res.json();
    buildSelectMenu();
    showKingdom(kingdoms[0]);
}

function buildSelectMenu() {
    const select = document.getElementById('kingdoms');
    kingdoms.forEach( k => select.add(new Option(k.name, k.id)));
    select.addEventListener('change', () => 
        showKingdom(kingdoms.find( k => k.id === select.value))
    );

}

async function loadKingdom(entry) {
    if (!cache[entry.id]) {
        const res = await fetch(entry.file);
        cache[entry.id] = await res.json();
    }
    return cache[entry.id];
}

async function showKingdom(entry) {
    const k = await loadKingdom(entry);
    if (overlay) map.removeLayer(overlay);
    markerLayer.clearLayers();

    const bounds = [[0, 0], [k.height, k.width]];
    overlay = L.imageOverlay(k.image, bounds).addTo(map);

    map.fitBounds(bounds);
    map.setMaxBounds(L.latLngBounds(bounds));

    k.pois.forEach(poi => drawPoi(poi, k));
}

function drawPoi(poi, k) {
    const marker = L.marker([poi.y, poi.x], { icon: icons[poi.category] });
    let html = `<b>${poi.title}</b><p>${poi.note}</p>`;
    marker.bindPopup(html);
    markerLayer.addLayer(marker);
}

init();
map.on('click', e => console.log(e.latlng));