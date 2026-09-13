import { AlertUpload } from "@/components/alert-upload"
import { IocLookup } from "@/components/ioc-lookup"

export default function Page() {
  return (
    <div className="min-h-svh p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <IocLookup />
        <AlertUpload />
      </div>
    </div>
  )
}
