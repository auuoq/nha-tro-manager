"use client";

import React from "react";
import { MeterDTO } from "../types/meter.types";
import { MeterTable } from "./meter-table";

export interface MeterListSectionProps {
  meters: MeterDTO[];
  onReplaceMeter: (meter: MeterDTO) => void;
  onRecordReading: (meter: MeterDTO) => void;
}

export const MeterListSection: React.FC<MeterListSectionProps> = ({ meters, onReplaceMeter, onRecordReading }) => {
  return <MeterTable meters={meters} onReplaceMeter={onReplaceMeter} onRecordReading={onRecordReading} />;
};
