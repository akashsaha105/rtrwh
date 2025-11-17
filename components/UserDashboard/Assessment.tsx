"use client";

import { auth, firestore } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, collection, query, where, getDocs, getDoc, setDoc, serverTimestamp,updateDoc } from "firebase/firestore";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";


import { db } from "@/firebase"; // your Firestore client init
import { computeFeasibility } from "@/lib/computeFeasibility";


interface City {
  location: {
    city: string;
    lat?: number;
    lng?: number;
  };
}

interface RoofTopData {
  rooftop: {
    area: string;
    type: string;
    dwellers: string;
    space: string;
  };
}

interface ReportData {
  assessmentId: string;
  name?: string;
  avgRainfall_mm: number;
  litres_per_year: number;
  runoffCoefficient: number;
  feasibilityScore: number;
  category: "High" | "Moderate" | "Low";
  breakdown: {
    roofScore: number;
    openSpaceScore: number;
    rainfallScore: number;
    gwScore: number;
    soilScore: number;
  };
  explanation: string;
  recommendedStructures: {
    type: string;
    reason?: string;
    confidence?: number;
  }[];
  recommendedDimensions: {
    trench?: { length: number; width: number; depth: number; unit: string };
    pits?: { count: number; diameter: number; depth: number; unit: string };
    shaft?: { diameter: number; depth: number; unit: string };
    pit?: { count: number; diameter: number; depth: number; unit: string };
  };
  costEstimate: {
    CAPEX: number;
    materialCost: number;
    labourCost: number;
    annualSavings: number;
    paybackPeriod: number;
    waterTariff: number;
  };
  generatedAt: { seconds: number; nanoseconds: number } | null;
  pdfUrl?: string | null;

  // NEW: align with computeFeasibility.ts
  costBenefit?: {
    installationCost_INR: number;
    annualMaintenance_INR: number;
    expectedLifespan_years: number;
    annualWaterBillSavings_INR: number;
    subsidyEligible: boolean;
    subsidyRate_fraction: number;
    subsidyAmount_INR: number;
    netUpfrontCostAfterSubsidy_INR: number;
    paybackPeriod_years: number | null;
    roi10yr_multiple: number | null;
  };
}







  function GenerateReportButton({ assessmentId }: { assessmentId: string }) {
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const aRef = doc(db, "assessments", assessmentId);
      const aSnap = await getDoc(aRef);
      if (!aSnap.exists()) {
        alert("Assessment not found");
        setLoading(false);
        return;
      }
      const assessmentData = { id: assessmentId, ...aSnap.data() } as any;
      const report = computeFeasibility(assessmentData);
      // write report into reports/{assessmentId}
      const rRef = doc(db, "reports", assessmentId);
      await setDoc(rRef, report);
      // update assessment
      await updateDoc(aRef, { status: "done", reportRef: `reports/${assessmentId}` });
      alert("Report generated");
    } catch (err) {
      console.error(err);
      alert("Error generating report: " + String(err));
    } finally {
      setLoading(false);
    }
  }
}


