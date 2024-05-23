import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';

const Legend = () => {
    const map = useMap(); // Get the map instance

    useEffect(() => {
        const legend = L.control({ position: 'bottomright' });

        legend.onAdd = () => {
            const div = L.DomUtil.create('div', 'info legend');
            div.innerHTML = `
                <div style="
                    background: rgba(255, 255, 255, 0.5);
                    padding: 10px;
                    border: 2px solid black;
                    border-radius: 5px;
                    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
                ">
                    <h4 style="margin-top: 0;">Legend</h4>
                    <div style="display: flex; align-items: center; margin-bottom: 5px;">
                        <i class="fa fa-temperature-low" style="color: yellow; background: blue; width: 18px; height: 18px; display: inline-block; margin-right: 5px; text-align: center; line-height: 18px;"></i>
                        Sensor
                    </div>
                    <div style="display: flex; align-items: center; margin-bottom: 5px;">
                        <i class="fa fa-trowel" style="color: black; background: green; width: 18px; height: 18px; display: inline-block; margin-right: 5px; text-align: center; line-height: 18px;"></i>
                        Plot
                    </div>
                    <div style="display: flex; align-items: center;">
                        <i class="fa fa-clipboard" style="color: yellow; background: red; width: 18px; height: 18px; display: inline-block; margin-right: 5px; text-align: center; line-height: 18px;"></i>
                        Soil Profile
                    </div>
                </div>
            `;
            return div;
        };

        legend.addTo(map);
        return () => {
            legend.remove();
        };
    }, [map]);

    return null;
};

export default Legend;
