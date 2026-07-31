import React, { useState } from "react";
import { InvoiceItem, InvoiceItemType, ManualInvoiceItemInput } from "../types/invoice.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Dialog } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { formatCurrency } from "@/shared/lib/formatters";
import { Receipt, Plus, Trash2 } from "lucide-react";

export interface InvoiceItemsSectionProps {
  items: InvoiceItem[];
  isDraft: boolean;
  onAddItem: (item: ManualInvoiceItemInput) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  loading?: boolean;
}

export const InvoiceItemsSection: React.FC<InvoiceItemsSectionProps> = ({
  items,
  isDraft,
  onAddItem,
  onDeleteItem,
  loading = false,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [type, setType] = useState<InvoiceItemType>("OTHER");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(50000);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const translateItemType = (t: InvoiceItemType) => {
    switch (t) {
      case "ROOM": return "Tiền phòng";
      case "ELECTRICITY": return "Tiền điện";
      case "WATER": return "Tiền nước";
      case "WIFI": return "Tiền Wifi";
      case "GARBAGE": return "Tiền rác";
      case "PARKING": return "Tiền gửi xe";
      case "OTHER": return "Phí khác";
      case "DISCOUNT": return "Giảm giá";
      default: return t;
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      await onAddItem({
        type,
        description,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
      });
      setIsDialogOpen(false);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Thêm khoản phí thất bại");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-[#3F594F]" /> Chi Tiết Các Khoản Phí ({items.length})
        </CardTitle>
        {isDraft && (
          <Button size="sm" variant="outline" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> Thêm Phí Thủ Công
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8F7F4] text-[#73766F] uppercase font-semibold border-b border-[#E8E5DF]">
              <tr>
                <th className="px-3 py-2.5">Danh Mục</th>
                <th className="px-3 py-2.5">Nội Dung Chi Tiết</th>
                <th className="px-3 py-2.5 text-right">Số Lượng</th>
                <th className="px-3 py-2.5 text-right">Đơn Giá</th>
                <th className="px-3 py-2.5 text-right">Thành Tiền</th>
                {isDraft && <th className="px-3 py-2.5 text-right">Thao Tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DF]">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8F7F4]/50">
                  <td className="px-3 py-3 font-semibold text-[#252724]">{translateItemType(item.type)}</td>
                  <td className="px-3 py-3 text-[#52554E]">{item.description}</td>
                  <td className="px-3 py-3 text-right font-mono">{item.quantity}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-[#252724]">{formatCurrency(item.amount)}</td>
                  {isDraft && (
                    <td className="px-3 py-3 text-right">
                      {item.type === "OTHER" && (
                        <button
                          onClick={() => {
                            if (confirm("Xóa khoản phí thủ công này?")) {
                              onDeleteItem(item.id);
                            }
                          }}
                          className="p-1 text-[#A84646] hover:bg-[#FDF0F0] rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Thêm Khoản Phí Thủ Công">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {errorMsg && <div className="p-3 bg-[#FDF0F0] text-[#A84646] text-xs rounded-xl">{errorMsg}</div>}
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Loại Phí (*)</label>
            <Select value={type} onChange={(e) => setType(e.target.value as InvoiceItemType)}>
              <option value="OTHER">Phí khác (sửa chữa, đền bù...)</option>
              <option value="PARKING">Phí gửi xe phụ trội</option>
              <option value="GARBAGE">Phí rác phụ trội</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Nội Dung Chi Tiết (*)</label>
            <Input placeholder="VD: Thay ổ khóa phòng" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-[#252724] mb-1">Số Lượng (*)</label>
              <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#252724] mb-1">Đơn Giá (VNĐ) (*)</label>
              <Input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} required />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E5DF]">
            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Hủy Bỏ
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              Lưu Khoản Phí
            </Button>
          </div>
        </form>
      </Dialog>
    </Card>
  );
};
