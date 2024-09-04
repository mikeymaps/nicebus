import { NICEBusMap, RouteLayer } from './modules/leaflet.js';
import { Client } from './modules/requests.js'

const map = new NICEBusMap('myMap', 40.740562, -73.620111, 11, route_lines);

for (const [route_id, icon_url] of Object.entries(routes)) {
    const route_response = await Client.getRoute(route_id.toLowerCase());
    const stops_response = await Client.getStops(route_id.toLowerCase());

    if (!route_response.hasData) {
        console.log(`${route_id} has no data.`)
        continue;
    }

    const layer = new RouteLayer(route_id, route_response, stops_response, icon_url)
    layer.addTo(map);
}