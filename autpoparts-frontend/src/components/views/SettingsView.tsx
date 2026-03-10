import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { 
  User, 
  Bell, 
  Database, 
  Shield, 
  Palette,
  Download,
  Upload,
  Mail,
  Smartphone,
  DollarSign,
  Clock,
  Save,
  AlertCircle,
  Users,
  UserPlus,
  Building2
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../ui/dialog";
import { motion, AnimatePresence } from "motion/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface TeamMember {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: "Business Owner" | "Team Member";
  createdAt: string;
}

export function SettingsView() {
  // Notification States
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [salesAlerts, setSalesAlerts] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  // User & Team States
  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  
  // New Member Form State
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberFullName, setNewMemberFullName] = useState("");
  const [newMemberPassword, setNewMemberPassword] = useState("");

  const getRoleBadgeColor = (role: string) => {
    return role === "Business Owner" 
      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" 
      : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white";
  };

  // Fetch Team on Mount
  useEffect(() => {
    const fetchTeam = async () => {
      if (!savedUser.company_id) return;
      try {
        const response = await fetch(`http://localhost:5000/api/team?company_id=${savedUser.company_id}`);
        if (response.ok) {
          const data = await response.json();
          const mappedTeam = data.map((m: any) => ({
            id: m.user_id.toString(),
            username: m.email.split('@')[0],
            email: m.email,
            fullName: m.full_name,
            role: m.role === 'Admin' ? "Business Owner" : "Team Member",
            createdAt: m.created_at ? m.created_at.split('T')[0] : "N/A"
          }));
          setTeamMembers(mappedTeam);
        }
      } catch (error) {
        console.error("Error fetching team:", error);
      }
    };
    fetchTeam();
  }, [savedUser.company_id]);

  const handleAddTeamMember = async () => {
    if (!newMemberEmail || !newMemberFullName || !newMemberPassword) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newMemberFullName,
          email: newMemberEmail,
          password: newMemberPassword,
          company_id: savedUser.company_id
        }),
      });

      if (response.ok) {
        const createdStaff = await response.json();
        const memberForUI: TeamMember = {
          id: createdStaff.user_id.toString(),
          username: createdStaff.email.split('@')[0],
          email: createdStaff.email,
          fullName: createdStaff.full_name,
          role: "Team Member",
          createdAt: new Date().toISOString().split('T')[0]
        };
        setTeamMembers(prev => [...prev, memberForUI]);
        setNewMemberEmail(""); setNewMemberFullName(""); setNewMemberPassword("");
        setIsAddMemberOpen(false);
        toast.success("Staff account created successfully!");
      }
    } catch (error) {
      toast.error("Connection failed");
    }
  };

  const handleSaveSettings = () => toast.success("Settings saved successfully!");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your automotive business preferences and team.</p>
      </header>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-8">
          <TabsTrigger value="general"><User className="w-4 h-4 mr-2" />General</TabsTrigger>
          <TabsTrigger value="team"><Users className="w-4 h-4 mr-2" />Team</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />Notifications</TabsTrigger>
          <TabsTrigger value="data"><Database className="w-4 h-4 mr-2" />Data</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="w-4 h-4 mr-2" />Appearance</TabsTrigger>
          <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2" />Security</TabsTrigger>
        </TabsList>

        {/* 1. General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input disabled defaultValue={savedUser.user_name || "AutoParts Pro"} />
                </div>
                <div className="space-y-2">
                  <Label>Registration Email</Label>
                  <Input disabled defaultValue={savedUser.email} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Business Address</Label>
                <Input defaultValue="123 Thesis St. Tanza, Cavite" />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} className="bg-gradient-to-r from-indigo-600 to-purple-600"><Save className="w-4 h-4 mr-2" />Save Changes</Button>
          </div>
        </TabsContent>

        {/* 2. Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-[#FF6B00]" />Team Management</CardTitle>
                <CardDescription>Accounts linked to {savedUser.user_name}</CardDescription>
              </div>
              <Button onClick={() => setIsAddMemberOpen(true)} className="bg-[#FF6B00]"><UserPlus className="w-4 h-4 mr-2" />Add Staff</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
                <TableBody>
                  {teamMembers.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.fullName}</TableCell>
                      <TableCell>{m.email}</TableCell>
                      <TableCell><Badge className={getRoleBadgeColor(m.role)}>{m.role}</Badge></TableCell>
                      <TableCell>{m.createdAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader><CardTitle>Alert Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Low Stock Alerts</Label>
                <Switch checked={lowStockAlerts} onCheckedChange={setLowStockAlerts} />
              </div>
              <div className="flex justify-between items-center">
                <Label>Email Digest</Label>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Data Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader><CardTitle>Backup & Export</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full"><Download className="w-4 h-4 mr-2" />Export Database (JSON)</Button>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <Label>Auto-Backup to Cloud</Label>
                <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader><CardTitle>Visual Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Label>Theme Mode</Label>
              <Select defaultValue="light">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light Mode</SelectItem>
                  <SelectItem value="dark">Dark Mode</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader><CardTitle>Access Control</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Change Password</Label>
                <Input type="password" placeholder="New Password" />
              </div>
              <Button className="w-full" variant="outline">Update Credentials</Button>
              <Separator />
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-red-600 text-sm font-bold">Danger Zone</p>
                <Button variant="destructive" className="mt-2">Reset Business Data</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Staff Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Full Name" value={newMemberFullName} onChange={(e) => setNewMemberFullName(e.target.value)} />
            <Input placeholder="Email" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} />
            <Input type="password" placeholder="Password" value={newMemberPassword} onChange={(e) => setNewMemberPassword(e.target.value)} />
          </div>
          <DialogFooter><Button onClick={handleAddTeamMember} className="bg-[#FF6B00]">Create Account</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}