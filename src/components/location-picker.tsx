"use client"

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { LatLngExpression, Icon, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const defaultIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

type LocationPickerProps = {
  onClose: () => void;
  onLocationSelect: (lat: number, lng: number) => void;
};

const LocationMarker = ({
  position,
  setPosition,
}: {
  position: LatLngExpression | null;
  setPosition: (pos: LatLngExpression) => void;
}) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} icon={defaultIcon} /> : null;
};

export function LocationPicker({
  onClose,
  onLocationSelect,
}: LocationPickerProps) {
  const [markerPosition, setMarkerPosition] =
    useState<LatLngExpression | null>(null);

  const mapRef = useRef<LeafletMap | null>(null);

  const defaultCenter: LatLngExpression = [15.4989, 73.8278];

  const handleConfirm = () => {
    if (markerPosition && "lat" in markerPosition) {
      onLocationSelect(markerPosition.lat, markerPosition.lng);
      handleClose();
    }
  };

  const handleClose = () => {
    if (mapRef.current) {
      mapRef.current.remove(); 
      mapRef.current = null;
    }
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select a Location</DialogTitle>
          <DialogDescription>
            Click on the map to place a marker for the meeting point.
          </DialogDescription>
        </DialogHeader>

        <div className="h-[400px] w-full rounded-md overflow-hidden">
          <MapContainer
            center={defaultCenter}
            zoom={13}
            scrollWheelZoom
            style={{ height: "100%", width: "100%" }}
            whenCreated={(map) => {
              mapRef.current = map;
            }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker
              position={markerPosition}
              setPosition={setMarkerPosition}
            />
          </MapContainer>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!markerPosition}>
            Confirm Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
