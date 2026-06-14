import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  IoLocationOutline,
  IoClose,
  IoCloudUploadOutline,
  IoChevronBack,
  IoChevronForward,
  IoBarcodeOutline
} from "react-icons/io5";


export const Home = () => {
  const [guitars, setGuitars] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedGuitar, setSelectedGuitar] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const loaderRef = useRef(null);

  const fetchGuitars = async (pageNumber) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5050/api/guitars?page=${pageNumber}&limit=6`);
      const { guitars: newGuitars, hasMore: moreAvailable } = res.data;

      setGuitars((prev) => (pageNumber === 1 ? newGuitars : [...prev, ...newGuitars]));
      setHasMore(moreAvailable);
    } catch (err) {
      console.error("Error loading guitars:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial guitars and when page changes
  useEffect(() => {
    fetchGuitars(page);
  }, [page]);

  // Set up Intersection Observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, loading]);

  // Reset active image index when selected guitar changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedGuitar]);

  // Helper to resolve Image URL (handles Cloudinary and local static fallback)
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath; // Cloudinary URL
    return `http://localhost:5050${imagePath}`; // Local static upload path
  };

  // Form input file change handler with client-side validation
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (selectedFiles.length + files.length > 5) {
      toast.error("Error: You can upload a maximum of 5 images.");
      return;
    }

    const invalidFile = files.find((file) => file.size > 10 * 1024 * 1024);
    if (invalidFile) {
      toast.error("Error: Each file size must be less than 10MB.");
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  // Remove file thumbnail from upload selection
  const removeFile = (index) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Clean up previews to avoid memory leaks
  const closeUploadModal = () => {
    setIsUploadOpen(false);
    previews.forEach((url) => URL.revokeObjectURL(url));
    setBrand("");
    setModel("");
    setSerialNumber("");
    setLocation("");
    setDescription("");
    setSelectedFiles([]);
    setPreviews([]);
  };

  // Form submit handler to report guitar
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      toast.error("Error: At least one guitar image is required.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("brand", brand);
      formData.append("model", model);
      formData.append("serialNumber", serialNumber);
      formData.append("location", location);
      formData.append("description", description);

      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      const res = await axios.post("http://localhost:5050/api/guitars", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data?.message || "Report submitted successfully!");
      closeUploadModal();

      // Trigger list refresh
      if (page === 1) {
        fetchGuitars(1);
      } else {
        setPage(1);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit report");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-6xl py-2 font-extrabold tracking-tight bg-linear-to-r from-white via-zinc-400 to-zinc-600 bg-clip-text text-transparent">
          Stolen Guitars Catalog
        </h1>
        <p className="mt-4 text-zinc-400 text-lg max-w-xl mx-auto font-light">
          Help track down missing gear. View reported equipment below.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {guitars.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/50">

            <h3 className="text-xl font-bold text-zinc-300">No Guitars Reported Yet</h3>
            <p className="text-zinc-500 mt-2">When users upload missing instruments, they will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guitars.map((guitar) => (
              <div
                key={guitar._id}
                onClick={() => setSelectedGuitar(guitar)}
                className="group relative bg-zinc-950 border border-zinc-900 rounded-[2rem] overflow-hidden hover:border-zinc-800 hover:-translate-y-1 transition-all duration-300 shadow-2xl flex flex-col h-[420px] cursor-pointer"
              >
                <div className="h-[200px] w-full relative overflow-hidden bg-zinc-900">
                  {guitar.images && guitar.images.length > 0 ? (
                    <img
                      src={getImageUrl(guitar.images[0])}
                      alt={guitar.brand}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-zinc-900 to-zinc-950 flex flex-col items-center justify-center text-zinc-600">
                      <span className="text-xs uppercase tracking-wider font-semibold">No Image Available</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-white text-2xl font-bold font-sans tracking-tight truncate group-hover:text-violet-400 transition-colors">
                      {guitar.brand}
                    </h2>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-full inline-flex items-center gap-1.5 font-medium">
                        {guitar.model}
                      </span>
                      <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-full inline-flex items-center gap-1.5 font-medium">
                        <IoBarcodeOutline className="text-violet-400" /> SN: {guitar.serialNumber}
                      </span>
                      <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-full inline-flex items-center gap-1.5 font-medium">
                        <IoLocationOutline className="text-violet-400" /> {guitar.location}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGuitar(guitar);
                    }}
                    className="w-full py-3 bg-white text-black font-semibold text-center rounded-full hover:bg-zinc-200 transition-colors duration-200 cursor-pointer shadow-md"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div ref={loaderRef} className="flex justify-center mt-12 h-10">
          {loading && (
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></span>
              Loading more gear...
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setIsUploadOpen(true)}
        className="fixed bottom-6 left-6 z-40 bg-[var(--primary-color)] hover:opacity-90 text-white font-semibold px-6 py-4 rounded-full shadow-2xl flex items-center gap-2 transition-all transform hover:scale-105 duration-200 cursor-pointer text-sm md:text-base"
      >
        <IoCloudUploadOutline size={22} />
        <span>Upload</span>
      </button>

      {isUploadOpen && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={closeUploadModal}
        >
          <div
            className="bg-zinc-950 border border-zinc-850 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl p-8 flex flex-col my-8 relative animate-in fade-in zoom-in-95 duration-205 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeUploadModal}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full border border-zinc-800 transition-colors cursor-pointer"
            >
              <IoClose size={20} />
            </button>

            <h2 className="text-white text-2xl font-extrabold tracking-tight mb-6 bg-linear-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Report a Stolen Guitar
            </h2>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Guitar Brand *</label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Gibson, Fender, PRS, Ibanez"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Model *</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Ibanez RG652AHM Prestige Nebula Green Burst"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Serial Number *</label>
                <input
                  type="text"
                  required
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="e.g. SN-87163"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Last Seen Location *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. London, UK"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide any helpful details (scratches, modifications, date stolen...)"
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors resize-none font-sans"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Photos * (Max 5, up to 10MB each)
                </label>

                <input
                  type="file"
                  id="guitar-images"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <label
                  htmlFor="guitar-images"
                  className="w-full border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 rounded-2xl py-6 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-900 transition-all gap-1"
                >
                  <IoCloudUploadOutline size={32} className="text-zinc-500 animate-bounce" />
                  <span className="text-sm font-semibold text-zinc-300">Choose Images</span>
                  <span className="text-xs text-zinc-500">JPG, PNG, WEBP</span>
                </label>

                {previews.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-zinc-800">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer"
                        >
                          <IoClose size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeUploadModal}
                  className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-white font-semibold rounded-xl transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 disabled:bg-zinc-900 disabled:text-zinc-700 transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin"></span>
                      Reporting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedGuitar && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300"
          onClick={() => setSelectedGuitar(null)}
        >
          <div
            className="bg-zinc-950 border border-zinc-850 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedGuitar(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full border border-zinc-800 transition-colors z-10 cursor-pointer"
            >
              <IoClose size={24} />
            </button>

            <div className="h-80 w-full relative bg-zinc-900 overflow-hidden">
              {selectedGuitar.images && selectedGuitar.images.length > 0 ? (
                <>
                  <img
                    src={getImageUrl(selectedGuitar.images[activeImageIndex])}
                    alt={selectedGuitar.brand}
                    className="w-full h-full object-cover transition-all duration-350"
                  />

                  {selectedGuitar.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImageIndex((prev) => (prev === 0 ? selectedGuitar.images.length - 1 : prev - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full border border-zinc-800 transition-colors cursor-pointer"
                      >
                        <IoChevronBack size={20} />
                      </button>
                      <button
                        onClick={() => setActiveImageIndex((prev) => (prev === selectedGuitar.images.length - 1 ? 0 : prev + 1))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full border border-zinc-800 transition-colors cursor-pointer"
                      >
                        <IoChevronForward size={20} />
                      </button>

                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-xs">
                        {selectedGuitar.images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${activeImageIndex === idx ? "bg-white scale-125" : "bg-white/50"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col items-center justify-center text-zinc-600">
                  <span className="text-sm uppercase tracking-wider font-semibold">No Image Available</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
            </div>

            <div className="p-8">
              <h2 className="text-white text-3xl font-extrabold tracking-tight">
                {selectedGuitar.brand}
              </h2>

              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-full inline-flex items-center gap-1.5 font-medium">
                  {selectedGuitar.model}
                </span>
                <span className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-full inline-flex items-center gap-1.5 font-medium">
                  <IoBarcodeOutline className="text-violet-400" /> SN: {selectedGuitar.serialNumber}
                </span>
                <span className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-full inline-flex items-center gap-1.5 font-medium">
                  <IoLocationOutline className="text-violet-400" /> {selectedGuitar.location}
                </span>
              </div>

              <div className="mt-6">
                <h4 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                  Description & Details
                </h4>
                <p className="mt-2 text-zinc-300 leading-relaxed text-base font-sans whitespace-pre-line">
                  {selectedGuitar.description || "No description provided."}
                </p>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setSelectedGuitar(null)}
                  className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-white font-medium rounded-full transition-colors cursor-pointer"
                >
                  Close View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


