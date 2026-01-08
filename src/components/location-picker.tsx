"use client"

import { useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "./ui/skeleton";

type LocationPickerProps = {
  onClose: () => void;
  onLocationSelect: (lat: number, lng: number) => void;
};

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 15.4989,
  lng: 73.8278
};

export function LocationPicker({
  onClose,
  onLocationSelect,
}: LocationPickerProps) {
  const [markerPosition, setMarkerPosition] =
    useState<{ lat: number, lng: number } | null>(null);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setMarkerPosition({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    }
  };

  const handleConfirm = () => {
    if (markerPosition) {
      onLocationSelect(markerPosition.lat, markerPosition.lng);
      onClose();
    }
  };
  
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    return (
        <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="text-destructive">Configuration Error</DialogTitle>
                <DialogDescription>
                    The Google Maps API key is missing. Please add it to your environment variables to use this feature.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button onClick={onClose}>Close</Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    )
  }

  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent forceMount className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select a Location</DialogTitle>
          <DialogDescription>
            Click on the map to place a marker for the meeting point.
          </DialogDescription>
        </DialogHeader>

        <div className="h-[400px] w-full rounded-md overflow-hidden bg-muted">
            <LoadScript
                googleMapsApiKey={googleMapsApiKey}
                loadingElement={<Skeleton className="h-full w-full" />}
            >
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={defaultCenter}
                    zoom={13}
                    onClick={handleMapClick}
                    options={{
                        fullscreenControl: false,
                        mapTypeControl: false,
                        streetViewControl: false,
                    }}
                >
                {markerPosition && <Marker position={markerPosition} />}
                </GoogleMap>
            </LoadScript>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
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
