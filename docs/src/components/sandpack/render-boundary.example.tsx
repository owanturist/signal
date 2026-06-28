// @ts-nocheck

//#region code
import { useEffect, useRef } from "react"

export function RenderBoundary({ name, style, children, ...rest }) {
  const ref = useRef(null)

  useEffect(() => {
    const animation = ref.current?.animate({ "--rb-color": ["red", "gray"] }, { duration: 600 })

    return () => animation?.cancel()
  })

  return (
    <div
      ref={ref}
      style={{
        "--rb-color": "gray",
        "--rb-bg": "color-mix(in srgb, var(--rb-color) 10%, transparent)",
        "--rb-border": "color-mix(in srgb, var(--rb-color) 20%, transparent)",
        position: "relative",
        backgroundColor: "var(--rb-bg)",
        border: "1px solid var(--rb-border)",
        borderRadius: 4,
        padding: "16px 12px 12px",
        marginTop: 4,
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          position: "absolute",
          top: -8,
          left: 8,
          fontSize: 10,
          lineHeight: "16px",
          padding: "0 4px",
          backgroundColor: "#ccc",
          borderRadius: 2,
          color: "#888",
          fontFamily: "monospace",
        }}
      >
        {name}
      </span>
      {children}
    </div>
  )
}
//#endregion code
