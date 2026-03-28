import MainLayout from '../components/layout/MainLayout'
import ChartsOverview from '../sections/Dashboard/ChartsOverview'
import DashboardHeader from '../sections/Dashboard/DashboardHeader'
import StatsOverview from '../sections/Dashboard/StatsOverview'

const Dashboard = () => {
  return (
    <MainLayout>
      <div className="space-y-2">
        <DashboardHeader />
        <StatsOverview />
        <ChartsOverview />
      </div>
    </MainLayout>
  )
}

export default Dashboard
