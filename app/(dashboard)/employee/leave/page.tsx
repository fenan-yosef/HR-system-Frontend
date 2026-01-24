"use client";

import React from "react";
import ActionButton from "@/components/ui/action-button";

export default function EmployeeLeavePage() {
	return (
		<section className="space-y-6">
			<div className="space-y-1">
				<h1 className="text-xl font-semibold">Leave Requests</h1>
				<p className="text-sm text-muted-foreground">Submit and view your leave requests.</p>
			</div>
			<div className="rounded-xl border bg-white p-4 shadow">
				<p className="text-sm text-muted-foreground">Integrate with leave management workflow.</p>
				<div className="mt-4 flex gap-2">
					<ActionButton role="EMPLOYEE" className="px-3 py-2 text-sm">Request Leave</ActionButton>
					<ActionButton role="EMPLOYEE" className="px-3 py-2 text-sm">View Status</ActionButton>
				</div>
			</div>
		</section>
	);
}
