import React, { useRef, useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import { useTheme } from "../../components/layout/ThemeContext";
import { X } from "lucide-react";
import useScrollLock from "../../components/common/useScrollLock";

/**
 * A canvas component for capturing user signatures
 * @param {Object} props - Component props
 * @param {Function} props.onSave - Callback function when signature is saved, receives dataURL
 * @param {Function} props.onCancel - Callback function when signature creation is cancelled
 * @param {String} props.initialSignature - Optional initial signature as dataURL
 * @param {Boolean} props.readOnly - Whether the signature can be modified
 */
const SignatureCanvas = ({
  onSave,
  onCancel,
  initialSignature,
  readOnly = false,
}) => {
  const canvasRef = useRef(null);
  const modalCanvasRef = useRef(null);
  const { resolvedTheme } = useTheme();
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [ctx, setCtx] = useState(null);
  const [modalCtx, setModalCtx] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // We don't need an explicit isMobile state since we use CSS media queries
  // to determine whether to show the mobile or desktop version

  // Enable scroll lock when modal is open
  useScrollLock(isModalOpen);

  // Setup canvas on component mount
  useEffect(() => {
    const setupCanvas = (canvas, _setContext) => {
      if (!canvas) return null;

      const context = canvas.getContext("2d");

      // Set canvas to be responsive
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Set drawing styles
      context.lineWidth = 2;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = resolvedTheme === "dark" ? "#fff" : "#000";

      return context;
    };

    // Setup main canvas
    const mainContext = setupCanvas(canvasRef.current, setCtx);
    if (mainContext) setCtx(mainContext);

    // Load initial signature if provided
    if (initialSignature && mainContext) {
      const img = new Image();
      img.onload = () => {
        mainContext.drawImage(img, 0, 0);
        setHasSignature(true);
      };
      img.src = initialSignature;
    }

    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current) return;

      const currentSignature = canvasRef.current.toDataURL();
      const mainCanvas = canvasRef.current;
      mainCanvas.width = mainCanvas.offsetWidth;
      mainCanvas.height = mainCanvas.offsetHeight;

      // Restore styles after resize
      if (mainContext) {
        mainContext.lineWidth = 2;
        mainContext.lineCap = "round";
        mainContext.lineJoin = "round";
        mainContext.strokeStyle = resolvedTheme === "dark" ? "#fff" : "#000";

        // Reload the signature
        if (currentSignature) {
          const img = new Image();
          img.onload = () => {
            mainContext.drawImage(img, 0, 0);
          };
          img.src = currentSignature;
        }
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [initialSignature, resolvedTheme]);

  // Update stroke style when theme changes
  useEffect(() => {
    if (ctx) {
      ctx.strokeStyle = resolvedTheme === "dark" ? "#fff" : "#000";
    }
  }, [resolvedTheme, ctx]);

  // Handle modal opening and closing
  // This function is used in the JSX below
  const openModal = () => {
    setIsModalOpen(true);

    // Setup modal canvas on the next render cycle
    setTimeout(() => {
      if (modalCanvasRef.current) {
        const modalContext = modalCanvasRef.current.getContext("2d");
        modalCanvasRef.current.width = modalCanvasRef.current.offsetWidth;
        modalCanvasRef.current.height = modalCanvasRef.current.offsetHeight;

        modalContext.lineWidth = 2;
        modalContext.lineCap = "round";
        modalContext.lineJoin = "round";
        modalContext.strokeStyle = resolvedTheme === "dark" ? "#fff" : "#000";

        setModalCtx(modalContext);

        // If we have a signature, load it in the modal canvas
        if (initialSignature || hasSignature) {
          const img = new Image();
          img.onload = () => {
            modalContext.drawImage(
              img,
              0,
              0,
              modalCanvasRef.current.width,
              modalCanvasRef.current.height
            );
          };
          img.src = initialSignature || canvasRef.current.toDataURL();
        }
      }
    }, 0);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const startDrawing = (e) => {
    if (readOnly) return;

    // Determine which canvas is being used
    const isModalCanvas = e.target === modalCanvasRef.current;
    const canvas = isModalCanvas ? modalCanvasRef.current : canvasRef.current;
    const currentCtx = isModalCanvas ? modalCtx : ctx;

    if (!canvas || !currentCtx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if (e.type.includes("touch")) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    currentCtx.beginPath();
    currentCtx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing || readOnly) return;

    // Determine which canvas is being used
    const isModalCanvas = e.target === modalCanvasRef.current;
    const canvas = isModalCanvas ? modalCanvasRef.current : canvasRef.current;
    const currentCtx = isModalCanvas ? modalCtx : ctx;

    if (!canvas || !currentCtx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if (e.type.includes("touch")) {
      e.preventDefault(); // Prevent scrolling on touch devices
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    currentCtx.lineTo(x, y);
    currentCtx.stroke();
  };

  const endDrawing = () => {
    if (readOnly) return;
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (readOnly) return;

    // Clear the main canvas
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    // Also clear the modal canvas if it exists
    if (modalCtx && modalCanvasRef.current) {
      modalCtx.clearRect(
        0,
        0,
        modalCanvasRef.current.width,
        modalCanvasRef.current.height
      );
    }

    setHasSignature(false);
  };

  const saveSignature = () => {
    if (onSave && hasSignature) {
      // Get data URL from the appropriate canvas
      const dataURL =
        isModalOpen && modalCanvasRef.current
          ? modalCanvasRef.current.toDataURL()
          : canvasRef.current.toDataURL();

      onSave(dataURL);

      if (isModalOpen) {
        // If we're in the modal, close it after saving
        closeModal();

        // Copy the signature to the main canvas
        if (ctx && canvasRef.current && modalCanvasRef.current) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );
            ctx.drawImage(
              img,
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );
          };
          img.src = dataURL;
        }
      }
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* For desktop view */}
      <div className="hidden md:block">
        <div
          className={`border-2 rounded-md bg-white dark:bg-gray-800 mb-2 theme-transition ${
            readOnly
              ? "border-gray-300 dark:border-gray-600"
              : "border-gray-300 dark:border-gray-600 hover:border-eas-light-primary dark:hover:border-eas-dark-primary"
          }`}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-40 rounded-md"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
          />
        </div>
        {!readOnly && (
          <div className="flex justify-between">
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={clearCanvas}
                className="text-sm"
              >
                Clear
              </Button>
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="text-sm"
                >
                  Cancel
                </Button>
              )}
            </div>
            <Button
              variant="primary"
              onClick={saveSignature}
              disabled={!hasSignature}
              className="text-sm"
            >
              Save Signature
            </Button>
          </div>
        )}
      </div>

      {/* For mobile view - shows a button to open signature modal */}
      <div className="block md:hidden">
        <div
          className={`border-2 rounded-md bg-white dark:bg-gray-800 mb-2 p-4 theme-transition ${
            readOnly
              ? "border-gray-300 dark:border-gray-600"
              : "border-gray-300 dark:border-gray-600"
          }`}
        >
          {hasSignature ? (
            <div className="flex flex-col items-center justify-center">
              <img
                src={canvasRef.current?.toDataURL()}
                alt="Your signature"
                className="max-h-32 max-w-full object-contain mb-3"
              />
              {!readOnly && (
                <Button onClick={openModal} variant="outline" className="mt-2">
                  Edit Signature
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32">
              <p className="text-gray-500 dark:text-gray-400 text-center mb-3">
                Tap the button below to create your signature
              </p>
              {!readOnly && (
                <Button onClick={openModal} variant="primary">
                  Open Signature Pad
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for mobile signature drawing */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Create Signature
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 flex-grow">
              <div className="border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 mb-4">
                <canvas
                  ref={modalCanvasRef}
                  className="w-full h-64 rounded-md"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={endDrawing}
                  onMouseLeave={endDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={endDrawing}
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <Button
                variant="outline"
                onClick={clearCanvas}
                className="text-sm"
              >
                Clear
              </Button>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="text-sm"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={saveSignature}
                  disabled={!hasSignature}
                  className="text-sm"
                >
                  Save Signature
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignatureCanvas;
