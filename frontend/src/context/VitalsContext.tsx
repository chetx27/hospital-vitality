import React, { createContext, useReducer, ReactNode } from 'react'
import { PatientVitals, AlertEvent, AnalyticsSummary } from '../types/vitals'

interface State {
  patients: Record<string, PatientVitals>
  histories: Record<string, PatientVitals[]>
  alerts: AlertEvent[]
  analytics: AnalyticsSummary | null
  connected: boolean
  criticalEvent: { patient: PatientVitals; alert: AlertEvent } | null
}

type Action =
  | { type: 'UPDATE_PATIENT'; payload: PatientVitals }
  | { type: 'ADD_ALERTS'; payload: AlertEvent[] }
  | { type: 'UPDATE_ANALYTICS'; payload: AnalyticsSummary }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_CRITICAL_EVENT'; payload: { patient: PatientVitals; alert: AlertEvent } }
  | { type: 'CLEAR_CRITICAL_EVENT' }
  | { type: 'SEED_PATIENTS'; payload: PatientVitals[] }

const initialState: State = {
  patients: {},
  histories: {},
  alerts: [],
  analytics: null,
  connected: false,
  criticalEvent: null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SEED_PATIENTS': {
      const newPatients = { ...state.patients }
      const newHistories = { ...state.histories }
      action.payload.forEach(v => {
        newPatients[v.patientId] = v
        if (!newHistories[v.patientId]) newHistories[v.patientId] = []
        newHistories[v.patientId] = [...newHistories[v.patientId], v].slice(-30)
      })
      return { ...state, patients: newPatients, histories: newHistories }
    }
    case 'UPDATE_PATIENT': {
      const p = action.payload
      const history = state.histories[p.patientId] || []
      return {
        ...state,
        patients: { ...state.patients, [p.patientId]: p },
        histories: { ...state.histories, [p.patientId]: [...history, p].slice(-30) }
      }
    }
    case 'ADD_ALERTS':
      return { ...state, alerts: [...action.payload, ...state.alerts].slice(0, 100) }
    case 'UPDATE_ANALYTICS':
      return { ...state, analytics: action.payload }
    case 'SET_CONNECTED':
      return { ...state, connected: action.payload }
    case 'SET_CRITICAL_EVENT':
      return { ...state, criticalEvent: action.payload }
    case 'CLEAR_CRITICAL_EVENT':
      return { ...state, criticalEvent: null }
    default:
      return state
  }
}

export const VitalsContext = createContext<{
  state: State
  dispatch: React.Dispatch<Action>
  clearCritical: () => void
} | null>(null)

export function VitalsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  
  const clearCritical = () => dispatch({ type: 'CLEAR_CRITICAL_EVENT' })

  return (
    <VitalsContext.Provider value={{ state, dispatch, clearCritical }}>
      {children}
    </VitalsContext.Provider>
  )
}
