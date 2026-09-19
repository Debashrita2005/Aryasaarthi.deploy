# Geo-Spatial Partner Locator & Router

## Goal
Help users find an authorized channel partner relevant to the selected scheme.

## Critical rule
Location proximity alone does NOT establish eligibility to process a particular application.

Routing requires:
1. authorized partner record
2. scheme compatibility
3. location
4. verified operational status when available
5. current capacity/fund-utilization status if the system has an authoritative feed

## Data states
UNKNOWN → do not claim available
VERIFIED_AVAILABLE → can show "verified available"
VERIFIED_LIMITED → show "limited/confirm first"
VERIFIED_UNAVAILABLE → do not route as available

## If live capacity data is unavailable
Show nearest authorized partner locations, but label:
"Live processing capacity is not available in our data. Please call before travelling."

## Geospatial query
PostGIS:
```sql
SELECT *,
       ST_Distance(
         geography(location),
         geography(ST_MakePoint(:lng, :lat))
       ) AS distance_m
FROM partners
WHERE operational_status = 'VERIFIED'
  AND :scheme = ANY(supported_scheme_codes)
ORDER BY distance_m
LIMIT 10;
```

## Privacy
If browser geolocation is used:
- request permission only after user asks for nearby partners
- do not store precise location
- use it transiently for the search
- provide state/district manual selection as an alternative

## Maps
Use an abstraction:
`MapProvider`
- geocode
- reverseGeocode
- directionsUrl
- renderMap

Do not tightly couple the application to one vendor.
