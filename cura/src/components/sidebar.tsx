import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { Activity, FileText, Home, Utensils,ScanIcon as Scanner, Settings } from 'lucide-react'

const sidebar = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-6 shadow-lg rounded-r-lg">
        <h1 className="text-2xl font-bold mb-6 text-blue-600"> CURA.AI</h1>
        <nav className="space-y-4">
          <Link href='/dashboard'><Button variant="ghost" className="w-full justify-start"><Home className="mr-2 h-5 w-5" />Dashboard</Button></Link>
          <Link href='/meal-planner'><Button variant="ghost" className="w-full justify-start"><Utensils className="mr-2 h-5 w-5" />Meal Planner</Button></Link>
          <Link href='/nutrition-tracker'><Button variant="ghost" className="w-full justify-start"><Activity className="mr-2 h-5 w-5" />Nutrition Tracker</Button></Link>
          <Link href='/health-reports'><Button variant="ghost" className="w-full justify-start"><FileText className="mr-2 h-5 w-5" />Health Reports</Button></Link>
          <Link href='/food-scanner'><Button variant="ghost" className="w-full justify-start"><Scanner className="mr-2 h-5 w-5" />Food Scanner</Button></Link>
          <Link href='/settings'><Button variant="ghost" className="w-full justify-start"><Settings className="mr-2 h-5 w-5" />Settings</Button></Link>
        </nav>
      </aside>
</div>
  )
}

export default sidebar