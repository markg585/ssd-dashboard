'use client'

import {
  useLoadScript,
  GoogleMap,
  Marker,
  InfoWindow,
  DirectionsService,
  DirectionsRenderer,
} from '@react-google-maps/api'
import { useEffect, useRef, useState, useCallback } from 'react'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

const defaultCenter = {
  lat: -28.0167,
  lng: 153.4,
}

type Lead = {
  id: string
  firstName: string
  lastName: string
  phone?: string
  address?: {
    street: string
    suburb: string
    state: string
    postcode: string
  }
  location?: {
    lat: number
    lng: number
  }
  geoError?: boolean
  status: string
}

export default function LeadMap() {
  const mapRef = useRef<google.maps.Map | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [routeMode, setRouteMode] = useState(false)
  const [routeStops, setRouteStops] = useState<Lead[]>([])
  const [directionsResult, setDirectionsResult] = useState<any>(null)
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null)

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  })

  useEffect(() => {
    const fetchLeads = async () => {
      const snap = await getDocs(collection(db, 'leads'))
      const data = snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Lead[]

      const leadsWithCoords = await Promise.all(
        data.map(async (lead) => {
          if (lead.location?.lat && lead.location?.lng) return lead

          const address = `${lead.address?.street}, ${lead.address?.suburb}, ${lead.address?.state} ${lead.address?.postcode}`
          const geoRes = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          )
          const geoData = await geoRes.json()
          const coords = geoData.results?.[0]?.geometry?.location

          if (coords) {
            await updateDoc(doc(db, 'leads', lead.id), {
              location: coords,
              geoError: false,
            })
            return { ...lead, location: coords, geoError: false }
          } else {
            await updateDoc(doc(db, 'leads', lead.id), {
              geoError: true,
            })
            return { ...lead, geoError: true }
          }
        })
      )

      setLeads(leadsWithCoords)
    }

    fetchLeads()
  }, [])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setMyLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
      })
    }
  }, [])

  const filteredLeads = leads.filter((l) => {
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    const matchSearch = `${l.firstName} ${l.lastName} ${l.address?.suburb}`.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const toggleStop = useCallback((lead: Lead) => {
    if (!routeMode) return
    setRouteStops((prev) => {
      const exists = prev.find((s) => s.id === lead.id)
      return exists ? prev.filter((s) => s.id !== lead.id) : [...prev, lead]
    })
  }, [routeMode])

  const directionsCallback = useCallback((res: any) => {
    if (res?.status === 'OK') {
      setDirectionsResult(res)
    }
  }, [])

  const openInGoogleMaps = () => {
    if (!routeStops.length || !myLocation) return
    const origin = `${myLocation.lat},${myLocation.lng}`
    const destination = `${routeStops[routeStops.length - 1].location!.lat},${routeStops[routeStops.length - 1].location!.lng}`
    const waypoints = routeStops
      .slice(0, -1)
      .map((s) => `${s.location!.lat},${s.location!.lng}`)
      .join('|')
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`
    window.open(url, '_blank')
  }

  const fitRouteBounds = () => {
    if (!mapRef.current || !directionsResult) return
    const bounds = new google.maps.LatLngBounds()
    directionsResult.routes[0].legs.forEach((leg: any) => {
      bounds.extend(leg.start_location)
      bounds.extend(leg.end_location)
    })
    mapRef.current.fitBounds(bounds)
  }

  const origin = myLocation
  const destination = routeStops[routeStops.length - 1]?.location
  const waypoints = routeStops.slice(0, -1).map((s) => ({
    location: s.location!,
    stopover: true,
  }))

  if (!isLoaded) return <p>Loading map...</p>

  return (
    <div className="h-full w-full p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
        <Input
          placeholder="Search name or suburb..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {['all', 'inquired', 'estimate started', 'quoted', 'accepted', 'declined'].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={routeMode ? 'default' : 'outline'}
          onClick={() => {
            setRouteMode(!routeMode)
            setRouteStops([])
            setDirectionsResult(null)
            setActiveLeadId(null)
          }}
        >
          {routeMode ? 'Exit Route Mode' : '📍 Plan Route'}
        </Button>
        {routeMode && directionsResult && (
          <>
            <Button variant="outline" onClick={openInGoogleMaps}>
              Open in Google Maps
            </Button>
            <Button variant="outline" onClick={fitRouteBounds}>
              Fit Route to View
            </Button>
          </>
        )}
      </div>

      <div className="h-[80vh] rounded-xl overflow-hidden">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={9}
          onLoad={(map) => {
            mapRef.current = map
          }}
          
        >
          {myLocation && (
            <Marker
              position={myLocation}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 6,
                fillColor: '#00f',
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 2,
              }}
            />
          )}

          {filteredLeads
            .filter((l) => l.location && !l.geoError)
            .map((lead) => (
              <Marker
                key={lead.id}
                position={lead.location!}
                onClick={() => {
                  setActiveLeadId(lead.id)
                  toggleStop(lead)
                }}
                label={
                  routeMode && !directionsResult && routeStops.find((s) => s.id === lead.id)
                    ? `${routeStops.findIndex((s) => s.id === lead.id) + 1}`
                    : undefined
                }
              />
            ))}

          {filteredLeads.map((lead) =>
            lead.id === activeLeadId ? (
              <InfoWindow
                key={lead.id}
                position={lead.location!}
                onCloseClick={() => setActiveLeadId(null)}
              >
                <div className="text-sm space-y-1 max-w-[200px]">
                  <strong>{lead.firstName} {lead.lastName}</strong>
                  <div>{lead.address?.street}, {lead.address?.suburb}</div>
                  <div>{lead.phone}</div>
                  <div>Status: {lead.status}</div>
                  {lead.geoError && <div className="text-red-500 text-xs">⚠️ Invalid address</div>}
                </div>
              </InfoWindow>
            ) : null
          )}

          {routeMode && origin && destination && (
            <DirectionsService
              options={{
                origin,
                destination,
                waypoints,
                travelMode: google.maps.TravelMode.DRIVING,
                optimizeWaypoints: true,
              }}
              callback={directionsCallback}
            />
          )}

          {directionsResult && (
            <DirectionsRenderer directions={directionsResult} options={{ preserveViewport: true }} />
          )}
        </GoogleMap>
      </div>
    </div>
  )
}



