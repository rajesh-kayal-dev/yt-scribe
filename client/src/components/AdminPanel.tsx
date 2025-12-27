import { motion } from 'motion/react';
import { Users, BookOpen, DollarSign, BarChart3, Settings, Shield, TrendingUp, UserCheck, Ban, Trash2, Check, X, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { Switch } from './ui/switch';

export function AdminPanel() {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active', premium: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'creator', status: 'active', premium: true },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'user', status: 'suspended', premium: false },
  ]);

  const [courses, setCourses] = useState([
    { id: 1, title: 'Web Development Bootcamp', creator: 'Jane Smith', students: 245, sales: 24500, status: 'approved' },
    { id: 2, title: 'React Mastery', creator: 'John Doe', students: 0, sales: 0, status: 'pending' },
    { id: 3, title: 'Python for Beginners', creator: 'Jane Smith', students: 189, sales: 18900, status: 'approved' },
  ]);

  const [systemSettings, setSystemSettings] = useState({
    adsEnabled: true,
    newsletterInterval: 60,
    maintenanceMode: false,
  });

  const stats = [
    { label: 'Total Users', value: '1,234', change: '+12%', icon: Users, color: 'text-blue-500' },
    { label: 'Active Courses', value: '89', change: '+5%', icon: BookOpen, color: 'text-purple-500' },
    { label: 'Total Revenue', value: '₹2.4L', change: '+23%', icon: DollarSign, color: 'text-green-500' },
    { label: 'Premium Users', value: '456', change: '+18%', icon: TrendingUp, color: 'text-orange-500' },
  ];

  const handleUserAction = (userId: number, action: 'suspend' | 'activate' | 'delete' | 'upgrade') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    switch (action) {
      case 'suspend':
        setUsers(users.map(u => u.id === userId ? { ...u, status: 'suspended' } : u));
        toast.success(`User ${user.name} suspended`);
        break;
      case 'activate':
        setUsers(users.map(u => u.id === userId ? { ...u, status: 'active' } : u));
        toast.success(`User ${user.name} activated`);
        break;
      case 'delete':
        setUsers(users.filter(u => u.id !== userId));
        toast.success(`User ${user.name} deleted`);
        break;
      case 'upgrade':
        setUsers(users.map(u => u.id === userId ? { ...u, role: 'creator' } : u));
        toast.success(`User ${user.name} upgraded to creator`);
        break;
    }
  };

  const handleCourseAction = (courseId: number, action: 'approve' | 'reject' | 'delete') => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    switch (action) {
      case 'approve':
        setCourses(courses.map(c => c.id === courseId ? { ...c, status: 'approved' } : c));
        toast.success(`Course "${course.title}" approved`);
        break;
      case 'reject':
        setCourses(courses.map(c => c.id === courseId ? { ...c, status: 'rejected' } : c));
        toast.success(`Course "${course.title}" rejected`);
        break;
      case 'delete':
        setCourses(courses.filter(c => c.id !== courseId));
        toast.success(`Course "${course.title}" deleted`);
        break;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Admin Panel
              </span>
            </h1>
            <p className="text-muted-foreground">System management & control center</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                  {stat.change}
                </Badge>
              </div>
              <p className="text-2xl mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen className="w-4 h-4 mr-2" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="payments">
            <DollarSign className="w-4 h-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Users Management */}
        <TabsContent value="users">
          <Card className="border-primary/20">
            <div className="p-6 border-b border-primary/10">
              <h2 className="text-xl">User Management</h2>
              <p className="text-sm text-muted-foreground">View and manage all users</p>
            </div>
            <div className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'creator' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.premium ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {user.status === 'active' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user.id, 'suspend')}
                            >
                              <Ban className="w-3 h-3 mr-1" />
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user.id, 'activate')}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Activate
                            </Button>
                          )}
                          {user.role !== 'creator' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user.id, 'upgrade')}
                            >
                              <UserCheck className="w-3 h-3 mr-1" />
                              Creator
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction(user.id, 'delete')}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Courses Management */}
        <TabsContent value="courses">
          <Card className="border-primary/20">
            <div className="p-6 border-b border-primary/10">
              <h2 className="text-xl">Course Management</h2>
              <p className="text-sm text-muted-foreground">Approve, moderate, and track courses</p>
            </div>
            <div className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Title</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>{course.title}</TableCell>
                      <TableCell>{course.creator}</TableCell>
                      <TableCell>{course.students}</TableCell>
                      <TableCell>₹{course.sales.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            course.status === 'approved' ? 'default' :
                            course.status === 'pending' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {course.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {course.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCourseAction(course.id, 'approve')}
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCourseAction(course.id, 'reject')}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCourseAction(course.id, 'delete')}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments">
          <div className="grid gap-6">
            <Card className="border-primary/20 p-6">
              <h2 className="text-xl mb-4">Payment Overview</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-3xl">₹2,40,000</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Withdrawals</p>
                  <p className="text-3xl">₹45,000</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">This Month</p>
                  <p className="text-3xl">₹82,000</p>
                </div>
              </div>
            </Card>

            <Card className="border-primary/20">
              <div className="p-6 border-b border-primary/10">
                <h2 className="text-xl">Recent Transactions</h2>
              </div>
              <div className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { id: 'TXN001', user: 'John Doe', course: 'React Mastery', amount: 999, status: 'completed' },
                      { id: 'TXN002', user: 'Jane Smith', course: 'Web Dev', amount: 1499, status: 'completed' },
                      { id: 'TXN003', user: 'Bob Wilson', course: 'Python', amount: 799, status: 'pending' },
                    ].map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                        <TableCell>{txn.user}</TableCell>
                        <TableCell>{txn.course}</TableCell>
                        <TableCell>₹{txn.amount}</TableCell>
                        <TableCell>
                          <Badge variant={txn.status === 'completed' ? 'default' : 'secondary'}>
                            {txn.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <Card className="border-primary/20 p-6">
            <h2 className="text-xl mb-4">Platform Analytics</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="mb-4">User Growth</h3>
                <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Chart placeholder - Use Recharts for visualization</p>
                </div>
              </div>
              <div>
                <h3 className="mb-4">Revenue Trend</h3>
                <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Chart placeholder - Use Recharts for visualization</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="settings">
          <Card className="border-primary/20 p-6">
            <h2 className="text-xl mb-6">System Settings</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div>
                  <p className="mb-1">Ads Enabled</p>
                  <p className="text-sm text-muted-foreground">Show ads to non-premium users</p>
                </div>
                <Switch
                  checked={systemSettings.adsEnabled}
                  onCheckedChange={(checked) =>
                    setSystemSettings({ ...systemSettings, adsEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div>
                  <p className="mb-1">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">Put the site in maintenance mode</p>
                </div>
                <Switch
                  checked={systemSettings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setSystemSettings({ ...systemSettings, maintenanceMode: checked })
                  }
                />
              </div>

              <div className="p-4 bg-muted/20 rounded-lg">
                <label className="block mb-2">Newsletter Popup Interval (seconds)</label>
                <input
                  type="number"
                  value={systemSettings.newsletterInterval}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, newsletterInterval: parseInt(e.target.value) })
                  }
                  className="w-full p-2 bg-background border border-primary/20 rounded-lg"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  How often to show premium popup to non-premium users
                </p>
              </div>

              <Button
                onClick={() => toast.success('Settings saved successfully')}
                className="w-full bg-gradient-to-r from-primary to-accent text-white"
              >
                Save Settings
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
