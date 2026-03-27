import MainLayout from '../components/layout/MainLayout'
import AppointmentsList from '../sections/Appointments/AppointmentsList'

const Appointments = () => {
  return (
    <MainLayout>
      <div className="space-y-2">
        <AppointmentsList />
      </div>
    </MainLayout>
  )
}

export default Appointments
