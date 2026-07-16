import { useState, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"

import { FormTextField } from "@/components/form/form-text-field"
import { MechaturaFormValues } from "@/lib/validation"
import { Button } from "@/components/ui/button"

export default function MechaturaMemberInfo(){
    const { getValues, setValue, clearErrors } = useFormContext<MechaturaFormValues>()
    const [memberCount, setMemberCount] = useState(0)

    useEffect(() => {
        // Initialize memberCount based on existing values if restoring from draft
        if (getValues("member3_name")) {
            setMemberCount(2)
        } else if (getValues("member2_name")) {
            setMemberCount(1)
        }
    }, [getValues])

    const addMember = () => {
        if (memberCount < 2) {
            setMemberCount((prev) => prev + 1)
        }
    }

    const removeMember = (index: number) => {
        if (index === 1) { // Removing Member 1 (member2_*)
            if (memberCount === 2) {
                // Shift Member 2 data to Member 1
                setValue("member2_name", getValues("member3_name") || "", { shouldDirty: true, shouldValidate: true })
                setValue("member2_email", getValues("member3_email") || "", { shouldDirty: true, shouldValidate: true })
                setValue("member2_phone", getValues("member3_phone") || "", { shouldDirty: true, shouldValidate: true })
                
                // Clear Member 2
                setValue("member3_name", "", { shouldDirty: true })
                setValue("member3_email", "", { shouldDirty: true })
                setValue("member3_phone", "", { shouldDirty: true })
                clearErrors(["member3_name", "member3_email", "member3_phone"])
            } else {
                // Just clear Member 1
                setValue("member2_name", "", { shouldDirty: true })
                setValue("member2_email", "", { shouldDirty: true })
                setValue("member2_phone", "", { shouldDirty: true })
                clearErrors(["member2_name", "member2_email", "member2_phone"])
            }
            setMemberCount((prev) => prev - 1)
        } else if (index === 2) { // Removing Member 2 (member3_*)
            setValue("member3_name", "", { shouldDirty: true })
            setValue("member3_email", "", { shouldDirty: true })
            setValue("member3_phone", "", { shouldDirty: true })
            clearErrors(["member3_name", "member3_email", "member3_phone"])
            setMemberCount(1)
        }
    }

    return (
        <section className="sm:overflow-hidden sm:rounded-xl sm:border sm:border-border sm:bg-card" aria-labelledby="team-section-label">
            <div className="border-b border-border pb-4 pt-0 sm:py-6 sm:px-6">
                <h2 id="team-section-label" className="text-lg font-semibold">
                    Identitas Anggota Tim
                </h2>
                <p className="mt-1 text-sm font-medium leading-relaxed text-neutral-500">
                    Mohon isi data member tim
                </p>
            </div>
            
            <div className="space-y-6 pt-5 pb-0 sm:p-6">
    
            {/* FORM KETUA TIM */}
            <div className="space-y-6">
                <FormTextField<MechaturaFormValues>
                    name="leader_name"
                    label="Nama Ketua Tim"
                    placeholder="Masukkan nama ketua tim anda"
                    required
                />
        
                <div className="grid gap-3 sm:grid-cols-2">
                    <FormTextField<MechaturaFormValues>
                        name="leader_email"
                        label="Email Ketua Tim"
                        placeholder="Masukkan email ketua tim anda"
                        required
                    />
            
                    <FormTextField<MechaturaFormValues>
                        name="leader_phone"
                        label="No. WhatsApp Ketua Tim"
                        placeholder="Masukkan nama WhatsApp ketua tim anda"
                        required
                    />
                </div>
            </div>

            {/* FORM ANGGOTA 1 */}
            {memberCount >= 1 && (
                <div className="relative space-y-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-foreground">Anggota 1</h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 shrink-0 rounded-[8px] text-destructive hover:bg-destructive hover:text-white"
                            onClick={() => removeMember(1)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    <FormTextField<MechaturaFormValues>
                        name="member2_name"
                        label="Nama Anggota 1"
                        placeholder="Masukkan nama anggota 1 anda"
                        required
                    />
            
                    <div className="grid gap-3 sm:grid-cols-2">
                        <FormTextField<MechaturaFormValues>
                            name="member2_email"
                            label="Email Anggota 1"
                            placeholder="Masukkan email anggota 1 anda"
                            required
                        />
                
                        <FormTextField<MechaturaFormValues>
                            name="member2_phone"
                            label="No. WhatsApp Anggota 1"
                            placeholder="Masukkan nomor WhatsApp anggota 1 anda"
                            required
                        />
                    </div>
                </div>
            )}

            {/* FORM ANGGOTA 2 */}
            {memberCount >= 2 && (
                <div className="relative space-y-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-foreground">Anggota 2</h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 shrink-0 rounded-[8px] text-destructive hover:bg-destructive hover:text-white"
                            onClick={() => removeMember(2)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>

                    <FormTextField<MechaturaFormValues>
                        name="member3_name"
                        label="Nama Anggota 2"
                        placeholder="Masukkan nama anggota 2 anda"
                        required
                    />
            
                    <div className="grid gap-3 sm:grid-cols-2">
                        <FormTextField<MechaturaFormValues>
                            name="member3_email"
                            label="Email Anggota 2"
                            placeholder="Masukkan email anggota 2 anda"
                            required
                        />
                
                        <FormTextField<MechaturaFormValues>
                            name="member3_phone"
                            label="No. WhatsApp Anggota 2"
                            placeholder="Masukkan nomor WhatsApp anggota 2 anda"
                            required
                        />
                    </div>
                </div>
            )}

            {memberCount < 2 && (
                <div className="pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11 rounded-[8px] border-dashed"
                        onClick={addMember}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Anggota
                    </Button>
                </div>
            )}
            </div>
        </section>
    )
}
