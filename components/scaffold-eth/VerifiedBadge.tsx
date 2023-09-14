import { useEffect } from "react";
import React from "react";

type TVerifiedProps = {
  verified?: string;
};

export default function VerifiedBadge({ verified }: TVerifiedProps) {
  const [newVerified, setNewVerified] = React.useState("");

  useEffect(() => {
    if (verified == "verified") {
      setNewVerified("verified");
    }
  }, [verified]);

  return (
    <>
      <div className="badge badge-primary p-4 hover:text-black w-fit  hover:bg-success rounded-full">
        <span className="font-semibold "> Verified</span>
        {newVerified == "verified" ? (
          <div className="badge-success ml-2">✅</div>
        ) : (
          <div className="badge-error ml-2">❌</div>
        )}
      </div>
    </>
  );
}
