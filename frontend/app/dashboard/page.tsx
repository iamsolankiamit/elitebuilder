import { AuthGuard } from '@/components/auth/auth-guard';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <AuthGuard>
          <div className="container py-12">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card-hover p-6 bg-card rounded-lg border">
                  <h3 className="font-semibold mb-2">My Submissions</h3>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Active submissions</p>
                </div>
                
                <div className="card-hover p-6 bg-card rounded-lg border">
                  <h3 className="font-semibold mb-2">Career Score</h3>
                  <p className="text-2xl font-bold">1,250</p>
                  <p className="text-sm text-muted-foreground">Your current rating</p>
                </div>
                
                <div className="card-hover p-6 bg-card rounded-lg border">
                  <h3 className="font-semibold mb-2">Challenges Won</h3>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-sm text-muted-foreground">Competitions completed</p>
                </div>
              </div>
              
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-card rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">AI Product Recommendation Challenge</h4>
                        <p className="text-sm text-muted-foreground">Submission under review</p>
                      </div>
                      <span className="text-sm text-orange-500">Pending</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-card rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Computer Vision Challenge</h4>
                        <p className="text-sm text-muted-foreground">Scored 95/100</p>
                      </div>
                      <span className="text-sm text-green-500">Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AuthGuard>
      </main>
      <Footer />
    </div>
  );
} 