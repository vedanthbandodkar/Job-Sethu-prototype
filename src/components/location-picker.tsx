
"use client"

import { useState, useRef, useMemo } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from "use-places-autocomplete";
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
import { LocateFixed, Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

type LocationPickerProps = {
  onClose: () => void;
  onLocationSelect: (lat: number, lng: number) => void;
};

const defaultCenter = {
  lat: 15.4989,
  lng: 73.8278
};

const libraries: ("places")[] = ["places"];

export function LocationPicker({
  onClose,
  onLocationSelect,
}: LocationPickerProps) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleMapsApiKey || "",
    libraries,
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  const [markerPosition, setMarkerPosition] =
    useState<{ lat: number, lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();

    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            componentRestrictions: { country: "in" }, // Bias to India
        },
        debounce: 300,
    });

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setMarkerPosition(newPos);
      setValue(e.latLng.toString(), false); // Update input field, but don't re-fetch
      clearSuggestions();
    }
  };
  
  const handleSelect = async (address: string) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      setMarkerPosition({ lat, lng });
      mapRef.current?.panTo({ lat, lng });
      mapRef.current?.setZoom(15);
    } catch (error) {
      console.error("Error: ", error);
      toast({
        variant: "destructive",
        title: "Error fetching location",
        description: "Could not get coordinates for the selected address.",
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
                setValue(`${newPos.lat}, ${newPos.lng}`, false);
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
  
  const renderContent = () => {
    if (!googleMapsApiKey) {
        return (
          <div className="flex items-center justify-center h-full text-destructive text-center p-4">
            <div>
              <p className="font-semibold">Configuration Error</p>
              <p className="text-sm">Google Maps API key is missing. Please add it to your environment variables.</p>
            </div>
          </div>
        );
    }

    if (loadError) {
      return (
        <div className="flex items-center justify-center h-full text-destructive text-center p-4">
          <div>
            <p className="font-semibold">Map Loading Error</p>
            <p className="text-sm">Could not load Google Maps. The API key might be invalid or missing required APIs (Maps JavaScript API, Places API).</p>
          </div>
        </div>
      );
    }

    if (!isLoaded) {
      return <Skeleton className="h-full w-full" />;
    }

    return (
        <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
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
    );
  }


  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent forceMount className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select a Location</DialogTitle>
          <DialogDescription>
            Search for an address or click on the map to place a marker.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
            <div className="absolute top-2 left-2 z-10 w-[calc(100%-1rem)]">
                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={!ready}
                    placeholder="Type an address to search..."
                    className="shadow-md"
                />
                {status === "OK" && (
                    <div className="bg-background rounded-md shadow-md mt-1 border absolute w-full">
                    {data.map(({ place_id, description }) => (
                        <div
                            key={place_id}
                            onClick={() => handleSelect(description)}
                            className="p-2 cursor-pointer hover:bg-muted"
                        >
                            {description}
                        </div>
                    ))}
                    </div>
                )}
            </div>
            <div className="h-[400px] w-full rounded-md overflow-hidden bg-muted">
                {renderContent()}
            </div>
        </div>

        <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row gap-2">
           <Button variant="outline" onClick={handleGetCurrentLocation} disabled={isLocating || !isLoaded} className="w-full sm:w-auto">
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
    