async function getCoordinates(cityName: string) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${cityName}`
    );
    const data = await response.json();
    if (data.length > 0) {
      const latitude = parseFloat(data[0].lat);
      const longitude = parseFloat(data[0].lon);
      return { latitude, longitude };
    } else {
      return null;
    }
  } catch (err) {
    console.error("Error fetching coordinates:", err);
    return null;
  }
}

function sqftToSqm(sqft: number): number {
  const sqm = sqft * 0.092903; // 1 ft² = 0.092903 m²
  return parseFloat(sqm.toFixed(4)); // rounding to 4 decimal places
}

const Assessment: React.FC = () => {
  const t = useTranslations("assessment");

  // User data state
  const [area, setArea] = useState("");
  const [type, setType] = useState("");
  const [space, setSpace] = useState("");
  const [dwellers, setDwellers] = useState("");

  // Report data state
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessmentStatus, setAssessmentStatus] = useState<"processing" | "done" | "error" | "none">("none");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Storage Tank Calculations
  const [storageDays, setStorageDays] = useState("");

  // Check or create assessment document
  const checkOrCreateAssessment = React.useCallback(async (uid: string, assessmentData: {
    name: string;
    location: { lat: number; lng: number };
    dwellers: number;
    roofArea_m2: number;
    openSpace_m2: number;
    roofMaterial: string;
    roofSlope: string;
  }) => {
    try {
      // Check for existing assessment
      const assessmentsQuery = query(
        collection(firestore, "assessments"),
        where("userId", "==", uid)
      );
      const existingAssessments = await getDocs(assessmentsQuery);

      let assessmentDocId: string;

      if (!existingAssessments.empty) {
        // Use existing assessment
        const existingAssessment = existingAssessments.docs[0];
        assessmentDocId = existingAssessment.id;
        const assessmentData = existingAssessment.data();
        setAssessmentStatus(assessmentData.status || "processing");
        if (assessmentData.error) {
          setErrorMessage(assessmentData.error);
        }
      } else {
        // Create new assessment
        const newAssessmentRef = doc(collection(firestore, "assessments"));
        assessmentDocId = newAssessmentRef.id;
        setAssessmentStatus("processing");

        await setDoc(newAssessmentRef, {
          ...assessmentData,
          userId: uid,
          status: "processing",
          createdAt: serverTimestamp(),
        });
      }

      // Listen to assessment status
      const assessmentRef = doc(firestore, "assessments", assessmentDocId);
      const unsubscribeAssessment = onSnapshot(assessmentRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setAssessmentStatus(data.status || "processing");
          if (data.error) {
            setErrorMessage(data.error);
            setLoading(false);
          }
        }
      });

      // Listen to report with maximum wait time
      const reportRef = doc(firestore, "reports", assessmentDocId);
      let reportCheckTimeout: NodeJS.Timeout | null = null;
      const maxWaitTime = 10000; // 15 seconds maximum wait
      const startTime = Date.now();
      
      // Set maximum timeout
      const maxTimeout = setTimeout(() => {
        if (!report) {
          setLoading(false);
          setAssessmentStatus("error");
          setErrorMessage("Assessment is taking longer than expected. Please refresh the page.");
        }
      }, maxWaitTime);

      const unsubscribeReport = onSnapshot(reportRef, (snapshot) => {
        if (snapshot.exists()) {
          const reportData = snapshot.data() as ReportData;
          setReport(reportData);
          setAssessmentStatus("done");
          setLoading(false);
          clearTimeout(maxTimeout);
          if (reportCheckTimeout) {
            clearTimeout(reportCheckTimeout);
            reportCheckTimeout = null;
          }
        } else {
          // Check if we've exceeded max wait time
          const elapsed = Date.now() - startTime;
          if (elapsed > maxWaitTime) {
            clearTimeout(maxTimeout);
            setLoading(false);
            setAssessmentStatus("error");
            setErrorMessage("Assessment timeout. Please try again.");
            return;
          }

          // Check assessment status to determine if we should wait
          const assessmentDoc = doc(firestore, "assessments", assessmentDocId);
          getDoc(assessmentDoc).then((assessmentSnap) => {
            if (assessmentSnap.exists()) {
              const assessmentData = assessmentSnap.data();
              const status = assessmentData?.status || "processing";
              
              if (status === "error") {
                clearTimeout(maxTimeout);
                setAssessmentStatus("error");
                setErrorMessage(assessmentData?.error || "Unknown error");
                setLoading(false);
              } else if (status === "done") {
                // Assessment marked as done but report missing - wait a bit
                if (!reportCheckTimeout) {
                  reportCheckTimeout = setTimeout(() => {
                    clearTimeout(maxTimeout);
                    setLoading(false);
                  }, 2000); // Reduced to 2 seconds
                }
              } else {
                // Still processing, keep loading (but check timeout)
                if (elapsed < maxWaitTime) {
                  setLoading(true);
                }
              }
            } else {
              clearTimeout(maxTimeout);
              setLoading(false);
            }
          }).catch(() => {
            clearTimeout(maxTimeout);
            setLoading(false);
          });
        }
      });

      return () => {
        unsubscribeAssessment();
        unsubscribeReport();
        clearTimeout(maxTimeout);
        if (reportCheckTimeout) {
          clearTimeout(reportCheckTimeout);
        }
      };
    } catch (error) {
      console.error("Error creating/checking assessment:", error);
      setAssessmentStatus("error");
      setErrorMessage("Failed to create assessment. Please try again.");
      setLoading(false);
    }
  }, []);

  // Load user data and create/check assessment
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = doc(firestore, "users", currentUser.uid);

        const unsubscribeSnapshot = onSnapshot(docRef, async (snapshot) => {
          if (snapshot.exists()) {
            try {
              const data = snapshot.data();

              const getRoofTopData = data as RoofTopData;
              setArea(getRoofTopData?.rooftop?.area ? String(getRoofTopData.rooftop.area) : "0");
              setType(getRoofTopData?.rooftop?.type || "");
              setSpace(getRoofTopData?.rooftop?.space ? String(getRoofTopData.rooftop.space) : "0");
              setDwellers(getRoofTopData?.rooftop?.dwellers ? String(getRoofTopData.rooftop.dwellers) : "0");

              const getCity = data as City;

              // Get location coordinates
              let coords: { lat: number; lng: number } | null = null;
              if (getCity.location.lat && getCity.location.lng && 
                  getCity.location.lat !== 0 && getCity.location.lng !== 0) {
                coords = { lat: getCity.location.lat, lng: getCity.location.lng };
              } else if (getCity.location.city) {
                const fetchedCoords = await getCoordinates(getCity.location.city);
                if (fetchedCoords && fetchedCoords.latitude !== 0 && fetchedCoords.longitude !== 0) {
                  coords = { lat: fetchedCoords.latitude, lng: fetchedCoords.longitude };
                }
              }

              // Check if all required data is available
              const hasRequiredData = getRoofTopData.rooftop.area && 
                                     getRoofTopData.rooftop.type && 
                                     getRoofTopData.rooftop.space && 
                                     getRoofTopData.rooftop.dwellers;
              
              const hasValidCoords = coords && coords.lat !== 0 && coords.lng !== 0;

              if (hasRequiredData && hasValidCoords && coords) {
                await checkOrCreateAssessment(currentUser.uid, {
                  name: data.fullName || data.username || "Assessment",
                  location: coords,
                  dwellers: parseInt(getRoofTopData.rooftop.dwellers) || 0,
                  roofArea_m2: sqftToSqm(parseFloat(getRoofTopData.rooftop.area)),
                  openSpace_m2: sqftToSqm(parseFloat(getRoofTopData.rooftop.space)),
                  roofMaterial: getRoofTopData.rooftop.type,
                  roofSlope: "moderate",
                });
              } else {
                // Missing required data - show appropriate message
                setLoading(false);
                if (!hasRequiredData) {
                  setAssessmentStatus("none");
                  setErrorMessage("Please complete your profile information (rooftop area, type, space, and dwellers).");
                } else if (!hasValidCoords) {
                  setAssessmentStatus("none");
                  setErrorMessage("Please provide a valid city/location in your profile to generate the assessment.");
                }
              }
            } catch (e) {
              console.log(e);
              setLoading(false);
            }
          } else {
            console.log("No Data found");
            setLoading(false);
          }
        });

        return () => unsubscribeSnapshot();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [checkOrCreateAssessment]);

  // Calculate derived values from report or fallback
  const harvestPotential = report?.litres_per_year || 0;
  const perPersonAvail = report && +dwellers > 0 ? report.litres_per_year / +dwellers : 0;
  const efficiency = report?.runoffCoefficient ? report.runoffCoefficient * 100 : 85;
  const feasibility = report ? {
    feasible: report.category !== "Low",
    reason: report.explanation || "Feasibility assessment in progress.",
  } : assessmentStatus === "processing" ? {
    feasible: false,
    reason: "Generating feasibility assessment... This may take a few moments.",
  } : assessmentStatus === "error" ? {
    feasible: false,
    reason: errorMessage || "An error occurred while generating the assessment. Please try again.",
  } : assessmentStatus === "none" ? {
    feasible: false,
    reason: errorMessage || "Please complete your profile information to generate an assessment.",
  } : {
    feasible: false,
    reason: "Assessment data not available. Please ensure your profile information is complete.",
  };
  const suggestedStructure =
    report?.recommendedStructures && report.recommendedStructures.length > 0
      ? report.recommendedStructures[0].type
      : "Recharge Pit";

  // Storage Tank Calculations
  const tankVolume = +dwellers * 135 * (+storageDays || 0);
  const tankUtilization = tankVolume > 0 
    ? (Math.min(harvestPotential, tankVolume) / tankVolume) * 100 
    : 0;

  const usageBreakdown = [
    { name: "Drinking", value: 15 },
    { name: "Cooking", value: 25 },
    { name: "Cleaning", value: 30 },
    { name: "Gardening", value: 20 },
    { name: "Others", value: 10 },
  ];

  const COLORS = ["#14b8a6", "#6366f1", "#f59e42", "#eab308", "#64748b"];

  // generate report for the current user's assessment
  async function generate() {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be signed in to generate a report.");
        setLoading(false);
        return;
      }

      // find the user's assessment
      const assessmentsQuery = query(
        collection(firestore, "assessments"),
        where("userId", "==", user.uid)
      );
      const existingAssessments = await getDocs(assessmentsQuery);
      if (existingAssessments.empty) {
        alert("No assessment found for the current user.");
        setLoading(false);
        return;
      }

      const assessmentDoc = existingAssessments.docs[0];
      const assessmentData = { id: assessmentDoc.id, ...assessmentDoc.data() } as any;

      // compute report
      const reportObj = computeFeasibility(assessmentData);

      // write report into reports/{assessmentId}
      const rRef = doc(db, "reports", assessmentDoc.id);
      await setDoc(rRef, reportObj);

      // update assessment status
      const aRef = doc(db, "assessments", assessmentDoc.id);
      await updateDoc(aRef, { status: "done", reportRef: `reports/${assessmentDoc.id}` });

      alert("Report generated");
    } catch (err) {
      console.error(err);
      alert("Error generating report: " + String(err));
    } finally {
      setLoading(false);
    }
  }

  if (loading && assessmentStatus === "processing") {
    return (
      <div className="p-8 relative min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Generating feasibility assessment...</p>
          <p className="text-slate-400 text-sm mt-2">This may take 10-30 seconds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 relative min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">

      {/* Dashboard Overview */}
      <div className="relative mb-12">
        <h2
          className="text-3xl font-bold mb-6 flex items-center gap-2 text-teal-400 drop-shadow"
          id="overview"
          data-tab="assessment"
        >
          {t("dashboardOverview")}
        </h2>
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: t("rooftopArea"), value: area + " sq. ft." },
            { title: t("rooftopType"), value: type },
            { title: t("availableSpace"), value: space + " sq. ft." },
            { title: t("noOfDwellers"), value: dwellers },
          ].map((item, i) => (
            <div
              key={i}
              className="relative p-6 rounded-2xl bg-slate-900/70 backdrop-blur-lg border border-slate-700 shadow-lg hover:shadow-xl transition"
            >
              <h3
                className="text-lg font-semibold text-slate-200"
                id={"rooftop-" + i}
                data-tab="assessment"
              >
                {item.title}
              </h3>
              <p className="text-2xl font-bold mt-2 text-teal-400">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Feasibility Check Section  */}
      <div className="mb-10">
        <h3 className="text-lg font-medium mb-3 tracking-wide text-slate-300/80 uppercase">
          Feasibility overview
        </h3>
        <div
          className={`
        relative overflow-hidden rounded-2xl border bg-gradient-to-br shadow-sm transition-all duration-300
        ${
          assessmentStatus === "processing"
            ? "from-slate-900/90 via-slate-900/80 to-amber-900/30 border-amber-600/40"
            : assessmentStatus === "error"
            ? "from-slate-950 via-slate-900 to-rose-950/40 border-rose-700/50"
            : assessmentStatus === "none"
            ? "from-slate-950 via-slate-900 to-sky-950/40 border-sky-700/40"
            : feasibility.feasible
            ? "from-slate-950 via-slate-900 to-emerald-950/35 border-emerald-600/50"
            : "from-slate-950 via-slate-900 to-rose-950/40 border-rose-700/40"
        }
          `}
        >
          <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen bg-[radial-gradient(circle_at_top,_#22d3ee19,_transparent_55%),radial-gradient(circle_at_bottom,_#4ade8014,_transparent_55%)]" />

          <div className="relative p-5 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span
          className={`
            inline-flex h-2.5 w-2.5 rounded-full
            ${
              assessmentStatus === "processing"
            ? "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.7)]"
            : assessmentStatus === "error"
            ? "bg-rose-400 shadow-[0_0_12px_rgba(248,113,113,0.7)]"
            : assessmentStatus === "none"
            ? "bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.7)]"
            : feasibility.feasible
            ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]"
            : "bg-rose-400 shadow-[0_0_12px_rgba(248,113,113,0.7)]"
            }
          `}
            />
            <span
          className={`
            text-3sm font-semibold tracking-tight
            ${
              assessmentStatus === "processing"
            ? "text-amber-100/90"
            : assessmentStatus === "error"
            ? "text-rose-100/90"
            : assessmentStatus === "none"
            ? "text-sky-100/90"
            : feasibility.feasible
            ? "text-emerald-100/90"
            : "text-rose-100/90"
            }
          `}
            >
          {assessmentStatus === "processing"
            ? "Assessment in progress"
            : assessmentStatus === "error"
            ? "Assessment failed"
            : assessmentStatus === "none"
            ? "Setup required"
            : feasibility.feasible
            ? "Site is feasible"
            : "Site not feasible"}
            </span>
          </div>

          {report && (
            <span
          className={`
            inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium
            ${
              report.category === "High"
            ? "border-emerald-500/60 bg-emerald-500/5 text-emerald-100"
            : report.category === "Moderate"
            ? "border-amber-400/60 bg-amber-500/5 text-amber-100"
            : "border-rose-500/60 bg-rose-500/5 text-rose-100"
            }
          `}
            >
          <span className="uppercase tracking-wide opacity-80">
            {report.category}
          </span>
          <span className="text-sm text-slate-200/70">
            {report.feasibilityScore}/100
          </span>
            </span>
          )}
        </div>

        <p className="text-2sm leading-relaxed text-slate-200/80">
          {feasibility.reason}
        </p>

        {assessmentStatus === "error" && errorMessage && (
          <div className="mt-3 rounded-lg border border-rose-700/50 bg-rose-950/40 px-3 py-2 text-xs text-rose-100/90">
            <span className="font-semibold">Details: </span>
            <span className="text-rose-100/80">{errorMessage}</span>
          </div>
        )}

        {assessmentStatus === "none" && errorMessage && (
          <div className="mt-3 rounded-lg border border-sky-700/50 bg-sky-950/40 px-3 py-2 text-xs text-sky-100/90">
            <span className="font-semibold">Action needed: </span>
            <span className="text-sky-100/80">{errorMessage}</span>
          </div>
        )}

        {report?.breakdown && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 text-2sm text-slate-300/80">
            <div className="flex items-center justify-between rounded-lg bg-slate-700/60 px-2.5 py-1.5">
          <span className="text-slate-400/90">Roof</span>
          <span className="font-semibold text-slate-100">
            {report.breakdown.roofScore}
          </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-700/60 px-2.5 py-1.5">
          <span className="text-slate-400/90">Space</span>
          <span className="font-semibold text-slate-100">
            {report.breakdown.openSpaceScore}
          </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-700/60 px-2.5 py-1.5">
          <span className="text-slate-400/90">Rainfall</span>
          <span className="font-semibold text-slate-100">
            {report.breakdown.rainfallScore}
          </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-700/60 px-2.5 py-1.5">
          <span className="text-slate-400/90">Groundwater</span>
          <span className="font-semibold text-slate-100">
            {report.breakdown.gwScore}
          </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-700/60 px-2.5 py-1.5">
          <span className="text-slate-400/90">Soil</span>
          <span className="font-semibold text-slate-100">
            {report.breakdown.soilScore}
          </span>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={generate}
            disabled={loading || assessmentStatus === "processing"}
            className={`
          inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium
          bg-gradient-to-r from-cyan-500/90 via-teal-500/90 to-emerald-500/90
          text-slate-950 shadow-[0_0_0_1px_rgba(15,23,42,0.8),0_18px_45px_rgba(8,47,73,0.55)]
          transition-all duration-200
          hover:from-cyan-400 hover:via-teal-400 hover:to-emerald-400
          disabled:opacity-50 disabled:cursor-not-allowed
          ${loading || assessmentStatus === "processing" ? "" : "hover:-translate-y-[1px]"}
            `}
          >
            {loading || assessmentStatus === "processing"
          ? "Generating assessment..."
          : "Generate feasibility report"}
          </button>

          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-xl border border-slate-600/70 bg-slate-900/70 px-5 py-2.5 text-sm font-medium text-slate-200/90 shadow-sm hover:border-slate-400/70 hover:bg-slate-900 transition-colors"
          >
            Refresh data
          </button>
        </div>
          </div>
        </div>
      </div>

      {/* Suggested Recharge Structure Section */}
      <div className="mb-10">
        <h3 className="text-lg font-medium mb-3 tracking-wide text-slate-300/80 uppercase">
          Suggested recharge structures
        </h3>
        <div className="relative overflow-hidden rounded-2xl border border-slate-700/70 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 shadow-sm">
          <div className="absolute inset-0 pointer-events-none opacity-25 mix-blend-screen bg-[radial-gradient(circle_at_top,_#6366f119,_transparent_55%),radial-gradient(circle_at_bottom,_#22c55e19,_transparent_55%)]" />
          <div className="relative p-5 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          {report?.recommendedStructures && report.recommendedStructures.length > 0 ? (
            report.recommendedStructures.map((struct, idx) => (
          <div
            key={idx}
            className="group flex flex-col gap-2 rounded-xl border border-slate-700/60 bg-slate-950/70 px-4 py-3 shadow-sm hover:border-indigo-400/60 hover:bg-slate-900/80 transition-colors cursor-pointer"
            title={struct.reason || ""}
            onClick={() => {
              if (struct.reason) alert(struct.reason);
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
            <span className="text-xl">
              {struct.type === "Recharge Pit"
                ? "◼︎"
                : struct.type === "Recharge Trench"
                ? "▬"
                : struct.type === "Recharge Shaft"
                ? "◎"
                : "◆"}
            </span>
            <span className="text-xl font-semibold text-slate-50">
              {struct.type}
            </span>
              </div>
              {struct.confidence && (
            <span className="text-ls text-indigo-200/80">
              {Math.round(struct.confidence * 100)}% match
            </span>
              )}
            </div>

            {struct.reason && (
              <div className="text-ls leading-snug text-slate-300/80">
            {struct.reason}
              </div>
            )}

            <div className="text-ls text-slate-300/80">
              {(() => {
            if (!report?.recommendedDimensions) return null;

            // Firestore stores trench fields as *_m. Convert to generic
            const dimsForType =
              struct.type === "Recharge Pit"
                ? report.recommendedDimensions.pit
                : struct.type === "Recharge Trench"
                ? report.recommendedDimensions.trench
                : struct.type === "Recharge Shaft"
                ? report.recommendedDimensions.shaft
                : undefined;

            if (!dimsForType) return null;

            // Normalize keys from Firestore (width_m, depth_m, length_m)
            const normalize = (d: any) => ({
              count: d.count,
              diameter: d.diameter ?? d.diameter_m,
              width: d.width ?? d.width_m,
              depth: d.depth ?? d.depth_m,
              length: d.length ?? d.length_m,
              unit: d.unit ?? "m",
            });

            const dims = normalize(dimsForType);

            if (
              struct.type === "Recharge Pit" &&
              dims.count &&
              dims.diameter &&
              dims.depth &&
              dims.unit
            ) {
              return (
                <span>
              <span className="text-slate-400/90">Dimensions: </span>
              {dims.count} pit(s), each {dims.diameter} {dims.unit} Ø ×{" "}
              {dims.depth} {dims.unit} depth
                </span>
              );
            }
            if (
              struct.type === "Recharge Trench" &&
              dims.length &&
              dims.width &&
              dims.depth &&
              dims.unit
            ) {
              return (
                <span>
              <span className="text-slate-400/90">Dimensions: </span>
              {dims.length} {dims.unit} L × {dims.width} {dims.unit} W ×{" "}
              {dims.depth} {dims.unit} D
                </span>
              );
            }
            if (
              struct.type === "Recharge Shaft" &&
              dims.diameter &&
              dims.depth &&
              dims.unit
            ) {
              return (
                <span>
              <span className="text-slate-400/90">Dimensions: </span>
              {dims.diameter} {dims.unit} Ø × {dims.depth} {dims.unit} D
                </span>
              );
            }
            return null;
              })()}
            </div>
          </div>
            ))
          ) : (
            <div className="rounded-xl border border-slate-700/60 bg-slate-950/70 px-4 py-3 text-ls text-slate-200/80">
          Primary recommendation:{" "}
          <span className="font-semibold text-indigo-200">{suggestedStructure}</span>
            </div>
          )}
        </div>

        <p className="mt-3 text-ls text-slate-300/80">
          Recommendations are based on rooftop characteristics, available open space and
          local rainfall patterns for your location.
        </p>

        {report?.recommendedDimensions && (
          <div className="mt-4 border-t border-slate-800/80 pt-4 text-ls text-slate-300/85">
            <p className="mb-2 font-semibold tracking-wide text-slate-100/90">
          Dimension summary
            </p>
            <ul className="space-y-1.5">
          {(() => {
            const rd: any = report.recommendedDimensions;

            const trench = rd.trench
              ? {
              length: rd.trench.length ?? rd.trench.length_m,
              width: rd.trench.width ?? rd.trench.width_m,
              depth: rd.trench.depth ?? rd.trench.depth_m,
              unit: rd.trench.unit ?? "m",
            }
              : null;

            const pits = rd.pits
              ? {
              count: rd.pits.count,
              diameter: rd.pits.diameter ?? rd.pits.diameter_m,
              depth: rd.pits.depth ?? rd.pits.depth_m,
              unit: rd.pits.unit ?? "m",
            }
              : null;

            const shaft = rd.shaft
              ? {
              diameter: rd.shaft.diameter ?? rd.shaft.diameter_m,
              depth: rd.shaft.depth ?? rd.shaft.depth_m,
              unit: rd.shaft.unit ?? "m",
            }
              : null;

            const pit = rd.pit
              ? {
              count: rd.pit.count,
              diameter: rd.pit.diameter ?? rd.pit.diameter_m,
              depth: rd.pit.depth ?? rd.pit.depth_m,
              unit: rd.pit.unit ?? "m",
            }
              : null;

            return (
              <>
            {trench && (
              <li>
                <span className="text-slate-400/90">Trench: </span>
                {trench.length} {trench.unit} L × {trench.width} {trench.unit} W ×{" "}
                {trench.depth} {trench.unit} D
              </li>
            )}
            {pits && (
              <li>
                <span className="text-slate-400/90">Pits: </span>
                {pits.count} pit(s), each {pits.diameter} {pits.unit} Ø ×{" "}
                {pits.depth} {pits.unit} D
              </li>
            )}
            {shaft && (
              <li>
                <span className="text-slate-400/90">Shaft: </span>
                {shaft.diameter} {shaft.unit} Ø × {shaft.depth} {shaft.unit} D
              </li>
            )}
            {pit && (
              <li>
                <span className="text-slate-400/90">Pit: </span>
                {pit.count} pit(s), each {pit.diameter} {pit.unit} Ø ×{" "}
                {pit.depth} {pit.unit} D
              </li>
            )}
              </>
            );
          })()}
            </ul>
          </div>
        )}
         

        {report?.recommendedDimensions && typeof window !== "undefined" && (
          <button
            className="mt-4 inline-flex items-center rounded-xl border border-slate-700/70 bg-slate-950/80 px-4 py-2 text-xs font-medium text-slate-200/90 shadow-sm hover:border-indigo-400/70 hover:bg-slate-900/90 transition-colors"
            onClick={async () => {
              // Extra guards
              if (
          typeof navigator === "undefined" ||
          !("clipboard" in navigator) ||
          !navigator.clipboard ||
          typeof navigator.clipboard.writeText !== "function"
              ) {
          alert("Copy to clipboard is not supported in this browser.");
          return;
              }

              // Normalize Firestore _m fields first
              const rd: any = report.recommendedDimensions;
              const normalized: Record<string, any> = {};

              if (rd.trench) {
          normalized.Trench = {
            length: rd.trench.length ?? rd.trench.length_m,
            width: rd.trench.width ?? rd.trench.width_m,
            depth: rd.trench.depth ?? rd.trench.depth_m,
            unit: rd.trench.unit ?? "m",
          };
              }
              if (rd.pits) {
          normalized.Pits = {
            count: rd.pits.count,
            diameter: rd.pits.diameter ?? rd.pits.diameter_m,
            depth: rd.pits.depth ?? rd.pits.depth_m,
            unit: rd.pits.unit ?? "m",
          };
              }
              if (rd.shaft) {
          normalized.Shaft = {
            diameter: rd.shaft.diameter ?? rd.shaft.diameter_m,
            depth: rd.shaft.depth ?? rd.shaft.depth_m,
            unit: rd.shaft.unit ?? "m",
          };
              }
              if (rd.pit) {
          normalized.Pit = {
            count: rd.pit.count,
            diameter: rd.pit.diameter ?? rd.pit.diameter_m,
            depth: rd.pit.depth ?? rd.pit.depth_m,
            unit: rd.pit.unit ?? "m",
          };
              }

              const lines: string[] = [];

              if (normalized.Pits) {
          const d = normalized.Pits;
          if (d.count && d.diameter && d.depth) {
            lines.push(
              `Pits: ${d.count} pit(s), each ${d.diameter} ${d.unit} Ø × ${d.depth} ${d.unit} depth`
            );
          }
              }

              if (normalized.Trench) {
          const d = normalized.Trench;
          if (d.length && d.width && d.depth) {
            lines.push(
              `Trench: ${d.length} ${d.unit} L × ${d.width} ${d.unit} W × ${d.depth} ${d.unit} D`
            );
          }
              }

              if (normalized.Shaft) {
          const d = normalized.Shaft;
          if (d.diameter && d.depth) {
            lines.push(
              `Shaft: ${d.diameter} ${d.unit} Ø × ${d.depth} ${d.unit} depth`
            );
          }
              }

              if (normalized.Pit) {
          const d = normalized.Pit;
          if (d.count && d.diameter && d.depth) {
            lines.push(
              `Pit: ${d.count} pit(s), each ${d.diameter} ${d.unit} Ø × ${d.depth} ${d.unit} depth`
            );
          }
              }

              const textToCopy = lines.join("\n");
              if (!textToCopy) {
          alert("No dimension data available to copy.");
          return;
              }

              try {
          await navigator.clipboard.writeText(textToCopy);
          alert("Dimensions copied to clipboard.");
              } catch (e) {
          console.error("Clipboard write failed", e);
          alert("Failed to copy to clipboard.");
              }
            }}
          >
            Copy dimension details
          </button>
        )}
          </div>
        </div>
      </div>


      {/* Water Storage Analysis */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-4 text-indigo-400" id="harvest_1">
          {t("rainwaterHarvestAnalysis")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-900/60 to-slate-900/80 border border-teal-700 shadow-lg">
            <h3 className="text-lg font-semibold text-teal-300" id="harvest_2">
              {t("totalHarvestPotential")}
            </h3>
            <p className="text-2xl font-bold mt-2 text-teal-400">
              {Math.round(harvestPotential).toLocaleString()} Liters / Year
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/60 to-slate-900/80 border border-indigo-700 shadow-lg">
            <h3 className="text-lg font-semibold text-indigo-300">
              {t("perPersonAvailability")}
            </h3>
            <p className="text-2xl font-bold mt-2 text-indigo-400">
              {Math.round(perPersonAvail).toLocaleString()} Liters / Year
            </p>
          </div>
        </div>

        {/* Roof Efficiency Card */}
        <div className="relative p-6 mt-10 rounded-2xl border border-teal-700 bg-slate-900/80 backdrop-blur-lg shadow-xl hover:scale-101 transition-transform duration-300">
         
          <h4 className="text-2xl font-bold text-slate-100 mb-3">
            {t("roofEfficiencyHeading")}
          </h4>
          <p className="text-lg text-slate-300 mb-4">
            {efficiency >= 85
              ? t("roofEfficiencyExcellent")
              : efficiency >= 60
              ? t("roofEfficiencyGood")
              : t("roofEfficiencyLow")}
          </p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-teal-400 font-bold text-lg">
              {Math.round(efficiency)}%
            </span>
            <span className="text-slate-400 text-sm">{t("efficiency")}</span>
          </div>
          <div className="w-full h-4 rounded-full bg-teal-900/40">
            <div
              className="h-4 rounded-full bg-gradient-to-r from-teal-400 via-teal-300 to-indigo-400 transition-all duration-1000"
              style={{ width: `${Math.round(efficiency)}%` }}
            ></div>
          </div>
       
        </div>
      </div>

      {/* Recommendation for Groundwater Recharge Structures */}
      <div className="mt-12 mb-12">
        <h4 className="text-2xl font-semibold text-teal-400 mb-6 flex items-center gap-2">
          💧{t("rechargeStructureRecommendations")}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              type: "Recharge Pit",
              dimension: "2m x 2m x 2.5m",
              capacity: "10,000 L",
              suitability: "Best for clayey soil",
            },
            {
              type: "Recharge Trench",
              dimension: "1m x 8m x 2m",
              capacity: "16,000 L",
              suitability: "Good for sandy soil",
            },
            {
              type: "Recharge Shaft",
              dimension: "Ø 1.5m x 12m",
              capacity: "25,000 L",
              suitability: "Ideal for deep aquifers",
            },
          ].map((structure, idx) => (
            <div
              key={idx}
              className="relative bg-slate-900/80 backdrop-blur-lg p-6 rounded-2xl border border-teal-700 shadow-lg hover:shadow-xl transition"
            >
              <h5 className="text-xl font-bold text-teal-300 mb-3">
                {structure.type}
              </h5>
              <ul className="space-y-2 text-sm text-slate-200">
                <li>
                  <strong>{t("dimension")}:</strong> {structure.dimension}
                </li>
                <li>
                  <strong>{t("capacity")}:</strong> {structure.capacity}
                </li>
                <li>
                  <strong>{t("bestFor")}:</strong> {structure.suitability}
                </li>
              </ul>
              <button className="mt-4 px-4 py-2 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white rounded-lg text-sm cursor-pointer shadow">
                {t("learnMore")}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation for Storage Tank */}
      <div className="mb-12">
        <h4 className="text-2xl font-semibold text-indigo-400 mb-6 flex items-center gap-2">
          🛢️ {t("storageTankRecommendations")}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              type: "Underground Tank",
              dimension: "5m x 4m x 3m",
              capacity: "60,000 L",
              utilization: 72,
            },
            {
              type: "Overhead Tank",
              dimension: "3m x 3m x 4m",
              capacity: "36,000 L",
              utilization: 85,
            },
          ].map((tank, idx) => (
            <div
              key={idx}
              className="relative bg-slate-900/80 backdrop-blur-lg border-indigo-700 p-6 rounded-2xl border shadow-lg hover:shadow-xl transition"
            >
              <h5 className="text-xl font-bold text-indigo-300 mb-3">
                {tank.type}
              </h5>
              <ul className="space-y-2 text-sm text-slate-200">
                <li>
                  <strong>{t("dimension")}:</strong> {tank.dimension}
                </li>
                <li>
                  <strong>{t("capacity")}:</strong> {tank.capacity}
                </li>
              </ul>
              <button className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white rounded-lg text-sm cursor-pointer shadow">
                Learn More
              </button>
            </div>
          ))}
        </div>
        {/* <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 backdrop-blur-lg border border-indigo-700 shadow-lg space-y-5">
            <h3 className="text-lg font-semibold text-indigo-300">{t("requiredTankVolume")}</h3>
            <div className="flex flex-col gap-3">
              <label htmlFor="" className="text-slate-200">{t("numberOfDays")}</label>
              <input
                type="text"
                placeholder="e.g., 30 (days of water storage)"
                className="w-100 p-4 rounded-xl bg-slate-800/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 backdrop-blur-sm shadow"
                onChange={(e) => setStorageDays(e.target.value)}
              />
            </div>
            <p className="text-slate-400">
              To store water for dry periods or to match daily consumption:
            </p>
            <p className="text-2xl font-bold mt-2 text-indigo-400">
              {Math.round(tankVolume).toLocaleString()} Liters
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/80 backdrop-blur-lg border border-indigo-700 shadow-lg space-y-5">
            <h3 className="text-lg font-semibold text-indigo-300">
              {t("tankUtilizationEfficiency")}
            </h3>
            <ul className="list-disc ml-5 text-slate-400">
              <li>Shows how effectively your tank is used.</li>
              <li>
                If {">"} 100%, tank is too small; if {"<"} 50%, tank may be
                oversized.
              </li>
            </ul>
            <p className="text-2xl font-bold mt-2 text-indigo-400">
              {+storageDays != 0 && tankVolume > 0
                ? Math.round(tankUtilization).toLocaleString() + "%"
                : "Tank utilization will appear here"}
            </p>
            <div className="w-full h-4 rounded-full bg-indigo-900/40">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-indigo-400 via-teal-300 to-teal-400 transition-all duration-1000"
                style={{
                  width: `${
                    +storageDays == 0 ? 0 : Math.round(tankUtilization)
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div> */}
      </div>

      {/* Usage Breakdown Pie Chart */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-teal-300">
            {t("environmentalImpact")}
          </h3>

          <ResponsiveContainer width="100%" height={260} mt-20>
            <PieChart>
              <Pie
              data={
                report?.environmentalImpact
                ? [
                  {
                    name: "CO₂ saved (kg/yr)",
                    value:
                    report.environmentalImpact.co2Saved_kg_per_year ??
                    0,
                  },
                  {
                    name: "GW recharge (kL/yr)",
                    // convert litres to kilo‑litres so it doesn't dominate
                    value:
                    (report.environmentalImpact
                      .groundwaterRecharge_litres_per_year ?? 0) /
                    1000,
                  },
                  {
                    name: "Tanker trips avoided/yr",
                    value:
                    report.environmentalImpact
                      .tankerTripsAvoided_per_year ?? 0,
                  },
                  {
                    name: "Per capita water saved (kL/yr)",
                    value:
                    (report.environmentalImpact
                      .perCapitaWaterSaved_litres_per_year ?? 0) /
                    1000,
                  },
                  {
                    name: "Energy saved (kWh/yr)",
                    value:
                    report.environmentalImpact
                      .energySaved_kWh_per_year ?? 0,
                  },
                  ].filter((d) => d.value > 0)
                : []
              }
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={90}
              paddingAngle={3}
              isAnimationActive
              labelLine={false}
              label={(entry) =>
                `${entry.name}: ${entry.value.toLocaleString()}`
              }
              >
              {(
                report?.environmentalImpact
                ? [
                  {
                    name: "CO₂ saved (kg/yr)",
                    value:
                    report.environmentalImpact.co2Saved_kg_per_year ??
                    0,
                  },
                  {
                    name: "GW recharge (kL/yr)",
                    value:
                    (report.environmentalImpact
                      .groundwaterRecharge_litres_per_year ?? 0) /
                    1000,
                  },
                  {
                    name: "Tanker trips avoided/yr",
                    value:
                    report.environmentalImpact
                      .tankerTripsAvoided_per_year ?? 0,
                  },
                  {
                    name: "Per capita water saved (kL/yr)",
                    value:
                    (report.environmentalImpact
                      .perCapitaWaterSaved_litres_per_year ?? 0) /
                    1000,
                  },
                  {
                    name: "Energy saved (kWh/yr)",
                    value:
                    report.environmentalImpact
                      .energySaved_kWh_per_year ?? 0,
                  },
                  ].filter((d) => d.value > 0)
                : []
              ).map((entry, index) => (
                <Cell
                key={`cell-env-${index}`}
                fill={
                  [
                  "#38bdf8", // sky-400
                  "#22c55e", // emerald-500
                  "#f97316", // orange-500
                  "#a855f7", // purple-500
                  "#eab308", // yellow-500
                  ][index % 5]
                }
                stroke="#020617"
                strokeWidth={1}
                />
              ))}
              </Pie>

              <Tooltip
              formatter={(value: number, name: string) => {
                // Show units clearly in tooltip
                switch (name) {
                case "CO₂ saved (kg/yr)":
                  return [`${value.toLocaleString()} kg`, name];
                case "GW recharge (kL/yr)":
                  return [
                  `${value.toLocaleString()} kL`,
                  "GW recharge / year",
                  ];
                case "Per capita water saved (kL/yr)":
                  return [
                  `${value.toLocaleString()} kL`,
                  "Per capita water saved / year",
                  ];
                case "Energy saved (kWh/yr)":
                  return [`${value.toLocaleString()} kWh`, name];
                case "Tanker trips avoided/yr":
                default:
                  return [value.toLocaleString(), name];
                }
              }}
              contentStyle={{
                backgroundColor: "#8cd9a1", // slate-950
                border: "1px solid #1f2937",
                borderRadius: "0.5rem",
                color: "#e5e7eb",
                fontSize: "0.75rem",
              }}
              />
            </PieChart>
          </ResponsiveContainer>

          {!report?.environmentalImpact && (
            <p className="mt-3 text-xs text-slate-400">
              Environmental impact data will appear here once the assessment
              report is generated from Firebase.
            </p>
          )}
        </div>

        {/* Environmental Impact Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-900/60 to-slate-900/80 backdrop-blur-lg border border-teal-700 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-teal-300">
        {t("environmentalImpact")}
          </h3>

          {/* Top metrics row */}
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-200 mb-4">
        <div>
          <div className="text-slate-400 text-xs">
            CO₂ saved / year
          </div>
          <div className="font-semibold text-teal-300">
            {report?.environmentalImpact?.co2Saved_kg_per_year != null
          ? `${report.environmentalImpact.co2Saved_kg_per_year.toLocaleString()} kg`
          : "—"}
          </div>
        </div>
        <div>
          <div className="text-slate-400 text-xs">
            Groundwater recharge / year
          </div>
          <div className="font-semibold text-teal-300">
            {report?.environmentalImpact?.groundwaterRecharge_litres_per_year != null
          ? `${report.environmentalImpact.groundwaterRecharge_litres_per_year.toLocaleString()} L`
          : "—"}
          </div>
        </div>
        <div>
          <div className="text-slate-400 text-xs">
            Tanker trips avoided / year
          </div>
          <div className="font-semibold text-teal-300">
            {report?.environmentalImpact?.tankerTripsAvoided_per_year != null
          ? report.environmentalImpact.tankerTripsAvoided_per_year.toLocaleString()
          : "—"}
          </div>
        </div>
        <div>
          <div className="text-slate-400 text-xs">
            Sustainability rating
          </div>
          <div className="font-semibold text-teal-300">
            {report?.environmentalImpact?.sustainabilityRating ?? "—"}
          </div>
        </div>
          </div>

          {/* Secondary metrics */}
          <ul className="space-y-2 text-sm text-teal-200 font-semibold mb-4">
        <li>
          🌍 Groundwater dependency reduced by{" "}
          <span className="text-teal-300">
            {report?.environmentalImpact?.groundwaterDependencyReduction_pct != null
          ? `${report.environmentalImpact.groundwaterDependencyReduction_pct}%`
          : "—"}
          </span>
        </li>
        <li>
          💧 Per person water saved / year:{" "}
          <span className="text-teal-300">
            {report?.environmentalImpact?.perCapitaWaterSaved_litres_per_year != null
          ? `${report.environmentalImpact.perCapitaWaterSaved_litres_per_year.toLocaleString()} L`
          : "—"}
          </span>
        </li>
        <li>
          🏠 Equivalent households served:{" "}
          <span className="text-teal-300">
            {report?.environmentalImpact?.householdsEquivalentWaterServed != null
          ? report.environmentalImpact.householdsEquivalentWaterServed.toLocaleString()
          : "—"}
          </span>
        </li>
        <li>
          ⚡ Energy saved / year:{" "}
          <span className="text-teal-300">
            {report?.environmentalImpact?.energySaved_kWh_per_year != null
          ? `${report.environmentalImpact.energySaved_kWh_per_year.toLocaleString()} kWh`
          : "—"}
          </span>
        </li>
          </ul>

          {/* Description bullets from backend, fallback to static copy */}
          <div className="border-t border-teal-800/60 pt-3 mt-3">
        <p className="text-slate-300 mb-2 text-sm">
          {t("impactDescription")}:
        </p>
        <ul className="space-y-1.5 text-xs text-teal-100">
          {report?.environmentalImpact?.descriptionBullets &&
          report.environmentalImpact.descriptionBullets.length > 0 ? (
            report.environmentalImpact.descriptionBullets.map((line, idx) => (
          <li key={idx} className="flex gap-2">
            <span>•</span>
            <span>{line}</span>
          </li>
            ))
          ) : (
            <>
          <li>• Reduce dependency on groundwater sources</li>
          <li>• Save potable water through rooftop harvesting</li>
          <li>• Recharge local aquifers and improve resilience</li>
          <li>• Lower energy demand for pumping and treatment</li>
            </>
          )}
        </ul>
          </div>
        </div>
      </div>
      {/* Cost Estimation & Cost-Benefit Analysis */}
      <div className="mt-12 mb-12">
        <h4 className="text-2xl font-semibold text-amber-400 mb-6 border-b border-amber-700 pb-2">
          Cost Estimation & Benefits
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Installation & Maintenance Cost */}
          <div className="bg-gradient-to-br from-amber-900/60 to-slate-900/80 p-6 rounded-2xl border border-amber-700 shadow-lg">
            <h5 className="text-xl font-bold text-amber-400 mb-4">
              Estimated Costs
            </h5>
            <ul className="space-y-3 text-sm text-slate-200">
              <li className="flex justify-between">
                <span>Installation Cost (CAPEX):</span>
                <span className="font-semibold text-slate-100">
                  {/* Prefer Firestore costBenefit, then older costEstimate, then default */}
                  {report?.costBenefit?.installationCost_INR
                    ? `₹ ${report.costBenefit.installationCost_INR.toLocaleString()}`
                    : report?.costEstimate?.CAPEX
                    ? `₹ ${report.costEstimate.CAPEX.toLocaleString()}`
                    : "₹ 1,20,000"}
                </span>
              </li>

              {/* Material & labour cost from old costEstimate, kept optional */}
              {report?.costEstimate?.materialCost && (
                <li className="flex justify-between">
                  <span>Material Cost:</span>
                  <span className="font-semibold text-slate-100">
                    ₹ {report.costEstimate.materialCost.toLocaleString()}
                  </span>
                </li>
              )}
              {report?.costEstimate?.labourCost && (
                <li className="flex justify-between">
                  <span>Labour Cost:</span>
                  <span className="font-semibold text-slate-100">
                    ₹ {report.costEstimate.labourCost.toLocaleString()}
                  </span>
                </li>
              )}

              <li className="flex justify-between">
                <span>Annual Maintenance:</span>
                <span className="font-semibold text-slate-100">
                  {report?.costBenefit?.annualMaintenance_INR
                    ? `₹ ${report.costBenefit.annualMaintenance_INR.toLocaleString()}`
                    : "₹ 5,000"}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Expected Lifespan:</span>
                <span className="font-semibold text-slate-100">
                  {report?.costBenefit?.expectedLifespan_years
                    ? `${report.costBenefit.expectedLifespan_years}+ Years`
                    : "15+ Years"}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Net Upfront Cost (after subsidy):</span>
                <span className="font-semibold text-slate-100">
                  {report?.costBenefit?.netUpfrontCostAfterSubsidy_INR
                    ? `₹ ${report.costBenefit.netUpfrontCostAfterSubsidy_INR.toLocaleString()}`
                    : "—"}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Subsidy Amount:</span>
                <span className="font-semibold text-slate-100">
                  {report?.costBenefit?.subsidyAmount_INR
                    ? `₹ ${report.costBenefit.subsidyAmount_INR.toLocaleString()}`
                    : "—"}
                </span>
              </li>
            </ul>
          </div>

          {/* Cost-Benefit Analysis */}
          <div className="bg-gradient-to-br from-teal-900/60 to-slate-900/80 p-6 rounded-2xl border border-teal-700 shadow-lg">
            <h5 className="text-xl font-bold text-teal-400 mb-4">
              Benefits & Savings
            </h5>
            <ul className="space-y-3 text-sm text-slate-200">
              <li className="flex justify-between">
                <span>Annual Water Bill Savings:</span>
                <span className="font-semibold text-slate-100">
                  {report?.costBenefit?.annualWaterBillSavings_INR
                    ? `₹ ${report.costBenefit.annualWaterBillSavings_INR.toLocaleString()}`
                    : report?.costEstimate?.annualSavings
                    ? `₹ ${report.costEstimate.annualSavings.toLocaleString()}`
                    : "₹ 25,000"}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Subsidy Eligible:</span>
                <span className="font-semibold text-slate-100">
                  {report?.costBenefit?.subsidyEligible === true
                    ? "Yes"
                    : report?.costBenefit?.subsidyEligible === false
                    ? "No"
                    : "Yes (Up to 30%)"}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Payback Period:</span>
                <span className="font-semibold text-slate-100">
                  {report?.costBenefit?.paybackPeriod_years
                    ? `~ ${report.costBenefit.paybackPeriod_years} Years`
                    : report?.costEstimate?.paybackPeriod
                    ? `~ ${report.costEstimate.paybackPeriod} Years`
                    : "~ 4.5 Years"}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Return on Investment (10 Yrs):</span>
                <span className="font-semibold text-slate-100">
                  {report?.costBenefit?.roi10yr_multiple
                    ? `${report.costBenefit.roi10yr_multiple.toFixed(1)}x`
                    : report?.costEstimate?.paybackPeriod &&
                      report.costEstimate.paybackPeriod > 0
                    ? `${(10 / report.costEstimate.paybackPeriod).toFixed(1)}x`
                    : "3.2x"}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ROI */}
      <div className="bg-gradient-to-r from-teal-900/60 to-indigo-900/60 p-6 rounded-2xl border border-teal-700 shadow-xl hover:scale-[1.01] transition">
        <h4 className="text-xl font-semibold text-teal-300">
          ⏳ {t("roiHeading")}
        </h4>
        <p className="text-lg mt-2 text-slate-200">
          Your system will pay for itself in around{" "}
          <span className="text-teal-400 font-bold">
            {report?.costBenefit?.paybackPeriod_years
              ? `${report.costBenefit.paybackPeriod_years} years`
              : report?.costEstimate?.paybackPeriod
              ? `${report.costEstimate.paybackPeriod} years`
              : "2 years"}
          </span>.
        </p>
      </div>

      {/* Benefits */}
      <div className="mt-12">
        <h4 className="text-2xl font-bold text-teal-400 mb-6 flex items-center gap-2">
          🌟 {t("keyBenefits")}
        </h4>
        <p className="text-slate-300 mb-4">
          Discover the transformative advantages of adopting a rainwater harvesting system. From cost savings to environmental impact, here’s why it’s a game-changer:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
        {
          title: "Save on Water Bills",
          description: "Reduce your water expenses by up to 40% annually with efficient rainwater utilization.",
          icon: "💧",
        },
        {
          title: "Recharge Groundwater",
          description: "Help replenish local aquifers and contribute to sustainable water management.",
          icon: "🌍",
        },
        {
          title: "Eco-Friendly Solution",
          description: "Adopt a green initiative that reduces dependency on municipal water supply.",
          icon: "🌱",
        },
        {
          title: "Subsidy Benefits",
          description: "Eligible for government subsidies, making it a cost-effective investment.",
          icon: "💸",
        },
        {
          title: "IoT Monitoring",
          description: "Leverage smart IoT solutions for real-time water usage tracking and analytics.",
          icon: "📡",
        },
        {
          title: "Drought Resilience",
          description: "Ensure water availability during dry spells and build resilience against climate change.",
          icon: "☀️",
        },
          ].map((benefit, i) => (
        <div
          key={i}
          className="relative p-6 rounded-2xl bg-gradient-to-br from-sky-950/70 to-slate-700 border border-slate-600 shadow-lg hover:shadow-xl transition transform hover:scale-105"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">{benefit.icon}</span>
            <h5 className="text-lg font-bold text-teal-300">{benefit.title}</h5>
          </div>
          <p className="text-slate-400 mt-2">{benefit.description}</p>
        </div>
          ))}
        </div>
      </div>

      {/* What-If Analysis */}
      {/* <div className="mt-10">
        <h3
          className="text-lg font-semibold mb-4 text-indigo-300"
          id="what-if"
          data-tab="assessment"
        >
          {t("whatIfAnalysis")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/60 to-slate-900/80 border border-indigo-700 shadow-md">
            <h3 className="text-lg font-semibold text-indigo-300">{t("doubleRooftopArea")}</h3>
            <p className="text-xl font-bold text-indigo-400 mt-2">
              30,000 Liters / Year
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-900/60 to-slate-900/80 border border-pink-700 shadow-md">
            <h3 className="text-lg font-semibold text-pink-300">{t("reduceDwellers")}</h3>
            <p className="text-xl font-bold text-pink-400 mt-2">
              4,000 Liters / Person
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-900/60 to-slate-900/80 border border-amber-700 shadow-md">
            <h3 className="text-lg font-semibold text-amber-400">{t("addStorageTank")}</h3>
            <p className="text-xl font-bold text-amber-400 mt-2">
              5,000 Liters Extra Capacity
            </p>
          </div> */}
        {/* </div> */}
      {/* </div> */}
    </div>
  );
};

export default Assessment;

export function FeasibilityCardSimple({ report }: { report: ReportData | null }) {
  if (!report) return null;

  const topStruct =
    report.recommendedStructures && report.recommendedStructures.length > 0
      ? report.recommendedStructures[0]
      : null;

  const pit = report.recommendedDimensions?.pit;

  return (
    <div className="p-4 bg-slate-800 rounded text-white max-w-lg">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm text-gray-300">Feasibility</div>
          <div className="text-2xl font-bold">{report.feasibilityScore} / 100</div>
        </div>
        <div className="px-3 py-1 rounded bg-blue-600">{report.category}</div>
      </div>

      <div className="mt-3 text-sm text-gray-300">
        <div>
          Capture/year: <strong>{report.litres_per_year.toLocaleString()} L</strong>
        </div>
        {topStruct && (
          <div className="mt-2">
            Top suggestion: <strong>{topStruct.type}</strong>
          </div>
        )}
      </div>

      {pit && (
        <div className="mt-3 text-sm">
          <div>
            Recommended pit: {pit.diameter} {pit.unit} diameter × {pit.depth} {pit.unit} depth
          </div>
        </div>
      )}
    </div>
  );
}