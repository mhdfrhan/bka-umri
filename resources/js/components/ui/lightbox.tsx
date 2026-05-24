import * as React from "react"
import LightboxComponent from "yet-another-react-lightbox"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"

export interface LightboxProps {
  open: boolean
  close: () => void
  slides: { src: string; alt?: string; description?: string }[]
  index?: number
}

export function Lightbox({ open, close, slides, index = 0 }: LightboxProps) {
  return (
    <LightboxComponent
      open={open}
      close={close}
      slides={slides}
      index={index}
      plugins={[Zoom]}
      carousel={{ padding: 0, spacing: 0, imageFit: "contain" }}
      animation={{ fade: 200, swipe: 250 }}
      styles={{
        container: { backgroundColor: "rgba(0, 0, 0, 0.9)" },
      }}
    />
  )
}
