import { LayersControl, TileLayer } from 'react-leaflet';
import { useTheme } from 'react-admin';

export const BaseLayers = () => {
    const { BaseLayer, Overlay } = LayersControl;
    const [theme, setTheme] = useTheme();

    return (
        <LayersControl>
            <BaseLayer
                name="CARTO Dark"
                checked={theme === 'dark'}
            >
                {/* {theme === 'dark' ? (
                    ) : (
                        )} */}
                <TileLayer
                    url='https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    subdomains='abcd'
                    maxZoom={20}
                    zIndex={0}
                />
            </BaseLayer>
            <BaseLayer
                name="OpenStreetMap"
                checked={theme !== 'dark'}
            >
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    opacity={0.5}
                />
            </BaseLayer>
        </LayersControl>)
};