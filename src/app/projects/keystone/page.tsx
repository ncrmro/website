import ProjectLayout from "../ProjectLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keystone - Nicholas Romero",
  description:
    "NixOS-based infrastructure platform for secure, encrypted systems",
};

export default function KeystonePage() {
  return (
    <ProjectLayout
      title="Keystone"
      description="GitHub ncrmro/keystone"
      url="https://github.com/ncrmro/keystone"
    >
      <p className="py-1">
        Keystone is a NixOS-based infrastructure platform designed to deploy
        secure, encrypted systems across various hardware types. It emphasizes
        declarative configuration and reproducibility with integrated hardware
        security features.
      </p>
      <p className="py-1">Key features include:</p>
      <ul className="list-disc list-inside py-1 space-y-1">
        <li>Full disk encryption with TPM2 auto-unlock</li>
        <li>Secure Boot with custom key enrollment</li>
        <li>ZFS storage with native encryption and snapshots</li>
        <li>Portable configs—migrate between bare-metal and cloud seamlessly</li>
      </ul>
    </ProjectLayout>
  );
}
