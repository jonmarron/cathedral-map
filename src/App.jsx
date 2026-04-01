import React, { useState, useEffect } from 'react'
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
  Francia:    '#e63946',
  Inglaterra: '#2a9d8f',
  España:     '#f4a261',
  Alemania:   '#6a4c93',
}

const EPOCHS = {
  'Primer Gótico': {
    type: 'routes',
    center: [49.05, 3.0],
    zoom: 8,
    paris: {
      startYear: 1163,
      cathedral: 'Catedral de Notre-Dame de París',
      dates: '1163–1345',
      note: 'Origen de las rutas del Primer Gótico.',
      wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Notre-Dame_de_Par%C3%ADs',
    },
    destinations: [
      {
        name: 'Sens', startYear: 1135,
        coords: [48.1973, 3.2839],
        cathedral: 'Catedral de Saint-Étienne de Sens',
        dates: '1135–1176',
        note: 'La primera catedral gótica del mundo, pionera en bóvedas de crucería y arcos apuntados.',
        wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Sens',
      },
      {
        name: 'Noyon', startYear: 1150,
        coords: [49.5800, 2.9986],
        cathedral: 'Catedral de Notre-Dame de Noyon',
        dates: '1150–1290',
        note: 'Catedral de transición románico-gótica con una innovadora elevación de cuatro pisos.',
        wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Noyon',
      },
      {
        name: 'Senlis', startYear: 1151,
        coords: [49.2072, 2.5870],
        cathedral: 'Catedral de Notre-Dame de Senlis',
        dates: '1151–1191',
        note: 'Refinamiento del gótico inicial completado en ~40 años, con una característica aguja del siglo XIII.',
        wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Senlis',
      },
      {
        name: 'Laon', startYear: 1160,
        coords: [49.5628, 3.6243],
        cathedral: 'Catedral de Notre-Dame de Laon',
        dates: '1160–1235',
        note: 'Obra maestra del gótico inicial con elaborada escultura y disposición espacial innovadora.',
        wiki: 'https://es.wikipedia.org/wiki/Catedral_de_La%C3%B3n',
      },
      {
        name: 'Soissons', startYear: 1176,
        coords: [49.3817, 3.3236],
        cathedral: 'Catedral de Saint-Gervais-et-Saint-Protais de Soissons',
        dates: '1176–1479',
        note: 'Pionera en un triforio excepcionalmente alto y un diseño de coro innovador.',
        wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Soissons',
      },
    ],
  },
  'Gótico Clásico': {
    type: 'locations',
    center: [48.5, 2.0],
    zoom: 5,
    groups: [
      {
        country: 'Francia',
        locations: [
          {
            name: 'Chartres', startYear: 1194,
            coords: [48.4469, 1.4894],
            cathedral: 'Catedral de Notre-Dame de Chartres',
            dates: '1194–1220',
            note: 'Obra maestra del gótico alto reconstruida tras un incendio, con incomparables vidrieras medievales.',
            wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Chartres',
          },
          {
            name: 'Amiens', startYear: 1220,
            coords: [49.8942, 2.2957],
            cathedral: 'Catedral de Notre-Dame de Amiens',
            dates: '1220–1270',
            note: 'La catedral gótica más grande de Francia, cúspide del gótico alto con proporciones sublimes.',
            wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Amiens',
          },
          {
            name: 'Reims', startYear: 1211,
            coords: [49.2583, 4.0317],
            cathedral: 'Catedral de Notre-Dame de Reims',
            dates: '1211–1275',
            note: 'Catedral de coronación de los reyes de Francia, epítome de la elegancia del gótico alto.',
            wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Reims',
          },
          {
            name: 'Bourges', startYear: 1195,
            coords: [47.0810, 2.3980],
            cathedral: 'Catedral de Saint-Étienne de Bourges',
            dates: '1195–1324',
            note: 'Plan innovador sin crucero, creando una experiencia espacial unificada de gran ingeniería.',
            wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Bourges',
          },
          {
            name: 'Coutances', startYear: 1210,
            coords: [49.0453, -1.4479],
            cathedral: 'Catedral de Notre-Dame de Coutances',
            dates: '1210–1274',
            note: 'Estilo gótico normando distintivo con fuerte énfasis vertical.',
            wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Coutances',
          },
        ],
      },
      {
        country: 'Inglaterra',
        locations: [
          {
            name: 'Durham', startYear: 1093,
            coords: [54.7753, -1.5849],
            cathedral: 'Catedral de Durham',
            dates: '1093–1133',
            note: 'Catedral normanda pionera en la bóveda de crucería apuntada, enriquecida con añadidos góticos.',
            wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Durham',
          },
          {
            name: 'Canterbury', startYear: 1175,
            coords: [51.2802, 1.0789],
            cathedral: 'Catedral de Canterbury',
            dates: '1175–1498',
            note: 'El coro gótico fue reconstruido por el maestro francés Guillermo de Sens tras el incendio de 1174.',
            wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Canterbury',
          },
          {
            name: 'Salisbury', startYear: 1220,
            coords: [51.0693, -1.7944],
            cathedral: 'Catedral de Salisbury',
            dates: '1220–1320',
            note: 'Gótico inglés primitivo construido en 38 años; posee la aguja medieval más alta de Gran Bretaña.',
            wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Salisbury',
          },
          {
            name: 'Wells', startYear: 1175,
            coords: [51.2094, -2.6479],
            cathedral: 'Catedral de Wells',
            dates: '1175–1490',
            note: 'La primera catedral de Inglaterra construida íntegramente en estilo gótico desde sus cimientos.',
            wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Wells',
          },
        ],
      },
      {
        country: 'España',
        locations: [
          {
            name: 'Cuenca', startYear: 1182,
            coords: [40.0704, -2.1374],
            cathedral: 'Catedral de Santa María y San Julián de Cuenca',
            dates: '1182–1257',
            note: 'La primera catedral gótica de España, que introdujo los principios del gótico francés.',
            wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Cuenca_(Espa%C3%B1a)',
          },
          {
            name: 'Ávila', startYear: 1172,
            coords: [40.6564, -4.6976],
            cathedral: 'Catedral de San Salvador de Ávila',
            dates: '1172–1470s',
            note: 'Una de las primeras catedrales góticas españolas, construida de forma única como catedral-fortaleza.',
            wiki: 'https://es.wikipedia.org/wiki/Catedral_de_%C3%81vila',
          },
          {
            name: 'Burgos', startYear: 1221,
            coords: [42.3440, -3.6969],
            cathedral: 'Catedral de Santa María de Burgos',
            dates: '1221–1567',
            note: 'La primera y más rica catedral gótica de España, con estilos del gótico primitivo al flamígero.',
            wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Burgos',
          },
          {
            name: 'Toledo', startYear: 1226,
            coords: [39.8628, -4.0273],
            cathedral: 'Catedral de Santa María de Toledo',
            dates: '1226–1493',
            note: 'Considerada la obra maestra del gótico español con un innovador plano de cinco naves.',
            wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Toledo',
          },
          {
            name: 'León', startYear: 1205,
            coords: [42.5987, -5.5671],
            cathedral: 'Catedral de Santa María de Regla de León',
            dates: '1205–1301',
            note: 'Famosa por casi 1.800 m² de excepcionales vidrieras de los siglos XIII al XV.',
            wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Le%C3%B3n',
          },
          {
            name: 'Córdoba', startYear: 1236,
            coords: [37.8882, -4.7794],
            cathedral: 'Mezquita-Catedral de Córdoba',
            dates: 'conv. 1236',
            note: 'Convertida de una gran mezquita del siglo VIII, con capillas y modificaciones góticas añadidas.',
            wiki: 'https://es.wikipedia.org/wiki/Mezquita-catedral_de_C%C3%B3rdoba',
          },
          {
            name: 'Sevilla', startYear: 1402,
            coords: [37.3891, -5.9845],
            cathedral: 'Catedral de Santa María de la Sede de Sevilla',
            dates: '1402–1507',
            note: 'La catedral gótica más grande del mundo, construida en una única campaña constructiva.',
            wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Sevilla',
          },
        ],
      },
      {
        country: 'Alemania',
        locations: [
          {
            name: 'Köln', startYear: 1248,
            coords: [50.9333, 6.9500],
            cathedral: 'Catedral de Colonia (Dom de Colonia)',
            dates: '1248–1880',
            note: 'La catedral gótica más grande de Alemania, modelada según el gótico alto del norte de Francia.',
            wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Colonia',
          },
          {
            name: 'Bamberg', startYear: 1215,
            coords: [49.8988, 10.9028],
            cathedral: 'Catedral de Bamberg',
            dates: '1215–1237',
            note: 'Catedral de transición románico-gótica con elementos góticos primitivos en el coro occidental.',
            wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Bamberg',
          },
          {
            name: 'Strasbourg', startYear: 1015,
            coords: [48.5734, 7.7521],
            cathedral: 'Catedral de Notre-Dame de Estrasburgo',
            dates: '1015–1439',
            note: 'Obra maestra del gótico radiante con una revolucionaria aguja calada de Erwin von Steinbach.',
            wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Estrasburgo',
          },
          {
            name: 'Freiburg', startYear: 1200,
            coords: [47.9990, 7.8421],
            cathedral: 'Catedral de Friburgo de Brisgovia (Freiburger Münster)',
            dates: '1200–1513',
            note: 'Posee la única aguja de torre gótica medieval completada de Alemania, una maravilla calada de 46 m.',
            wiki: 'https://es.wikipedia.org/wiki/Catedral_de_Friburgo_de_Brisgovia',
          },
        ],
      },
    ],
  },
}

