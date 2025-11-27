import { useState, useEffect } from 'react';

import { useAuth } from '@/components/AuthProvider';
import { useUserCompanies } from '@/hooks/useUserCompanies';
import { useCompanyRole } from '@/hooks/useCompanyRole';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CreateJobForm from '@/components/jobs/CreateJobForm';
import ManageJobs from '@/components/jobs/ManageJobs';
import ManageApplications from '@/components/jobs/ManageApplications';
import TeamManagement from '@/components/admin/TeamManagement';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const { companies, loading: companiesLoading } = useUserCompanies();
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const { role, canManageTeam, canManageJobs, canViewApplications, loading: roleLoading } = useCompanyRole(selectedCompanyId);
  const [activeTab, setActiveTab] = useState('create-job');

  // Auto-select first company when companies load
  useEffect(() => {
    if (companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  if (companiesLoading || roleLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  if (companies.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background pt-16">
          <div className="container mx-auto px-4 py-8">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are not a member of any company. Please contact your administrator to be added to a company.
              </AlertDescription>
            </Alert>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Company Dashboard</h1>
            
            {companies.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Company:</span>
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name} ({company.userRole})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {selectedCompany && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{selectedCompany.name}</h2>
                    {selectedCompany.description && (
                      <p className="text-muted-foreground">{selectedCompany.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Your Role</p>
                    <p className="font-semibold capitalize">{role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              {canManageJobs && <TabsTrigger value="create-job">Post New Job</TabsTrigger>}
              {canManageJobs && <TabsTrigger value="manage-jobs">Manage Jobs</TabsTrigger>}
              {canViewApplications && <TabsTrigger value="applications">Applications</TabsTrigger>}
              {canManageTeam && <TabsTrigger value="team">Team Members</TabsTrigger>}
            </TabsList>

            {canManageJobs && (
              <TabsContent value="create-job">
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Job Posting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CreateJobForm 
                      companyId={selectedCompanyId} 
                      onSuccess={() => setActiveTab('manage-jobs')} 
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {canManageJobs && (
              <TabsContent value="manage-jobs">
                <ManageJobs companyId={selectedCompanyId} />
              </TabsContent>
            )}

            {canViewApplications && (
              <TabsContent value="applications">
                <ManageApplications companyId={selectedCompanyId} />
              </TabsContent>
            )}

            {canManageTeam && (
              <TabsContent value="team">
                <TeamManagement companyId={selectedCompanyId} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CompanyDashboard;
