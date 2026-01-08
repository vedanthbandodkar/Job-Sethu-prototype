
"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLngExpression, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from './ui/button';

// Leaflet's default icon path might not work well with Next.js, so we fix it here.
const defaultIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
});

type LocationPickerProps = {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (lat: number, lng: number) => void;
};

const LocationMarker = ({ position, setPosition }: { position: LatLngExpression | null, setPosition: (pos: LatLngExpression) => void }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={defaultIcon}></Marker>
  );
};

export function LocationPicker({ isOpen, onClose, onLocationSelect }: LocationPickerProps) {
  const [markerPosition, setMarkerPosition] = useState<LatLngExpression | null>(null);
  const [mapCenterKey, setMapCenterKey] = useState(Date.now());
  const defaultCenter: LatLngExpression = [15.4989, 73.8278]; // Centered on Goa

  useEffect(() => {
    if (isOpen) {
      setMarkerPosition(null); // Reset position when dialog opens
      setMapCenterKey(Date.now()); // Force re-render of map
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (markerPosition && 'lat' in markerPosition && 'lng' in markerPosition) {
      onLocationSelect(markerPosition.lat, markerPosition.lng);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select a Location</DialogTitle>
          <DialogDescription>
            Click on the map to place a marker for the meeting point.
          </DialogDescription>
        </DialogHeader>
        <div className="h-[400px] w-full rounded-md overflow-hidden">
            {isOpen && (
                 <MapContainer key={mapCenterKey} center={defaultCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={markerPosition} setPosition={setMarkerPosition} />
                </MapContainer>
            )}
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={!markerPosition}>Confirm Location</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

