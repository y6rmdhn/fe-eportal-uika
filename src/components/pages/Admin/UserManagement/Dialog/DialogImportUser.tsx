import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileDown, Upload } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useRef } from "react";

interface DialogImportUserProps {
  isPendingImport: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  downloadTemplate: () => void;
}

const DialogImportUser = ({
  isPendingImport,
  handleFileChange,
  downloadTemplate,
}: DialogImportUserProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-11 rounded-xl border-gray-200 font-bold px-4"
          disabled={isPendingImport}
        >
          {isPendingImport ? (
            <Spinner />
          ) : (
            <>
              <Upload className="h-4 w-4 mr-1.5" />
              Import
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Data User</DialogTitle>
          <DialogDescription>
            Silakan download template terlebih dahulu, isi datanya, lalu upload
            kembali file tersebut.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* STEP 1: DOWNLOAD TEMPLATE */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-gray-900">
                1. Download Template
              </span>
              <span className="text-xs text-gray-500">
                Gunakan format excel ini
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <FileDown className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          {/* STEP 2: UPLOAD FILE */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-emerald-50/50 border-emerald-100">
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-gray-900">
                2. Upload File
              </span>
              <span className="text-xs text-gray-500">
                Upload excel yang sudah diisi
              </span>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPendingImport}
              >
                {isPendingImport ? (
                  <Spinner className="h-4 w-4 text-white" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload Data
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogImportUser;
