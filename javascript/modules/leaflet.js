
// Export Classes
export class NICEBusMap extends L.map {
    constructor(id, lat, lon, zoom, geojson) {
        let default_params = {
            center: [lat, lon],
            crs: L.CRS.EPSG3857,
            zoom: zoom,
            zoomControl: true,
            preferCanvas: false,
        }

        super(id, default_params);
        this.basemap_layer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
        this.basemap_layer.addTo(this);
        this.init_lat = lat;
        this.init_lon = lon;
        this.init_zoom = zoom;

        const route_lines = new BusLineLayer(geojson);
        route_lines.addTo(this);

        const nassau_layer = new NassauCounty(nassau);
        nassau_layer.addTo(this);
    }
}

export class RouteLayer extends L.FeatureGroup {
    constructor(route_id, buses_response, stops_response, icon_url) {
        const features = [];

        for (const bus of buses_response.ResultData) {
            bus.route = route_id;
            const bus_marker = new VehicleMarker(bus, icon_url);
            features.push(bus_marker);
        }

        const color = icon_url.split('_').pop().split(".")[0];
        for (const stop of stops_response.ResultData) {
            try {
                const busStop = new BusStopMarker(stop, color);
                features.push(busStop);
            } catch (e) {
                console.log(stop);
                continue;
            }
        }
        super(features);
    }
}

// Helper Classes

class BusLineLayer extends L.geoJSON {
    constructor(geojson) {
        super(geojson, {
            style: {
                color: "gray",
            }
        })
        this.bindPopup((layer) => {
            return layer.feature.properties.label;
        })
    }
}

class NassauCounty extends L.geoJSON {
    constructor(geojson) {
        super(geojson, {
            style: {
                color: "blue"
            }
        })
    }
}
class BusStopMarker extends L.marker {
    constructor(data, color) {
        const lat = parseFloat(data.lat);
        const lon = parseFloat(data.lng);
        const name = data.Display
        const id = parseFloat(data.Value)

        super([lat, lon], {
            icon: new BusStopIcon(color),
            zIndexOffset: 500
        });

        this.bindPopup(`${name}<br>${id}`);
    }
}

class BusStopIcon extends L.divIcon {
    constructor(color) {
        super({
            className: "none",
            html: `<div id="bus-stop" style="background-color: ${color};"</div>`
        })
    }
}

class VehicleMarker extends L.marker {
    constructor(data, icon_url) {
        const lat = parseFloat(data.lat);
        const lon = parseFloat(data.lon);
        const icon = new VehicleMarkerIcon(icon_url);

        super([lat, lon], {
            icon: icon,
            zIndexOffset: 1000
        });
        this.route = data.route;
        this.lat = lat;
        this.lon = lon;
        this.destination = data.des;
        this.pdist = parseFloat(data.pdist);
        this.hdg = parseFloat(data.hdg);
        this.id = parseFloat(data.vid);

        const popup = `Route: ${this.route}<br>Destination: ${this.destination}<br>Bus ID: ${this.id}<br>Distance: ${this.pdist}`;

        this.bindPopup(popup);
    }
}

class VehicleMarkerIcon extends L.icon {
    constructor(icon_url) {
        super({
            iconUrl: icon_url,
            iconSize: [20, 20]
        });
    }
}

