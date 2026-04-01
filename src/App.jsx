import React, { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import './App.css'

// Fix default marker icons broken by Vite's asset handling
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const PARIS = [48.8566, 2.3522]

const ROUTE_COLORS = ['#e63946', '#2a9d8f', '#e9c46a', '#f4a261', '#6a4c93']

const COUNTRY_COLORS = {
  France:  '#e63946',
  England: '#2a9d8f',
  Spain:   '#f4a261',
  Germany: '#6a4c93',
}

const EPOCHS = {
  'First Gothic': {
    type: 'routes',
    center: [49.05, 3.0],
    zoom: 8,
    paris: {
      cathedral: 'Cathédrale Notre-Dame de Paris',
      dates: '1163–1345',
      note: 'Origin of the First Gothic routes',
      wiki: 'https://en.wikipedia.org/wiki/Notre-Dame_de_Paris',
    },
    destinations: [
      {
        name: 'Sens',
        coords: [48.1973, 3.2839],
        cathedral: 'Cathédrale Saint-Étienne de Sens',
        dates: '1135–1176',
        note: "The world's first Gothic cathedral, pioneering ribbed vaults and pointed arches.",
        wiki: 'https://en.wikipedia.org/wiki/Sens_Cathedral',
      },
      {
        name: 'Noyon',
        coords: [49.5800, 2.9986],
        cathedral: 'Cathédrale Notre-Dame de Noyon',
        dates: '1150–1290',
        note: 'Transitional Romanesque-Gothic cathedral with an innovative four-story elevation.',
        wiki: 'https://en.wikipedia.org/wiki/Noyon_Cathedral',
      },
      {
        name: 'Senlis',
        coords: [49.2072, 2.5870],
        cathedral: 'Cathédrale Notre-Dame de Senlis',
        dates: '1151–1191',
        note: 'Early Gothic refinement completed in ~40 years, with a distinctive 13th-century spire.',
        wiki: 'https://en.wikipedia.org/wiki/Senlis_Cathedral',
      },
      {
        name: 'Laon',
        coords: [49.5628, 3.6243],
        cathedral: 'Cathédrale Notre-Dame de Laon',
        dates: '1160–1235',
        note: 'Early Gothic masterpiece with elaborate sculpture and innovative spatial arrangement.',
        wiki: 'https://en.wikipedia.org/wiki/Laon_Cathedral',
      },
      {
        name: 'Soissons',
        coords: [49.3817, 3.3236],
        cathedral: 'Cathédrale Saint-Gervais-et-Saint-Protais de Soissons',
        dates: '1176–1479',
        note: 'Pioneering exceptionally tall clerestory and an innovative choir design.',
        wiki: 'https://en.wikipedia.org/wiki/Soissons_Cathedral',
      },
    ],
  },
  'Classic Gothic': {
    type: 'locations',
    center: [48.5, 2.0],
    zoom: 5,
    groups: [
      {
        country: 'France',
        locations: [
          {
            name: 'Chartres',
            coords: [48.4469, 1.4894],
            cathedral: 'Cathédrale Notre-Dame de Chartres',
            dates: '1194–1220',
            note: 'High Gothic masterpiece rebuilt after a fire, with unmatched medieval stained glass.',
            wiki: 'https://en.wikipedia.org/wiki/Chartres_Cathedral',
          },
          {
            name: 'Amiens',
            coords: [49.8942, 2.2957],
            cathedral: "Cathédrale Notre-Dame d'Amiens",
            dates: '1220–1270',
            note: "France's largest Gothic cathedral, the apex of High Gothic with soaring proportions.",
            wiki: 'https://en.wikipedia.org/wiki/Amiens_Cathedral',
          },
          {
            name: 'Reims',
            coords: [49.2583, 4.0317],
            cathedral: 'Cathédrale Notre-Dame de Reims',
            dates: '1211–1275',
            note: 'Coronation cathedral of French kings, epitome of High Gothic elegance.',
            wiki: 'https://en.wikipedia.org/wiki/Reims_Cathedral',
          },
          {
            name: 'Bourges',
            coords: [47.0810, 2.3980],
            cathedral: "Cathédrale Saint-Étienne de Bourges",
            dates: '1195–1324',
            note: 'Innovative plan with no transepts, creating a unified spatial experience.',
            wiki: 'https://en.wikipedia.org/wiki/Bourges_Cathedral',
          },
          {
            name: 'Coutances',
            coords: [49.0453, -1.4479],
            cathedral: 'Cathédrale Notre-Dame de Coutances',
            dates: '1210–1274',
            note: 'Distinctive Norman Gothic style with strong vertical emphasis.',
            wiki: 'https://en.wikipedia.org/wiki/Coutances_Cathedral',
          },
        ],
      },
      {
        country: 'England',
        locations: [
          {
            name: 'Durham',
            coords: [54.7753, -1.5849],
            cathedral: 'Durham Cathedral',
            dates: '1093–1133',
            note: 'Norman cathedral that pioneered the pointed rib vault, later enhanced with Gothic additions.',
            wiki: 'https://en.wikipedia.org/wiki/Durham_Cathedral',
          },
          {
            name: 'Canterbury',
            coords: [51.2802, 1.0789],
            cathedral: 'Canterbury Cathedral',
            dates: '1175–1498',
            note: 'Gothic choir rebuilt by French master William of Sens after the 1174 fire.',
            wiki: 'https://en.wikipedia.org/wiki/Canterbury_Cathedral',
          },
          {
            name: 'Salisbury',
            coords: [51.0693, -1.7944],
            cathedral: 'Salisbury Cathedral',
            dates: '1220–1320',
            note: 'Early English Gothic built in 38 years; has the tallest medieval spire in Britain.',
            wiki: 'https://en.wikipedia.org/wiki/Salisbury_Cathedral',
          },
          {
            name: 'Wells',
            coords: [51.2094, -2.6479],
            cathedral: 'Wells Cathedral',
            dates: '1175–1490',
            note: 'The first cathedral in England built entirely in Gothic style from its foundation.',
            wiki: 'https://en.wikipedia.org/wiki/Wells_Cathedral',
          },
        ],
      },
      {
        country: 'Spain',
        locations: [
          {
            name: 'Cuenca',
            coords: [40.0704, -2.1374],
            cathedral: 'Catedral de Santa María y San Julián de Cuenca',
            dates: '1182–1257',
            note: "The first Gothic cathedral in Spain, introducing French Gothic principles.",
            wiki: 'https://en.wikipedia.org/wiki/Cuenca_Cathedral',
          },
          {
            name: 'Ávila',
            coords: [40.6564, -4.6976],
            cathedral: 'Catedral de San Salvador de Ávila',
            dates: '1172–1470s',
            note: 'One of the earliest Spanish Gothic cathedrals, uniquely built as a cathedral-fortress.',
            wiki: 'https://en.wikipedia.org/wiki/%C3%81vila_Cathedral',
          },
          {
            name: 'Burgos',
            coords: [42.3440, -3.6969],
            cathedral: 'Catedral de Santa María de Burgos',
            dates: '1221–1567',
            note: 'The first and richest Gothic cathedral in Spain, spanning Early to Flamboyant Gothic.',
            wiki: 'https://en.wikipedia.org/wiki/Burgos_Cathedral',
          },
          {
            name: 'Toledo',
            coords: [39.8628, -4.0273],
            cathedral: 'Catedral de Santa María de Toledo',
            dates: '1226–1493',
            note: 'Considered the magnum opus of Spanish Gothic with an innovative five-nave plan.',
            wiki: 'https://en.wikipedia.org/wiki/Toledo_Cathedral',
          },
          {
            name: 'León',
            coords: [42.5987, -5.5671],
            cathedral: 'Catedral de Santa María de Regla de León',
            dates: '1205–1301',
            note: 'Famous for nearly 1,800 m² of exceptional stained glass from the 13th–15th centuries.',
            wiki: 'https://en.wikipedia.org/wiki/Le%C3%B3n_Cathedral',
          },
          {
            name: 'Córdoba',
            coords: [37.8882, -4.7794],
            cathedral: 'Catedral de la Asunción de Nuestra Señora (Mezquita-Catedral)',
            dates: 'conv. 1236',
            note: 'Converted from a grand 8th-century mosque, receiving Gothic chapels and modifications.',
            wiki: 'https://en.wikipedia.org/wiki/Mosque%E2%80%93Cathedral_of_C%C3%B3rdoba',
          },
          {
            name: 'Sevilla',
            coords: [37.3891, -5.9845],
            cathedral: 'Catedral de Santa María de la Sede de Sevilla',
            dates: '1402–1507',
            note: "The world's largest Gothic cathedral, built in a single unified construction campaign.",
            wiki: 'https://en.wikipedia.org/wiki/Seville_Cathedral',
          },
        ],
      },
      {
        country: 'Germany',
        locations: [
          {
            name: 'Köln',
            coords: [50.9333, 6.9500],
            cathedral: 'Kölner Dom (Cathedral of Saint Peter)',
            dates: '1248–1880',
            note: "Germany's largest Gothic cathedral, modeled on northern French High Gothic.",
            wiki: 'https://en.wikipedia.org/wiki/Cologne_Cathedral',
          },
          {
            name: 'Bamberg',
            coords: [49.8988, 10.9028],
            cathedral: 'Bamberger Dom (Cathedral of St. Peter and St. George)',
            dates: '1215–1237',
            note: 'Transitional Romanesque-Gothic cathedral with early Gothic elements in the western choir.',
            wiki: 'https://en.wikipedia.org/wiki/Bamberg_Cathedral',
          },
          {
            name: 'Strasbourg',
            coords: [48.5734, 7.7521],
            cathedral: 'Cathédrale Notre-Dame de Strasbourg',
            dates: '1015–1439',
            note: 'Rayonnant Gothic masterpiece with a revolutionary openwork spire by Erwin von Steinbach.',
            wiki: 'https://en.wikipedia.org/wiki/Strasbourg_Cathedral',
          },
          {
            name: 'Freiburg',
            coords: [47.9990, 7.8421],
            cathedral: 'Freiburger Münster (Cathedral of Our Lady)',
            dates: '1200–1513',
            note: 'Has the only medieval-completed Gothic tower spire in Germany, a 46-metre openwork marvel.',
            wiki: 'https://en.wikipedia.org/wiki/Freiburg_Minster',
          },
        ],
      },
    ],
  },
}

export default function App() {
  const [activeTab, setActiveTab] = useState('First Gothic')
  const epoch = EPOCHS[activeTab]

  return (
    <div className="app">
      <header className="header">
        <h1>Gothic Architecture</h1>
        <nav className="tabs">
          {Object.keys(EPOCHS).map(name => (
            <button
              key={name}
              className={`tab${activeTab === name ? ' tab--active' : ''}`}
              onClick={() => setActiveTab(name)}
            >
              {name}
            </button>
          ))}
        </nav>
      </header>

      <MapContainer key={activeTab} center={epoch.center} zoom={epoch.zoom} className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {epoch.type === 'routes' && (
          <>
            <Marker position={PARIS}>
              <Popup>
                <div className="popup">
                  <div className="popup-city">Paris</div>
                  <div className="popup-cathedral">{epoch.paris.cathedral}</div>
                  <div className="popup-dates">{epoch.paris.dates}</div>
                  <div className="popup-note">{epoch.paris.note}</div>
                  <a className="popup-link" href={epoch.paris.wiki} target="_blank" rel="noopener noreferrer">Wikipedia →</a>
                </div>
              </Popup>
            </Marker>
            {epoch.destinations.map((dest, i) => (
              <React.Fragment key={dest.name}>
                <Polyline
                  positions={[PARIS, dest.coords]}
                  pathOptions={{ color: ROUTE_COLORS[i % ROUTE_COLORS.length], weight: 2, dashArray: '6 4', opacity: 0.8 }}
                />
                <Marker position={dest.coords}>
                  <Popup>
                    <div className="popup">
                      <div className="popup-city">Paris → {dest.name}</div>
                      <div className="popup-cathedral">{dest.cathedral}</div>
                      <div className="popup-dates">{dest.dates}</div>
                      <div className="popup-note">{dest.note}</div>
                      <a className="popup-link" href={dest.wiki} target="_blank" rel="noopener noreferrer">Wikipedia →</a>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}
          </>
        )}

        {epoch.type === 'locations' && epoch.groups.flatMap(group =>
          group.locations.map(loc => (
            <Marker key={loc.name} position={loc.coords}>
              <Popup>
                <div className="popup">
                  <div className="popup-city" style={{ color: COUNTRY_COLORS[group.country] }}>
                    {loc.name} · {group.country}
                  </div>
                  <div className="popup-cathedral">{loc.cathedral}</div>
                  <div className="popup-dates">{loc.dates}</div>
                  <div className="popup-note">{loc.note}</div>
                  <a className="popup-link" href={loc.wiki} target="_blank" rel="noopener noreferrer">Wikipedia →</a>
                </div>
              </Popup>
            </Marker>
          ))
        )}
      </MapContainer>

      <div className="legend">
        {epoch.type === 'routes' && epoch.destinations.map((dest, i) => (
          <div key={dest.name} className="legend-item">
            <span className="legend-dot" style={{ background: ROUTE_COLORS[i % ROUTE_COLORS.length] }} />
            Paris → {dest.name}
          </div>
        ))}

        {epoch.type === 'locations' && epoch.groups.map(group => (
          <div key={group.country} className="legend-item">
            <span className="legend-dot" style={{ background: COUNTRY_COLORS[group.country] }} />
            {group.country} ({group.locations.length})
          </div>
        ))}
      </div>
    </div>
  )
}
