"use client";

import React from "react";
import ActionButton from "@/components/ui/action-button";

export default function EmployeeAttendancePage() {
	return (
		<section className="space-y-6">
			<div className="space-y-1">
				<h1 className="text-xl font-semibold">Attendance</h1>
				<p className="text-sm text-muted-foreground">Mark your daily attendance.</p>
			</div>
			<div className="rounded-xl border bg-white p-4 shadow">
				<p className="text-sm text-muted-foreground">Connect to time tracking API.</p>
				<div className="mt-4">
					<ActionButton role="EMPLOYEE" className="px-3 py-2 text-sm">Mark Present</ActionButton>
				</div>
			</div>
		</section>
	);
}
