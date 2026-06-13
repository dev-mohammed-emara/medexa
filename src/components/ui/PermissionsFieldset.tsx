import { Check } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useLanguage } from '../../contexts/LanguageContext'

export const AVAILABLE_PERMISSIONS = [
  { value: 'MANAGE_CLINIC', labelAr: 'إدارة العيادة', labelEn: 'Clinic Settings' },
  { value: 'MANAGE_DOCTORS', labelAr: 'إدارة الأطباء', labelEn: 'Doctors' },
  { value: 'MANAGE_SECRETARIES', labelAr: 'إدارة السكرتاريا', labelEn: 'Secretaries' },
  { value: 'MANAGE_PATIENTS', labelAr: 'إدارة المرضى', labelEn: 'Patients' },
  { value: 'MANAGE_APPOINTMENTS', labelAr: 'إدارة المواعيد', labelEn: 'Appointments' },
  { value: 'MANAGE_MEDICAL_RECORDS', labelAr: 'إدارة السجلات الطبية', labelEn: 'Medical Records' },
  { value: 'MANAGE_TRANSACTIONS', labelAr: 'إدارة المعاملات المالية', labelEn: 'Finance & Transactions' }
];

interface PermissionsFieldsetProps {
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
}

export default function PermissionsFieldset({
  selectedPermissions,
  onChange,
  disabled = false,
  titleAr = 'الصلاحيات المتاحة',
  titleEn = 'Available Permissions',
  descriptionAr = 'حدد صلاحيات الوصول والمهمات الموكلة للمستخدم',
  descriptionEn = 'Select access permissions and assigned tasks for the user'
}: PermissionsFieldsetProps) {
  const { isAr } = useLanguage();

  const togglePermission = (value: string) => {
    if (disabled) return;
    if (selectedPermissions.includes(value)) {
      onChange(selectedPermissions.filter(p => p !== value));
    } else {
      onChange([...selectedPermissions, value]);
    }
  };

  return (
    <footer className={cn("space-y-3 p-4 bg-muted/30 rounded-2xl border border-border mt-6", isAr ? "text-right" : "text-left")}>
      <label className="text-lg font-bold block">{isAr ? titleAr : titleEn}</label>
      <p className="text-xs text-muted-foreground mb-3">{isAr ? descriptionAr : descriptionEn}</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-1">
        {AVAILABLE_PERMISSIONS.map(permission => {
          const isChecked = selectedPermissions.includes(permission.value);
          return (
            <div key={permission.value} className="flex items-center gap-3 py-1">
              <button
                type="button"
                id={permission.value}
                data-state={isChecked ? "checked" : "unchecked"}
                disabled={disabled}
                onClick={() => togglePermission(permission.value)}
                className={cn(
                  "peer size-5 shrink-0 rounded-md border shadow-xs transition-all outline-none focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center",
                  isChecked 
                    ? "bg-primary text-white border-primary" 
                    : "bg-input-background border-border hover:border-primary/50"
                )}
              >
                {isChecked && <Check className="stroke-[3px] size-4" aria-hidden="true" />}
              </button>
              <label 
                htmlFor={permission.value} 
                onClick={() => togglePermission(permission.value)}
                className={cn("text-sm cursor-pointer select-none font-semibold text-foreground/80", disabled && "opacity-50 cursor-not-allowed")}
              >
                {isAr ? permission.labelAr : permission.labelEn}
              </label>
            </div>
          );
        })}
      </div>
    </footer>
  );
}
