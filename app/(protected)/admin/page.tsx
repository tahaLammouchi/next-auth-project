"use client";

import RoleGate from "@/components/auth/role-gate";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import useCurrentRole from "@/hooks/use-current-role";
import { UserRole } from "@prisma/client";
import axios from "axios";
import { toast } from "sonner";

export default function AdminPage() {
    async function onApiRouteClick() {
        try {
            const res = await axios.get('/api/admin');
            if (res.status === 200) {
                toast.success('Allowed API Route!');
            } else {
                toast.error('Forbidden API Route!');
            }
        } catch (err) {
            console.log(err);
        }
    }
    
    const role  = useCurrentRole();

  return (
    <Card className="w-[600px]">
        <CardHeader>
            <p className="text-2xl font-semibold text-center">
                🔑 Admin
            </p>
        </CardHeader>
        <CardContent className="space-y-4">
            <RoleGate allowedRole={UserRole.ADMIN}>
                <FormSuccess message="You are allowed to see this content!" />
            </RoleGate>
            <div className="flex flex-row items-center justify-between
             rounded-lg border p-3 shadow-md">
                <p className="text-sm font-medium">
                    Admin-only API Route
                </p>
                <Button onClick={onApiRouteClick}>
                    Click to test
                </Button>
            </div>
            <div className="flex flex-row items-center justify-between
             rounded-lg border p-3 shadow-md">
                <p className="text-sm font-medium">
                    Admin-only Server Action
                </p>
                <Button>
                    Click to test
                </Button>
            </div>
        </CardContent>
    </Card>
  )
}
