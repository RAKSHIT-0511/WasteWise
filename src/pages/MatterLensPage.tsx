import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Upload,
  RefreshCw,
  Trash2,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowLeft,
  Scan,
  ShieldCheck,
  Droplets,
  Layers,
  Info
} from 'lucide-react';
import { MatterLensAnalysisResult } from '@/utils/matterlensParser';

export const MatterLensPage: React.FC = () => {
  // State management
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/jpeg');
  const [fileDetails, setFileDetails] = useState<{ name: string; sizeKb: number } | null>(null);
  
  // Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<MatterLensAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setErrorMessage(null);
    setCameraError(null);
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera capture is not supported by your browser. Please select an image file instead.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      setIsCameraActive(true);

      // Attach stream to video element when ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err: unknown) {
      setIsCameraActive(false);
      const error = err as Error;
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in browser settings or upload a file.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Please upload an image file.');
      } else {
        setCameraError(`Unable to start camera: ${error.message || 'Unknown camera error'}.`);
      }
    }
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    stopCamera();
    setSelectedImage(dataUrl);
    setSelectedMimeType('image/jpeg');
    setFileDetails({
      name: `camera_capture_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.jpg`,
      sizeKb: Math.round(dataUrl.length * 0.75 / 1024),
    });
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setCameraError(null);
    stopCamera();

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 5MB.`);
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Unsupported file format. Please upload a JPEG, PNG, WebP, or GIF image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedImage(result);
      setSelectedMimeType(file.type);
      setFileDetails({
        name: file.name,
        sizeKb: Math.round(file.size / 1024),
      });
      setAnalysisResult(null);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    stopCamera();
    setSelectedImage(null);
    setFileDetails(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/matterlens/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: selectedMimeType,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Server returned error (${response.status})`);
      }

      setAnalysisResult(data.result);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Optical identification failed. Please check your connection and retry.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col w-full relative min-h-[calc(100vh-4rem)]">
      {/* Ambient background blur */}
      <div className="absolute top-10 -right-20 w-80 h-80 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 -left-20 w-80 h-80 bg-surface-container-highest/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto w-full px-margin-mobile md:px-margin-desktop pt-space-md pb-space-3xl flex flex-col gap-space-lg">
        
        {/* ========================================================================= */}
        {/* HEADER BREADCRUMB & INTRO                                                 */}
        {/* ========================================================================= */}
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-label-numeric text-[13px] text-on-surface-variant hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to WasteWise</span>
            </Link>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-pill text-label-pill uppercase">
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              <span>Material Scanner</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h1 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl text-primary font-bold tracking-tight">
              MatterLens
            </h1>
            <span className="font-label-numeric text-caption text-secondary font-semibold">
              Photo Material Identification
            </span>
          </div>

          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Take or upload a photo of your item or packaging to identify what it is made of.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* CAMERA DENIED / GENERAL ERROR ALERT                                       */}
        {/* ========================================================================= */}
        {(errorMessage || cameraError) && (
          <div className="p-space-md rounded-2xl bg-error-container/60 border border-error/30 text-on-error-container flex items-start gap-space-sm animate-fadeIn">
            <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <span className="font-bold block">Attention Required</span>
              <span>{errorMessage || cameraError}</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MAIN WORKFLOW AREA                                                        */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          
          {/* Left / Top: Interactive Input Module (Camera / Upload / Preview) */}
          <div className="lg:col-span-6 flex flex-col gap-space-md">
            
            {/* Input Card */}
            <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-surface-container-high/60 flex flex-col gap-space-md relative overflow-hidden">
              
              {/* STATE 1: LIVE CAMERA VIEW */}
              {isCameraActive && (
                <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-black flex flex-col items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* AR Corner HUD Overlay */}
                  <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-white/80 font-label-numeric text-[11px] bg-black/40 backdrop-blur-md px-3 py-1 rounded-full w-fit">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-pulse mr-2" />
                      CAMERA LIVE
                    </div>
                    {/* Center Frame */}
                    <div className="relative mx-auto my-auto w-48 h-48">
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-secondary-fixed rounded-tl-lg" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-secondary-fixed rounded-tr-lg" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-secondary-fixed rounded-bl-lg" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-secondary-fixed rounded-br-lg" />
                    </div>
                  </div>

                  {/* Camera Action Buttons */}
                  <div className="absolute bottom-4 inset-x-4 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2.5 rounded-full bg-black/60 text-white font-headline-sm text-xs backdrop-blur-md hover:bg-black/80 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={captureCameraPhoto}
                      className="px-6 py-3 rounded-full bg-primary-container text-on-primary font-headline-sm text-sm font-bold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                      <Camera className="w-4 h-4 text-secondary-fixed" />
                      <span>Capture Photo</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STATE 2: SELECTED IMAGE PREVIEW */}
              {!isCameraActive && selectedImage && (
                <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-surface-container flex flex-col justify-between">
                  <img
                    src={selectedImage}
                    alt="Selected waste item"
                    className="w-full h-full object-contain bg-surface-container-high/40"
                  />

                  {/* Top preview badge */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-numeric text-[11px] shadow-sm">
                      <CheckCircle className="w-3.5 h-3.5 text-secondary" />
                      <span>{fileDetails?.name || 'Image Ready'} ({fileDetails?.sizeKb || 0} KB)</span>
                    </span>

                    <button
                      type="button"
                      onClick={handleClearImage}
                      aria-label="Remove image"
                      className="w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-error hover:bg-error hover:text-white flex items-center justify-center transition-colors shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Scanning Animation Overlay when analyzing */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-primary/70 backdrop-blur-xs flex flex-col items-center justify-center gap-space-sm text-on-primary p-4 text-center animate-fadeIn">
                      <div className="relative w-20 h-20 rounded-full border-4 border-secondary-fixed/40 border-t-secondary-fixed animate-spin flex items-center justify-center">
                        <Scan className="w-8 h-8 text-secondary-fixed animate-pulse" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-headline-sm text-headline-sm font-bold tracking-tight">
                          Optical Inspection Active
                        </span>
                        <span className="font-caption text-caption text-secondary-fixed">
                          Analyzing resin codes, layers, and contamination with Gemma 4...
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STATE 3: EMPTY DROPZONE STATE */}
              {!isCameraActive && !selectedImage && (
                <div className="w-full h-72 sm:h-80 rounded-2xl border-2 border-dashed border-outline-variant/60 bg-surface-container-low/40 hover:bg-surface-container-low flex flex-col items-center justify-center gap-space-sm p-space-lg text-center transition-colors">
                  <div className="w-16 h-16 rounded-full bg-secondary-fixed/40 flex items-center justify-center text-secondary">
                    <Scan className="w-8 h-8 text-secondary" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                      Select or Capture Item
                    </h3>
                    <p className="font-body-sm text-caption text-on-surface-variant max-w-xs">
                      Provide a photo of any container, bottle, carton, or food packaging.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Trigger Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-xs pt-1">
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={isAnalyzing}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-headline-sm text-[14px] font-semibold transition-all disabled:opacity-50"
                >
                  <Camera className="w-4 h-4 text-secondary" />
                  <span>Use Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-headline-sm text-[14px] font-semibold transition-all disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 text-secondary" />
                  <span>Upload Image</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Analyze CTA */}
              {selectedImage && !isCameraActive && (
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-primary-container text-on-primary font-headline-sm text-headline-sm font-bold shadow-[0_8px_20px_rgba(20,83,45,0.25)] hover:bg-primary active:scale-[0.99] transition-all disabled:opacity-50 mt-1"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-5 h-5 text-secondary-fixed animate-spin" />
                      <span>Processing Optical AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-secondary-fixed" />
                      <span>Analyze Material with MatterLens</span>
                    </>
                  )}
                </button>
              )}

              {/* Helper notice */}
              <div className="flex items-center justify-between text-on-surface-variant font-caption text-[11px] pt-1">
                <span>Max size: 5MB • Formats: JPG, PNG, WEBP, GIF</span>
                <span>Privacy: Processed server-side</span>
              </div>

            </div>

            {/* MatterLens Operational Principles Card */}
            <div className="px-3 py-2 rounded-xl bg-surface-container-low/60 border border-surface-container-high/40 flex items-center gap-2 text-[12px] text-on-surface-variant">
              <Info className="w-4 h-4 text-secondary flex-shrink-0" />
              <span>MatterLens identifies materials; municipal sorting is verified in EcoVerify.</span>
            </div>

          </div>

          {/* Right / Bottom: Result Presentation Area */}
          <div className="lg:col-span-6 flex flex-col gap-space-md">
            
            {/* SUCCESS STATE */}
            {analysisResult && (
              <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-surface-container-high/60 flex flex-col gap-space-md animate-fadeIn">
                
                {/* Result Title & Model Tag */}
                <div className="flex items-start justify-between gap-space-sm pb-space-sm border-b border-surface-container-high/50">
                  <div className="flex flex-col gap-1">
                    <span className="font-label-pill text-label-pill text-secondary uppercase font-bold tracking-wider">
                      Optical Classification Complete
                    </span>
                    <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile text-primary font-bold leading-tight">
                      {analysisResult.itemName}
                    </h2>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-numeric text-[12px] font-bold shadow-xs whitespace-nowrap">
                    {analysisResult.category}
                  </span>
                </div>

                {/* Model Reported Confidence Badge */}
                {analysisResult.modelReportedConfidence !== undefined && (
                  <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low border border-surface-container-high/60">
                    <div className="flex flex-col">
                      <span className="font-caption text-[11px] text-on-surface-variant font-medium">
                        Model-reported visual confidence (not a calibrated probability)
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                        <span className="font-label-numeric text-[11px] font-semibold text-primary">
                          AI model: Gemma {analysisResult.modelUsed.replace(/^models\//, '')} · Google Gemini API
                        </span>
                      </div>
                    </div>

                    <span
                      className={`font-label-numeric text-[15px] font-bold px-3 py-1 rounded-full ${
                        analysisResult.confidenceTier === 'high'
                          ? 'bg-secondary-fixed text-on-secondary-fixed'
                          : analysisResult.confidenceTier === 'medium'
                          ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                          : 'bg-error-container text-on-error-container'
                      }`}
                    >
                      {Math.round(analysisResult.modelReportedConfidence * 100)}%
                    </span>
                  </div>
                )}

                {/* Uncertainty Notice if flagged */}
                {analysisResult.isUncertain && (
                  <div className="p-space-sm rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-space-xs text-xs">
                    <HelpCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Visual Ambiguity Noted</span>
                      <span>{analysisResult.uncertaintyNotes || 'The AI detected characteristics of multiple materials or obscured surfaces.'}</span>
                    </div>
                  </div>
                )}

                {/* Key Attributes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                  
                  {/* Material Composition */}
                  <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col gap-1">
                    <span className="font-label-pill text-[10px] text-on-surface-variant uppercase flex items-center gap-1 font-semibold">
                      <Layers className="w-3.5 h-3.5 text-secondary" />
                      Material Composition
                    </span>
                    <span className="font-body-sm text-[14px] text-primary font-bold leading-tight">
                      {analysisResult.materialType}
                    </span>
                  </div>

                  {/* Contamination */}
                  <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col gap-1">
                    <span className="font-label-pill text-[10px] text-on-surface-variant uppercase flex items-center gap-1 font-semibold">
                      <Droplets className="w-3.5 h-3.5 text-secondary" />
                      Visible Contamination
                    </span>
                    <span className="font-body-sm text-[13px] text-on-surface leading-snug">
                      {analysisResult.visibleContamination}
                    </span>
                  </div>

                </div>

                {/* Physical Preparation Advice */}
                <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col gap-1">
                  <span className="font-label-pill text-[10px] text-secondary uppercase flex items-center gap-1 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                    Preparation &amp; Handling
                  </span>
                  <p className="font-body-sm text-[13px] text-on-surface leading-snug">
                    {analysisResult.preparationAdvice}
                  </p>
                </div>

                {/* Expandable Telemetry & Reasoning */}
                <details className="rounded-xl bg-surface-container-low/60 border border-surface-container p-2 text-[12px] group">
                  <summary className="font-label-pill uppercase text-on-surface-variant font-bold cursor-pointer select-none flex items-center justify-between">
                    <span>Optical Reasoning &amp; Scope Note</span>
                    <span className="text-[13px] text-on-surface-variant group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <div className="pt-2 text-on-surface-variant leading-relaxed flex flex-col gap-1.5 border-t border-surface-container/60 mt-1">
                    <p>{analysisResult.reasoning}</p>
                    <p className="text-[11px] text-on-surface-variant/80 border-t border-surface-container/40 pt-1">
                      <strong>Scope:</strong> {analysisResult.disclaimer}
                    </p>
                  </div>
                </details>

                {/* Verify Local Recycling Rules CTA */}
                <Link
                  to="/ecoverify"
                  id="verify-local-rules-cta"
                  state={{
                    itemName: analysisResult.itemName,
                    materialType: analysisResult.materialType,
                    category: analysisResult.category,
                    visibleContamination: analysisResult.visibleContamination,
                    preparationAdvice: analysisResult.preparationAdvice,
                    reasoning: analysisResult.reasoning,
                    fromMatterLens: true,
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-primary-container hover:bg-primary active:scale-[0.99] text-secondary-fixed font-headline-sm text-[15px] font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <ShieldCheck className="w-5 h-5 text-secondary-fixed" />
                  <span>Verify Local Recycling Rules</span>
                </Link>

                {/* Explore NextWorth Second Life CTA */}
                <Link
                  to="/nextworth"
                  id="explore-nextworth-cta"
                  state={{
                    itemName: analysisResult.itemName,
                    material: analysisResult.materialType,
                    category: analysisResult.category,
                    condition: analysisResult.visibleContamination?.toLowerCase().includes('clean') ? 'good' : 'fair',
                    fromScan: true,
                  }}
                  className="w-full inline-flex items-center justify-between px-5 py-3 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-headline-sm text-[13px] font-bold transition-all border border-surface-container-highest"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-secondary" />
                    <span>Find Second Life (NextWorth)</span>
                  </span>
                  <span className="text-[11px] text-secondary font-bold">
                    Reuse / Repair →
                  </span>
                </Link>

                {/* Analyze Another Item CTA */}
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary font-headline-sm text-[14px] font-bold transition-all mt-1"
                >
                  <RefreshCw className="w-4 h-4 text-secondary" />
                  <span>Analyze Another Item</span>
                </button>
              </div>
            )}

            {/* EMPTY STATE (Right Column placeholder) */}
            {!analysisResult && (
              <div className="bg-surface-container-lowest rounded-3xl p-space-xl shadow-xs border border-surface-container-high/60 flex flex-col items-center justify-center text-center gap-space-md min-h-[360px]">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                  <Scan className="w-8 h-8 text-secondary" />
                </div>
                <div className="flex flex-col gap-1 max-w-xs">
                  <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                    Awaiting Image Input
                  </h3>
                  <p className="font-body-sm text-caption text-on-surface-variant">
                    Upload an item or snap a photo on the left. The optical classification and composition telemetry will appear here.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
