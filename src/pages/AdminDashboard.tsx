import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout'; // Import DashboardLayout
import AllPeople from '../components/AllPeople'; // Import AllPeople component

const AdminDashboard: React.FC = () => {
  // Define sidebar options specifically for the Admin Dashboard
  const adminSidebarOptions = (
    <div style={{ display: 'grid', gap: '10px' }}>
      {/* Replace with actual admin options (buttons or links) */}
      <button className="btn btn-secondary">Manage Users</button>
      <button className="btn btn-secondary">View Reports</button>
      <button className="btn btn-secondary">Settings</button>
      {/* Add more admin options here */}
    </div>
  );

  return (
    <DashboardLayout sidebarOptions={adminSidebarOptions}> {/* Pass admin options to DashboardLayout */}
      {/* Replace placeholder content with AllPeople component */}
      <AllPeople />
    </DashboardLayout>
  );
};

export default AdminDashboard;