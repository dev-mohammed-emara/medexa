import MainLayout from '../components/layout/MainLayout'
import AppointmentTypesList from '../sections/AppointmentTypes/AppointmentTypesList'

const AppointmentTypes = () => {
  return (
    <MainLayout>
      <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <AppointmentTypesList />
      </div>
    </MainLayout>
  )
}

export default AppointmentTypes
