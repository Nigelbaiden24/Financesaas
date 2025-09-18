import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, User, Search, Filter, UserCheck, UserX, Crown, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Check if current user is admin - only nigelbaiden24@yahoo.com has admin access
  const isAdmin = user?.email === "nigelbaiden24@yahoo.com";

  // Fetch pending users for approval
  const { data: pendingUsers = [], isLoading: loadingPending } = useQuery({
    queryKey: ["/api/admin/pending-users"],
    enabled: isAdmin,
  });

  // Fetch all users for management
  const { data: allUsers = [], isLoading: loadingAll } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAdmin,
  });

  // Approve user mutation
  const approveUserMutation = useMutation({
    mutationFn: (userId: string) => apiRequest("PUT", `/api/admin/approve-user/${userId}`),
    onSuccess: (data, userId) => {
      toast({
        title: "User Approved",
        description: "User has been approved and can now access document generation.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      toast({
        title: "Approval Failed",
        description: "Failed to approve user. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Reject user mutation
  const rejectUserMutation = useMutation({
    mutationFn: (userId: string) => apiRequest("PUT", `/api/admin/reject-user/${userId}`),
    onSuccess: () => {
      toast({
        title: "User Rejected",
        description: "User approval has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      toast({
        title: "Rejection Failed",
        description: "Failed to reject user. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Filter users based on search and status
  const filteredUsers = allUsers.filter((user: any) => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "approved") return matchesSearch && user.isApproved;
    if (filterStatus === "pending") return matchesSearch && !user.isApproved;
    
    return matchesSearch;
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You don't have admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Crown className="h-8 w-8 text-yellow-500" />
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              </div>
              <p className="text-gray-400">Manage user approvals and system administration</p>
            </div>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              ← Back to Home
            </Button>
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
            <TabsTrigger 
              value="pending" 
              className="text-gray-300 data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Pending Approvals ({pendingUsers.length})
            </TabsTrigger>
            <TabsTrigger 
              value="all-users" 
              className="text-gray-300 data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              <User className="h-4 w-4 mr-2" />
              All Users ({allUsers.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Approvals */}
          <TabsContent value="pending" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-yellow-500" />
                  Users Awaiting Approval
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Review and approve new user registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPending ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-400">Loading pending users...</p>
                  </div>
                ) : pendingUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-400">No pending approvals</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingUsers.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-black" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-gray-300 border-gray-500">
                                {user.currentPlan}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Registered: {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => approveUserMutation.mutate(user.id)}
                            disabled={approveUserMutation.isPending}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => rejectUserMutation.mutate(user.id)}
                            disabled={rejectUserMutation.isPending}
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Users */}
          <TabsContent value="all-users" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-gray-400">
                  View and manage all registered users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <Label htmlFor="search" className="text-gray-300">Search Users</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="filter" className="text-gray-300">Filter Status</Label>
                    <select
                      id="filter"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      <option value="all">All Users</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                {/* Users Table */}
                <div className="rounded-md border border-gray-700">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">User</TableHead>
                        <TableHead className="text-gray-300">Plan</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Joined</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user: any) => (
                        <TableRow key={user.id} className="border-gray-700">
                          <TableCell className="text-white">
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-gray-400">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`${
                                user.currentPlan === 'agency' ? 'border-purple-500 text-purple-400' :
                                user.currentPlan === 'pro' ? 'border-blue-500 text-blue-400' :
                                'border-gray-500 text-gray-400'
                              }`}
                            >
                              {user.currentPlan}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.isApproved ? (
                              <Badge className="bg-green-600 text-white">Approved</Badge>
                            ) : (
                              <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {!user.isApproved && (
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => approveUserMutation.mutate(user.id)}
                                  disabled={approveUserMutation.isPending}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button
                                  onClick={() => rejectUserMutation.mutate(user.id)}
                                  disabled={rejectUserMutation.isPending}
                                  variant="outline"
                                  size="sm"
                                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}