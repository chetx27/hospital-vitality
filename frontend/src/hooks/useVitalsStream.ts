import { useEffect, useContext, useRef } from 'react'
import { VitalsContext } from '../context/VitalsContext'
import { PatientVitals, AnalyticsSummary } from '../types/vitals'

const API_BASE = import.meta.env.VITE_API_URL ?? ''
const CRITICAL_ALERT_THROTTLE = 25000 // 25 seconds in milliseconds

export function useVitalsStream() {
  const context = useContext(VitalsContext)
  const lastCriticalAlertTime = useRef<number>(0)
  
  if (!context) throw new Error('Must be inside VitalsProvider')
  const { dispatch } = context

  useEffect(() => {
    fetch(`${API_BASE}/api/vitals/patients`)
      .then(res => res.json())
      .then((data: PatientVitals[]) => {
        if (data && data.length > 0) {
          dispatch({ type: 'SEED_PATIENTS', payload: data })
        }
      })
      .catch(console.error)

    const fetchAnalytics = () => {
      fetch(`${API_BASE}/api/vitals/analytics`)
        .then(res => res.json())
        .then((data: AnalyticsSummary) => {
          dispatch({ type: 'UPDATE_ANALYTICS', payload: data })
        })
        .catch(console.error)
    }
    fetchAnalytics()
    const analyticsInterval = setInterval(fetchAnalytics, 2000)

    const es = new EventSource(`${API_BASE}/api/vitals/stream`)

    es.onopen = () => dispatch({ type: 'SET_CONNECTED', payload: true })
    es.onerror = () => dispatch({ type: 'SET_CONNECTED', payload: false })

    es.onmessage = (e) => {
      try {
        const data: PatientVitals = JSON.parse(e.data)
        dispatch({ type: 'UPDATE_PATIENT', payload: data })
        if (data.alerts && data.alerts.length > 0) {
          const formattedAlerts = data.alerts.map(a => ({
            ...a,
            patientId: data.patientId,
            patientName: data.name
          }))
          dispatch({ type: 'ADD_ALERTS', payload: formattedAlerts })
          
          const critical = formattedAlerts.find(a => a.severity === 'critical')
          if (critical) {
            // Throttle critical alerts to max one every 25 seconds
            const now = Date.now()
            if (now - lastCriticalAlertTime.current >= CRITICAL_ALERT_THROTTLE) {
              dispatch({ type: 'SET_CRITICAL_EVENT', payload: { patient: data, alert: critical } })
              lastCriticalAlertTime.current = now
            }
          }
        }
      } catch (err) {
        console.error('Error parsing SSE', err)
      }
    }

    return () => {
      es.close()
      clearInterval(analyticsInterval)
    }
  }, [dispatch])
}
