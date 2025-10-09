import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CreateJobForm from '@/components/jobs/CreateJobForm';
import ManageJobs from '@/components/jobs/ManageJobs';
import ManageApplications from '@/components/jobs/ManageApplications';
import TeamManagement from '@/components/admin/TeamManagement';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('create-job');

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Company Dashboard</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="create-job">Post New Job</TabsTrigger>
              <TabsTrigger value="manage-jobs">Manage Jobs</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="team">Team Members</TabsTrigger>
            </TabsList>

            <TabsContent value="create-job">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Job Posting</CardTitle>
                </CardHeader>
                <CardContent>
                  <CreateJobForm onSuccess={() => setActiveTab('manage-jobs')} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manage-jobs">
              <ManageJobs />
            </TabsContent>

            <TabsContent value="applications">
              <ManageApplications />
            </TabsContent>

            <TabsContent value="team">
              <TeamManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CompanyDashboard;
