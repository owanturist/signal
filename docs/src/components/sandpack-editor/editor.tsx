"use client"

import dynamic from "next/dynamic"

import type { Props } from "./_impl"

const SandpackImplLazy = dynamic(() => import("./_impl").then((m) => m.SandpackImpl), {
  ssr: false,
})

export function SandpackEditor({ height = 600, ...props }: Props) {
  return (
    <div
      style={{
        height,
        backgroundColor: "#151515",
        border: "1px solid #2c2c2c",
        borderRadius: 4,
      }}
    >
      <SandpackImplLazy height={height} {...props} />
    </div>
  )
}
