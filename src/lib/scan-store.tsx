import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AnalysisResult, ConcernKey } from "./concerns";
import type { Landmark } from "./face-landmarks";

export type PhotoAngle = "front" | "left" | "right";

interface ScanState {
  photos: Record<PhotoAngle, string | null>;
  /** normalized (0..1) facelandmarker points for the front photo, or null. */
  frontLandmarks: Landmark[] | null;
  ageRange: string | null;
  concerns: ConcernKey[];
  email: string;
  consent: boolean;
  result: AnalysisResult | null;
  scanId: string | null;
  setPhoto: (angle: PhotoAngle, dataUrl: string | null) => void;
  setFrontLandmarks: (pts: Landmark[] | null) => void;
  setAgeRange: (v: string | null) => void;
  toggleConcern: (k: ConcernKey) => void;
  setEmail: (v: string) => void;
  setConsent: (v: boolean) => void;
  setResult: (r: AnalysisResult | null, scanId: string | null) => void;
  reset: () => void;
}

const ScanContext = createContext<ScanState | null>(null);

const EMPTY = { front: null, left: null, right: null };

export function ScanProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<Record<PhotoAngle, string | null>>({ ...EMPTY });
  const [frontLandmarks, setFrontLandmarksState] = useState<Landmark[] | null>(null);
  const [ageRange, setAgeRange] = useState<string | null>(null);
  const [concerns, setConcerns] = useState<ConcernKey[]>([]);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [result, setResultState] = useState<AnalysisResult | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);

  const setPhoto = useCallback(
    (angle: PhotoAngle, dataUrl: string | null) => {
      setPhotos((p) => ({ ...p, [angle]: dataUrl }));
      // landmarks belong to the specific front photo — clear on change.
      if (angle === "front") setFrontLandmarksState(null);
    },
    [],
  );

  const setFrontLandmarks = useCallback(
    (pts: Landmark[] | null) => setFrontLandmarksState(pts),
    [],
  );

  const toggleConcern = useCallback(
    (k: ConcernKey) =>
      setConcerns((c) => (c.includes(k) ? c.filter((x) => x !== k) : [...c, k])),
    [],
  );

  const setResult = useCallback((r: AnalysisResult | null, id: string | null) => {
    setResultState(r);
    setScanId(id);
  }, []);

  const reset = useCallback(() => {
    setPhotos({ ...EMPTY });
    setFrontLandmarksState(null);
    setAgeRange(null);
    setConcerns([]);
    setEmail("");
    setConsent(false);
    setResultState(null);
    setScanId(null);
  }, []);

  const value = useMemo(
    () => ({
      photos,
      frontLandmarks,
      ageRange,
      concerns,
      email,
      consent,
      result,
      scanId,
      setPhoto,
      setFrontLandmarks,
      setAgeRange,
      toggleConcern,
      setEmail,
      setConsent,
      setResult,
      reset,
    }),
    [photos, frontLandmarks, ageRange, concerns, email, consent, result, scanId, setPhoto, setFrontLandmarks, setAgeRange, toggleConcern, setEmail, setConsent, setResult, reset],
  );

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScan(): ScanState {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error("useScan must be used inside ScanProvider");
  return ctx;
}

export const AGE_RANGES = ["under 25", "25 to 34", "35 to 44", "45 to 54", "55 plus"];
