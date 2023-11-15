import { LayersControl, TileLayer } from 'react-leaflet';

export const BaseLayers = () => {
    const { BaseLayer, Overlay } = LayersControl;
    return (
        <LayersControl>
            <BaseLayer checked name="SwissTopo">
                <TileLayer
                    attribution='&copy; <a href="https://www.swisstopo.admin.ch/">SwissTopo</a>'
                    url="https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg"
                />
                {/* <TileLayer url={TILES_URL} /> */}
            </BaseLayer>
            <BaseLayer name="OpenStreetMap">
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
            </BaseLayer>
        </LayersControl>)
};