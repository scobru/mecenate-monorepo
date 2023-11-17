import type { NextPage } from "next";
import React, { useEffect } from "react";
import { SismoConnectButton, SismoConnectResponse, SismoConnectVerifiedResult } from "@sismo-core/sismo-connect-react";
import { CONFIG, AUTHS, SIGNATURE_REQUEST } from "../sismo.config";
import Spinner from "~~/components/Spinner";

const Verify: NextPage = () => {
  const [sismoConnectVerifiedResult, setSismoConnectVerifiedResult] = React.useState<SismoConnectVerifiedResult>();
  const [sismoConnectResponse, setSismoConnectResponse] = React.useState<SismoConnectResponse>();
  const [responseBytes, setResponseBytes] = React.useState<string>();
  const [sismoData, setSismoData] = React.useState<any>(null);
  const [pageState, setPageState] = React.useState<string>("init");
  const [error, setError] = React.useState<string>();

  /* *************************  Reset state *****************************/
  function resetApp() {
    resetLocalStorage();
    window.location.href = "/verify";
  }
  const resetLocalStorage = async function resetLocalStorage() {
    localStorage.removeItem("verified");
    localStorage.removeItem("sismoData");
    localStorage.removeItem("sismoResponse");
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(String(responseBytes));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">

      <div className="max-w-3xl text-center my-2 text-base-content">
        <div className="flex flex-col  items-center mb-20">
          <div className="text-center w-full">
            {pageState == "init" && !sismoData ? (
              <>
                <div className="text-center sm:p-2 lg:p-4">
                  <SismoConnectButton
                    config={CONFIG}
                    auths={AUTHS}
                    signature={SIGNATURE_REQUEST}
                    text="Join With Sismo"
                    onResponse={async (response: SismoConnectResponse) => {
                      console.log("Verify");

                      setSismoConnectResponse(response);

                      setPageState("verifying");
                      try {
                        const verifiedResult = await fetch("/api/verify", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            ...response,
                          }),
                        });

                        const data = await verifiedResult.json();

                        if (verifiedResult.ok) {
                          setSismoConnectVerifiedResult(data);
                          localStorage.setItem("sismoData", JSON.stringify(await data));
                          setPageState("verified");
                        } else {
                          setPageState("error");
                          setError(data.error.toString()); // or JSON.stringify(data.error)
                        }
                      } catch (error) {
                        console.error("Error:", error);
                        setPageState("error");
                        setError(error as any);
                      }
                    }}
                    onResponseBytes={async (responseBytes: string) => {
                      setResponseBytes(responseBytes);
                      localStorage.setItem("sismoResponse", responseBytes);
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  {pageState == "verifying" ? (
                    <div className="text-center items-center flex flex-row gap-3">
                      <Spinner></Spinner>{" "}
                      <div className="text-blue-500 text-center font-semibold">Verifying ZK Proofs...</div>
                    </div>
                  ) : (
                    <>
                      {Boolean(error) ? (
                        <div className="text-red-500 font-bold">Error verifying ZK Proofs: {error}</div>
                      ) : (
                        <div className="flex flex-col ">
                          <button className="btn btn-custom" onClick={resetApp}>
                            RESET
                          </button>
                          {responseBytes && (
                            <div className="flex flex-col items-center justify-center break-all">
                              <button className="btn btn-ghost my-5" onClick={handleCopy}>
                                Copy to clipboard
                              </button>
                              {responseBytes}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;
