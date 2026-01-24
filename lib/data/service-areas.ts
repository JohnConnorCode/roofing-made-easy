/**
 * Service Areas Data
 *
 * Geographic areas served by the company.
 */

export interface ServiceArea {
  id: string
  name: string
  state: string
  stateCode: string
  zipCodes?: string[]
  isMainArea?: boolean
}

export interface ServiceRegion {
  name: string
  description: string
  areas: ServiceArea[]
}

export const serviceRegions: ServiceRegion[] = [
  {
    name: 'Greater Austin Area',
    description: 'Our primary service region covering Austin and surrounding communities.',
    areas: [
      { id: 'austin', name: 'Austin', state: 'Texas', stateCode: 'TX', isMainArea: true },
      { id: 'round-rock', name: 'Round Rock', state: 'Texas', stateCode: 'TX' },
      { id: 'cedar-park', name: 'Cedar Park', state: 'Texas', stateCode: 'TX' },
      { id: 'georgetown', name: 'Georgetown', state: 'Texas', stateCode: 'TX' },
      { id: 'pflugerville', name: 'Pflugerville', state: 'Texas', stateCode: 'TX' },
      { id: 'leander', name: 'Leander', state: 'Texas', stateCode: 'TX' },
      { id: 'lakeway', name: 'Lakeway', state: 'Texas', stateCode: 'TX' },
      { id: 'bee-cave', name: 'Bee Cave', state: 'Texas', stateCode: 'TX' },
      { id: 'dripping-springs', name: 'Dripping Springs', state: 'Texas', stateCode: 'TX' },
      { id: 'buda', name: 'Buda', state: 'Texas', stateCode: 'TX' },
      { id: 'kyle', name: 'Kyle', state: 'Texas', stateCode: 'TX' },
      { id: 'manor', name: 'Manor', state: 'Texas', stateCode: 'TX' },
    ],
  },
  {
    name: 'Hill Country',
    description: 'Extended service area in the beautiful Texas Hill Country.',
    areas: [
      { id: 'marble-falls', name: 'Marble Falls', state: 'Texas', stateCode: 'TX' },
      { id: 'fredericksburg', name: 'Fredericksburg', state: 'Texas', stateCode: 'TX' },
      { id: 'johnson-city', name: 'Johnson City', state: 'Texas', stateCode: 'TX' },
      { id: 'wimberley', name: 'Wimberley', state: 'Texas', stateCode: 'TX' },
      { id: 'san-marcos', name: 'San Marcos', state: 'Texas', stateCode: 'TX' },
      { id: 'new-braunfels', name: 'New Braunfels', state: 'Texas', stateCode: 'TX' },
    ],
  },
  {
    name: 'Surrounding Counties',
    description: 'We also serve select areas in surrounding counties.',
    areas: [
      { id: 'travis-county', name: 'Travis County', state: 'Texas', stateCode: 'TX' },
      { id: 'williamson-county', name: 'Williamson County', state: 'Texas', stateCode: 'TX' },
      { id: 'hays-county', name: 'Hays County', state: 'Texas', stateCode: 'TX' },
      { id: 'bastrop-county', name: 'Bastrop County', state: 'Texas', stateCode: 'TX' },
      { id: 'caldwell-county', name: 'Caldwell County', state: 'Texas', stateCode: 'TX' },
    ],
  },
]

export function getAllServiceAreas(): ServiceArea[] {
  return serviceRegions.flatMap(region => region.areas)
}

export function getServiceAreaByName(name: string): ServiceArea | undefined {
  return getAllServiceAreas().find(
    area => area.name.toLowerCase() === name.toLowerCase()
  )
}

export function isInServiceArea(city: string, state: string): boolean {
  const areas = getAllServiceAreas()
  return areas.some(
    area =>
      area.name.toLowerCase() === city.toLowerCase() &&
      (area.state.toLowerCase() === state.toLowerCase() ||
        area.stateCode.toLowerCase() === state.toLowerCase())
  )
}