const TIMELINE_PADDING = 25

function getYearRange(epoch) {
  if (epoch.type === 'routes') {
    const years = [epoch.paris.startYear, ...epoch.destinations.map(d => d.startYear)]
    return [Math.min(...years) - TIMELINE_PADDING, Math.max(...years) + TIMELINE_PADDING]
  }
  const years = epoch.groups.flatMap(g => g.locations.map(l => l.startYear))
  return [Math.min(...years) - TIMELINE_PADDING, Math.max(...years) + TIMELINE_PADDING]
}

export default function App() {
  const [activeTab, setActiveTab] = useState('Primer Gótico')
  const epoch = EPOCHS[activeTab]
  const [minYear, maxYear] = getYearRange(epoch)
  const [currentYear, setCurrentYear] = useState(maxYear)

  useEffect(() => {
    const [, max] = getYearRange(EPOCHS[activeTab])
    setCurrentYear(max)
  }, [activeTab])

  const built = (startYear) => startYear <= currentYear

  return (
    <div className="app">
      <header className="header">
        <h1>Arquitectura Gótica</h1>
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
            <Marker position={PARIS} opacity={built(epoch.paris.startYear) ? 1 : 0.5}>
              <Popup>
                <div className="popup">
                  <div className="popup-city">París</div>
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
                  pathOptions={{
                    color: ROUTE_COLORS[i % ROUTE_COLORS.length],
                    weight: 2,
                    dashArray: '6 4',
                    opacity: built(dest.startYear) ? 0.8 : 0.2,
                  }}
                />
                <Marker position={dest.coords} opacity={built(dest.startYear) ? 1 : 0.5}>
                  <Popup>
                    <div className="popup">
                      <div className="popup-city">París → {dest.name}</div>
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
            <Marker key={loc.name} position={loc.coords} opacity={built(loc.startYear) ? 1 : 0.5}>
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
            París → {dest.name}
          </div>
        ))}
        {epoch.type === 'locations' && epoch.groups.map(group => (
          <div key={group.country} className="legend-item">
            <span className="legend-dot" style={{ background: COUNTRY_COLORS[group.country] }} />
            {group.country} ({group.locations.length})
          </div>
        ))}
      </div>

      <div className="timeline">
        <span className="timeline-label">Año</span>
        <span className="timeline-bound">{minYear}</span>
        <div className="timeline-slider-wrap">
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={currentYear}
            onChange={e => setCurrentYear(Number(e.target.value))}
            className="timeline-slider"
          />
          <div className="timeline-controls">
            <button className="timeline-btn" onClick={() => setCurrentYear(y => Math.max(minYear, y - 5))}>−5</button>
            <button className="timeline-btn" onClick={() => setCurrentYear(y => Math.max(minYear, y - 1))}>−1</button>
            <div className="timeline-year">{currentYear}</div>
            <button className="timeline-btn" onClick={() => setCurrentYear(y => Math.min(maxYear, y + 1))}>+1</button>
            <button className="timeline-btn" onClick={() => setCurrentYear(y => Math.min(maxYear, y + 5))}>+5</button>
          </div>
        </div>
        <span className="timeline-bound">{maxYear}</span>
      </div>
    </div>
  )
}
