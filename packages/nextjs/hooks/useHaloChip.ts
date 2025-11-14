"use client";

import { useState } from "react";
import { execHaloCmdWeb } from "@arx-research/libhalo/api/web";

// Utility to recursively convert BigInt values to strings for JSON serialization
const serializeBigInt = (obj: any): any => {
  if (typeof obj === "bigint") return obj.toString();
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, serializeBigInt(v)]));
};

// Helper function to provide user-friendly error messages for Web NFC errors
const getErrorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return "NFC operation failed";
  }

  const errorMessage = error.message;
  const errorName = error.name;

  // Check for HTTPS/domain issues
  if (typeof window !== "undefined") {
    const isSecureContext = window.isSecureContext;
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    if (!isSecureContext || protocol !== "https:") {
      return "Web NFC requires HTTPS. Please access this page via HTTPS (not HTTP).";
    }

    // Check if using IP address (not allowed for Web NFC)
    const ipAddressRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipAddressRegex.test(hostname)) {
      return "Web NFC requires a domain name (not an IP address). Please use ngrok or a local domain name. See WEB_NFC_SETUP.md for setup instructions.";
    }
  }

  // Handle specific WebAuthn/Web NFC errors
  if (errorName === "NotAllowedError" || errorMessage.includes("NotAllowedError")) {
    if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
      return "NFC operation timed out. Please hold your device near the NFC chip and try again.";
    }
    return "NFC operation was not allowed. Please grant permission when prompted, or ensure your device supports NFC and try again.";
  }

  if (errorName === "SecurityError" || errorMessage.includes("SecurityError")) {
    if (errorMessage.includes("domain") || errorMessage.includes("effective domain")) {
      return "Invalid domain for Web NFC. Please use a valid domain name (not an IP address). See WEB_NFC_SETUP.md for setup instructions.";
    }
    return "Security error: " + errorMessage;
  }

  if (errorName === "NotSupportedError" || errorMessage.includes("not supported")) {
    return "Web NFC is not supported in this browser or device. Please use a supported browser (Chrome/Edge on Android, or Safari on iOS 13+).";
  }

  // Return the original error message if we can't provide a better one
  return errorMessage || "NFC operation failed";
};

export function useHaloChip() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signMessage = async ({
    message,
    digest,
    format,
  }: {
    message?: string;
    digest?: string;
    format?: "text" | "hex";
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const command: any = {
        name: "sign",
        keyNo: 1,
      };

      // Use either message (with optional format) or digest (raw hash)
      if (digest) {
        command.digest = digest;
      } else if (message) {
        command.message = message;
        if (format) {
          command.format = format;
        }
      } else {
        throw new Error("Either message or digest must be provided");
      }

      const result = await execHaloCmdWeb(command);
      return {
        address: result.etherAddress,
        signature: result.signature.ether, // Ethereum-formatted signature string
      };
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const signTypedData = async ({ domain, types, primaryType, message }: any) => {
    setIsLoading(true);
    setError(null);
    try {
      // HaloTag EIP-712 structure per libhalo docs
      const typedDataPayload = {
        domain,
        types,
        primaryType,
        value: serializeBigInt(message), // libhalo uses 'value' not 'message'
      };

      console.log(
        "📝 EIP-712 Typed Data Payload:",
        JSON.stringify(typedDataPayload, (_, v) => (typeof v === "bigint" ? v.toString() : v), 2),
      );

      const result = await execHaloCmdWeb({
        name: "sign",
        keyNo: 1,
        typedData: typedDataPayload,
      });

      console.log("✅ HaloTag signature result:", result);

      return {
        address: result.etherAddress,
        signature: result.signature.ether,
      };
    } catch (err) {
      console.error("❌ HaloTag signTypedData error:", err);
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return { signMessage, signTypedData, isLoading, error };
}
