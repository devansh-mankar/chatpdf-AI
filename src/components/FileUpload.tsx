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
        console.error(err);
        toast.error("Upload failed");
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative flex flex-col items-center justify-center
        rounded-3xl px-8 py-12 cursor-pointer
        transition-all duration-300

        bg-white/60 backdrop-blur-xl
        border border-white/40
        shadow-[0_10px_40px_rgba(0,0,0,0.08)]

        hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)]
        hover:-translate-y-1

        ${isDragActive ? "border-blue-400 bg-blue-50/60 scale-[1.02]" : ""}
      `}
    >
      <input {...getInputProps()} />

      {uploading || isPending ? (
        <>
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="mt-4 text-sm text-slate-600 font-medium">
            Uploading your PDF...
          </p>
        </>
      ) : (
        <>
          
          <div className="p-4 rounded-2xl bg-blue-100/60">
            <Inbox className="w-8 h-8 text-blue-600" />
          </div>

          <p className="mt-5 text-base font-medium text-slate-800">
            Drop your PDF here
          </p>

          <p className="text-sm text-slate-500 mt-1">
            or click to browse files
          </p>

          <p className="text-xs text-slate-400 mt-2">
            Max file size: 10MB
          </p>
        </>
      )}
    </div>
  );
};

export default FileUpload;