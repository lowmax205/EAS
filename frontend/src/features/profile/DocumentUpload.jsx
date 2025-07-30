import React, { useState, useRef } from "react";
import { Upload, X, File as FileIcon, FileCheck, FilePlus } from "lucide-react";
import Button from "../../components/ui/Button";

/**
 * Component for handling document uploads
 * @param {Object} props - Component props
 * @param {Function} props.onFileSelect - Callback when file is selected, receives File object
 * @param {String} props.documentType - Type of document being uploaded (for display)
 * @param {String[]} props.acceptedTypes - Array of accepted file types (e.g., ["image/jpeg", "application/pdf"])
 * @param {Number} props.maxSizeMB - Maximum file size in MB
 * @param {String} props.currentDocument - URL of currently uploaded document (if any)
 * @param {Boolean} props.required - Whether the document is required
 */
const DocumentUpload = ({
  onFileSelect,
  documentType = "Document",
  acceptedTypes = ["image/jpeg", "image/png", "application/pdf"],
  maxSizeMB = 5,
  currentDocument = null,
  required = false,
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(currentDocument);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Format accepted types for the file input
  const formatAcceptedTypes = () => {
    return acceptedTypes.join(",");
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      return;
    }

    // Check file type
    if (!acceptedTypes.includes(selectedFile.type)) {
      setError(
        `Invalid file type. Please upload ${acceptedTypes
          .map((type) => {
            switch (type) {
              case "image/jpeg":
                return "JPG";
              case "image/png":
                return "PNG";
              case "application/pdf":
                return "PDF";
              default:
                return type.split("/")[1].toUpperCase();
            }
          })
          .join(" or ")}.`
      );
      return;
    }

    // Check file size
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }

    setError("");
    setFile(selectedFile);

    // Create preview for image files
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      // For non-image files, clear the image preview
      setPreview(null);
    }

    // Call the parent callback
    if (onFileSelect) {
      onFileSelect(selectedFile);
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  // Display file type icon based on MIME type
  const renderFileTypeIcon = () => {
    if (!file && !preview) return <FilePlus className="w-6 h-6" />;

    if (file && file.type.startsWith("image/")) {
      return <FileIcon className="w-6 h-6" />;
    } else if (file && file.type === "application/pdf") {
      return <FileIcon className="w-6 h-6" />;
    } else {
      return <FileCheck className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {documentType}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {(file || preview) && (
          <Button
            variant="text"
            onClick={handleRemoveFile}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-0"
          >
            <X className="w-4 h-4 mr-1" />
            <span className="text-xs">Remove</span>
          </Button>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-500 dark:text-red-400 mb-2">
          {error}
        </div>
      )}

      {/* Preview for image files */}
      {preview && preview.startsWith("data:image") && (
        <div className="relative mt-2 mb-4">
          <img
            src={preview}
            alt={documentType}
            className="max-h-40 max-w-full object-contain border border-gray-300 dark:border-gray-700 rounded-md"
          />
        </div>
      )}

      {/* Preview for non-image files */}
      {((file && !file.type.startsWith("image/")) ||
        (preview && !preview.startsWith("data:image"))) && (
        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md mt-2 mb-4">
          <FileIcon className="w-6 h-6 text-eas-light-primary dark:text-eas-dark-primary mr-3" />
          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
            {file ? file.name : "Document uploaded"}
          </span>
        </div>
      )}

      {/* Upload button/area */}
      <div
        className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-4 text-center hover:border-eas-light-primary dark:hover:border-eas-dark-primary transition-colors cursor-pointer"
        onClick={() => fileInputRef.current.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={formatAcceptedTypes()}
          onChange={handleFileChange}
          aria-label={`Upload ${documentType}`}
        />
        <div className="flex flex-col items-center justify-center space-y-1">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
            {renderFileTypeIcon()}
          </div>
          <div className="flex items-center space-x-2">
            <Upload className="w-4 h-4 text-eas-light-primary dark:text-eas-dark-primary" />
            <span className="text-sm font-medium text-eas-light-primary dark:text-eas-dark-primary">
              {file || preview ? "Replace file" : "Upload file"}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {acceptedTypes
              .map((type) => {
                switch (type) {
                  case "image/jpeg":
                    return "JPG";
                  case "image/png":
                    return "PNG";
                  case "application/pdf":
                    return "PDF";
                  default:
                    return type.split("/")[1].toUpperCase();
                }
              })
              .join(" or ")}{" "}
            (max {maxSizeMB}MB)
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
