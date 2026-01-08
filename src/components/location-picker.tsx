
"use client"

import { useState, useRef } from "react";
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
import { LocateFixed, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();
  
  const mapRef = useRef<google.maps.Map | null>(null);


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

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newPos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setMarkerPosition(newPos);
                if (mapRef.current) {
                    mapRef.current.panTo(newPos);
                    mapRef.current.setZoom(15);
                }
                setIsLocating(false);
            },
            () => {
                toast({
                    variant: "destructive",
                    title: "Location Access Denied",
                    description: "Please enable location services in your browser to use this feature.",
                });
                setIsLocating(false);
            }
        );
    } else {
        toast({
            variant: "destructive",
            title: "Geolocation Not Supported",
            description: "Your browser does not support geolocation.",
        });
        setIsLocating(false);
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
            Click on the map to place a marker, or use your current location.
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
                    onLoad={(map) => { mapRef.current = map }}
                    onUnmount={() => { mapRef.current = null }}
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

        <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row gap-2">
           <Button variant="outline" onClick={handleGetCurrentLocation} disabled={isLocating} className="w-full sm:w-auto">
                {isLocating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LocateFixed className="mr-2 h-4 w-4" />}
                Use My Location
            </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!markerPosition} className="w-full sm:w-auto">
                Confirm Location
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
