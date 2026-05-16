"use client";
import React from "react";
import { PensionRegistration } from "@/services/pensionService";
import ServiceHistoryTable from "./ServiceHistoryTable";
import ChildrenTable from "./ChildrenTable";

interface Props {
  data: PensionRegistration;
}

export default function PensionDetailsView({ data }: Props) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div>
        <h3>Personal Information</h3>
        <div>Full name: {data.full_name}</div>
        <div>DOB: {data.date_of_birth}</div>
        <div>Nationality: {data.nationality_status}</div>
        <div>Employer: {data.employer_office_name} ({data.employer_office_id})</div>
      </div>

      <div>
        <h3>Service History</h3>
        <ServiceHistoryTable items={data.service_history ?? []} onChange={() => {}} />
      </div>

      <div>
        <h3>Family</h3>
        <div>Spouse: {data.spouse_name} ({data.spouse_date_of_birth})</div>
        <ChildrenTable items={data.children ?? []} onChange={() => {}} />
        <div>Father: {data.father_name}</div>
        <div>Mother: {data.mother_name}</div>
      </div>
    </div>
  );
}
