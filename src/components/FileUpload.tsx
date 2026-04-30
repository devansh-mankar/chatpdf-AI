"use client";
import React from "react";
import { useDropzone } from "react-dropzone";
import { Inbox, Loader2 } from "lucide-react";
import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ file_key, file_name }: any) => {
      const res = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return res.data;
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large!");
        return;
      }

      try {
        setUploading(true);

        const data = await uploadToS3(file);

        mutate(data, {
          onSuccess: ({ chat_id }) => {
            toast.success("Chat created!");
            router.push(`/chat/${chat_id}`);
          },
        });
      } catch (err) {
        toast.error("Upload failed");
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 cursor-pointer transition-all
      ${isDragActive ? "border-blue-500 bg-blue-50 scale-[1.02]" : "border-gray-300 bg-gray-50 hover:bg-gray-100"}`}
    >
      <input {...getInputProps()} />

      {uploading || isPending ? (
        <>
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="mt-3 text-sm text-gray-500">Uploading...</p>
        </>
      ) : (
        <>
          <Inbox className="w-10 h-10 text-blue-500" />
          <p className="mt-3 text-sm text-gray-600">
            Drag & drop your PDF here
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Max file size: 10MB
          </p>
        </>
      )}
    </div>
  );
};

export default FileUpload;