import React from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action }) => {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E5DF] pb-5">
      <div>
        <h1 className="text-2xl font-semibold text-[#252724] tracking-tight font-sans">{title}</h1>
        {description && <p className="text-sm text-[#73766F] mt-1 font-normal">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
    </div>
  );
};
