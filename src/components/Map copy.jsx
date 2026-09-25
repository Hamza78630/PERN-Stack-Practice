import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const destination = {
    lat: 31.5204,
    lng: 74.3587
};

const RecenterMap = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.setView(position, 13);
        }
    }, [position, map]);

    return null;
};

const Map = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [route, setRoute] = useState([]);
    const [distance, setDistance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // Fallback used if the browser has no geolocation support or the
        // user denies the permission prompt, so the map still renders.
        const fallbackLocation = {
            lat: 31.5497,
            lng: 74.3436
        };

        if (!navigator.geolocation) {
            setUserLocation(fallbackLocation);
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setLoading(false);
            },
            () => {
                setUserLocation(fallbackLocation);
                setLoading(false);
            }
        );
    }, []);

    useEffect(() => {
        if (!userLocation) return;

        const getRoute = async () => {
            try {
                const url =
                    `https://router.project-osrm.org/route/v1/driving/` +
                    `${userLocation.lng},${userLocation.lat};` +
                    `${destination.lng},${destination.lat}` +
                    `?overview=full&geometries=geojson`;

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error("Route request failed");
                }

                const data = await response.json();

                const routeCoordinates =
                    data.routes[0].geometry.coordinates.map(
                        ([lng, lat]) => [lat, lng]
                    );

                setRoute(routeCoordinates);

                setDistance(
                    (data.routes[0].distance / 1000).toFixed(2)
                );
            }
            catch (error) {
                console.error(error);
                setError("Unable to calculate route.");
            }
        };

        getRoute();
    }, [userLocation]);

    if (loading) {
        return (
            <div className="page-console">
                <div className="console-shell console-shell-narrow">
                    <p className="activity-empty">Getting your location...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-console">
                <div className="console-shell console-shell-narrow">
                    <p className="error">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-console">
            <div className="console-shell">
                <div className="console-topbar">
                    <div className="console-topbar-text">
                        <span className="console-tag">Route</span>
                        <h1>My Location &amp; Route</h1>
                        {userLocation && (
                            <p>Distance to destination: {distance} km</p>
                        )}
                    </div>
                    <div className="console-topbar-actions">
                        <Link to="/" className="pill-link">Home</Link>
                    </div>
                </div>

                <div className="map-frame">
                    <MapContainer
                        center={userLocation}
                        zoom={13}
                        style={{
                            height: "500px",
                            width: "100%"
                        }}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <RecenterMap position={userLocation} />

                        <Marker
                            position={[
                                userLocation.lat,
                                userLocation.lng
                            ]}
                            icon={defaultIcon}
                        >
                            <Popup>
                                You are here
                            </Popup>
                        </Marker>

                        <Marker
                            position={[
                                destination.lat,
                                destination.lng
                            ]}
                            icon={defaultIcon}
                        >
                            <Popup>
                                Destination
                            </Popup>
                        </Marker>

                        {route.length > 0 && (
                            <Polyline positions={route} />
                        )}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default Map;
